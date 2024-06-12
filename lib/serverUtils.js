import { attestationDecoder } from '@authenticvision/attestation';


// These are server-side utils
// This is important, because some data types are not available client-side, e.g. the KeyObject in util/types
// referenced by paseto
// Similar, node-cache etc.

/**
 * Decode an attestation. Per default, do NOT redeem it, because redemption is usually only needed in the
 * API.
 * @param {*} attestation 
 * @param {*} param1 
 * @returns attestation, if decodeable
 */
export async function decodeAttestation(attestation) {
	// Typically, a GET-Parameter 'av_sip' is carrying the attestation token
	// We assume to have a NodeJS-Request object 'req' available.
	const token = attestation
	if(token) {
		try {

			if(process.env.ATTESTATION_DEV_KEY) {
				const jKey = JSON.parse(process.env.ATTESTATION_DEV_KEY)
				const kid = jKey?.kid;
				const pub = jKey?.pubkey;
				console.log(pub)
				// Log to error to make sure every productive monitoring system screams
				console.error(`Attestation Developer-Key ${kid} added`)
				attestationDecoder.addKey(kid, pub);
			}
			//console.error("THE DEVELOPMENT KEY IS STILL THERE!!")
			const attestation = await attestationDecoder.decode(token, {noRedeem: true}, {ignoreExp:true});
			return attestation
		} catch(e) {
				// Key not found, token expired, already redeemed before, .... 
				console.error(e); 
		}
	}
	return null;
}