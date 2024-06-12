import prisma from '@/lib/prisma'
import { checkAllowedMethods } from '@/lib/apiHelpers';

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
        design: true
      }
  })

  if(!contract) {
    return res.status(404).json({error: `csn=${csn} not found`});
  }

  // FIXME error handling!!
  const themeColors = contract.design?.theme ? contract.design?.theme : {}

  // TODO get default design
	return res.json({ ...themeColors });
}
