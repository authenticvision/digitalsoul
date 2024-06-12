import { getServerSession } from 'next-auth/next'
import prisma from '@/lib/prisma'
import MetaAnchor from '@/lib/api.metaanchor.io'
import { checkAllowedMethods } from '@/lib/apiHelpers';
import { generateAssetURL } from '@/lib/utils';

const allowedMethods = ['GET']

// Note although internal, this does *not* have access control via server-sessions
// and exposes public information

export default async function handle(req, res) {
  if (!await checkAllowedMethods(req, res, allowedMethods)) return;

	const { csn } = req.query
  const contract = await prisma.contract.findFirst({
      where: {
          csn: {equals: csn, mode: "insensitive"}
      },
      include: {
        design: {
          include: {
            logo: true
          }
        }
      }
  })

  if(!contract) {
    return res.status(404).json({error: `csn=${csn} not found`});
  }

  const assetURL = contract.design?.logo ? generateAssetURL(contract.csn, contract.design.logo.assetHash) : null

  // Explicitely list what is public here to not accidentially leak serverside-intel
  const publicLandingSettings = {
    logo: assetURL,
    auto_claim: contract?.settings?.AUTO_CLAIM || false,
  }

  // TODO get default design
	return res.json({ ...publicLandingSettings })
}
