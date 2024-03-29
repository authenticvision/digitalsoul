// utils/apiHelpers.js
import NextCors from "nextjs-cors";

async function checkAllowedMethods(req, res, allowedMethods) {
	const allowedMethodsWithOptions = ["OPTIONS", ...allowedMethods]; // OPTIONS is always allowed
	// Check for allowed HTTP methods
	if (!allowedMethodsWithOptions.includes(req.method)) {
		res.status(405).json({
			message: `Method not allowed.`,
			hint: `Allowed methods: ${allowedMethodsWithOptions}`,
		});
		return false;
	}
	return true;

}

// Utility function to prepare global API settings
async function makePublicEndpoint(req, res, allowedMethods = ["GET"]) {
	const allowedMethodsWithOptions = ["OPTIONS", ...allowedMethods];

	// Initialize CORS with common settings
	await NextCors(req, res, {
		methods: allowedMethodsWithOptions, // Options shall always be allowed
		origin: "*", // Adjust according to your needs
		optionsSuccessStatus: 200,
	});

	return checkAllowedMethods(req, res, allowedMethods)
}

export { makePublicEndpoint };
export { checkAllowedMethods };
