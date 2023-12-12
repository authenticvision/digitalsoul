import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/lib/prisma'
import MetaAnchor from '@/lib/api.metaanchor.io'

const allowedMethods = ['GET']

// TODO MOVE TO UTILS
export const fetchAnchors = async(api, csn) => {
	return await api.getAnchors(csn)
}

export const storeNFTS = async (anchors, contract) => {
    let createdCount = 0; // Counter for newly created NFTs
  
    const nfts = await Promise.all(anchors.map(async (anchor) => {
      // Check if an NFT with the same slid already exists
      const existingNFT = await prisma.NFT.findUnique({
        where: { slid: anchor.slid },
      });
  
      // If it doesn't exist, create a new one
      if (!existingNFT) {
        createdCount++; // Increment the counter
        return await prisma.NFT.create({
          data: {
            slid: anchor.slid,
            anchor: anchor.anchor,
            metadata: undefined, // per default, do not set any metadata
            contract: { connect: { id: contract.id } }
          }
        });
      }
  
      // If it exists, return existing record
      return existingNFT;
    }));
  
    // Fetch the total number of NFTs
    const totalCount = nfts.length
  
    return {
      nfts,        // The array of NFTs (both newly created and existing)
      createdCount,   // Number of newly created NFTs
      totalCount       // Total number of NFTs in the database
    };
  };


export default async function handle(req, res) {
	const session = await getServerSession(req, res, authOptions)
	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	if (!allowedMethods.includes(req.method) || req.method == 'OPTIONS') {
		return res.status(405).json({ message: 'Method not allowed.' })
	}


	const { csn } = req.query
	const config = await prisma.config.findFirst()
    const api = new MetaAnchor({
		apiKey: config.apiKey,
		baseUrl: process.env.METAANCHOR_API_URL
	})
	
    const { data: anchors } = await fetchAnchors(api, csn)
    const contract = await prisma.contract.findFirst({
        where: {
            csn: csn
        }
    })

    if (anchors.length) {
        const {nfts, createdCount, totalCount} = await storeNFTS(anchors, contract)
        console.log(`Added ${createdCount} NFTs of ${csn} to total ${totalCount} NFTs`)
    }

	return res.json({ ...contract })
}
