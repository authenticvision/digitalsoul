import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/lib/prisma'
import { jsonify } from '@/lib/utils';
import { checkAllowedMethods } from '@/lib/apiHelpers';

const allowedMethods = ['PUT']


// Updates contract settings in a way s.t. it preserves values under keys, which are not present in newSettings
const updateContractSettings = async (contract, newSettings) => {
	const oldSettings = contract.settings;
	const mergedSettings = Object.assign({}, oldSettings, newSettings);
	
	// Find keys that were kept unchanged
	const unchangedKeys = Object.keys(oldSettings).filter(
		key => !(key in newSettings)
	);

	if(unchangedKeys.length > 0) {
		console.log(`Settings-Update (csn=${contract.csn}): Preserve settings under keys ${unchangedKeys}`)
	}


	const updatedSettings = await prisma.Contract.update({
		where: {
			id: contract.id
		},
		data: {
			settings: mergedSettings,
			updatedAt: new Date()
		}
	})
}

const updateTheme = async (contract, newTheme) => {
	const updatedSettings = await prisma.Contract.update({
		where: {
			id: contract.id
		},
		data: {
			design: {
				update: {
					theme: newTheme,
					updatedAt: new Date(),
				}
			}
		}
	})
}

const createDesignIfNotExists = async (contract, session) => {
	if(contract.design) {
		return contract;
	}

	console.log(`Create design entry for ${contract.csn}..`)
	await prisma.design.create({
		data: {
			theme: {},
			contract: { connect: { id: contract.id } }
		}
	});

	return loadContract(contract.csn, session);
}


const updateLogo = async (contract, newLogo) => {
	const updatedSettings = await prisma.Contract.update({
		where: {
			id: contract.id
		},
		data: {
			design: {
				update: {
					logoAssetId: newLogo.id,
					updatedAt: new Date(),
				}
			}
		}
	})
}

const loadContract = async (csn, session) => {
	const contract = await prisma.Contract.findFirst({
		where: {
			csn: csn,
      owner: session?.wallet	
		}, 
		include: {
			design : {
				include: {
					logo: true,
				}
			}
		}
	})

	return await createDesignIfNotExists(contract, session);;

}

export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	if (!await checkAllowedMethods(req, res, allowedMethods)) return;

	const { csn } = req.query

	const { 
		contractSettings: contractSettings, 
		theme: theme, 
		logo: logo,
	} = req.body

	const contract = await loadContract(csn, session);

	if (!contract) {
		return res.status(404).json({ message: 'Contract does not exist' })
	}

	try {
		if(contractSettings) {
			const jContractSettings = jsonify(contractSettings);
			if(!jContractSettings) {
				return res.status(422).json({message: 'Contract Settings is no valid JSON'});
			}
			updateContractSettings(contract, jContractSettings);
		}

		if (theme) {
			const jTheme = jsonify(theme);

			if(!jTheme) {
				return res.status(422).json({message: 'Theme is no valid JSON'});
			}
			updateTheme(contract, jTheme);
		}

		if (logo) {
			updateLogo(contract, jsonify(logo));
		}

	} catch (err) {
		console.error(err)
		return res.status(500).json({
			message: 'There were some errors when updating the contract',
		})
	}

	return res.status(200).json({ ... await loadContract(csn, session) })
}
