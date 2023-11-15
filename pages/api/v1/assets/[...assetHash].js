import express from 'express'

export const config = {
	api: { externalResolver: true }
}

const handler = express()

const serveFiles = express.static(process.env.STORAGE_DIR)
handler.use(['/api/v1/assets', '/assets'], serveFiles)

export default handler
