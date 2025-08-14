import { makePublicEndpoint } from '@/lib/apiHelpers';

const allowedMethods = ['GET']


export default async function handle(req, res) {
	if (!await makePublicEndpoint(req, res, allowedMethods)) return;

    const to_return = {
        "GIT_COMMIT": process.env.GIT_COMMIT || "notset",
        "GIT_REF": process.env.GIT_ENV || "notset"
    };	
    
    return res.status(200).json(to_return)	
}
