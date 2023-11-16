import express from 'express';
import {fileTypeFromBuffer} from 'file-type';
import {readChunk} from 'read-chunk';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { externalResolver: true }
};

const handler = express();

// Middleware to determine and set the MIME type
async function setMimeType(req, res, next) {
  const filePath = path.join(process.env.STORAGE_DIR, req.path);

  try {
	
	// Best-practice from docs	https://www.npmjs.com/package/file-type
	const buffer = await readChunk(filePath, {length: 4100});
	const fileTypeResult = await fileTypeFromBuffer(buffer);

    if (fileTypeResult) {
      res.setHeader('Content-Type', fileTypeResult.mime);
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  } catch (error) {
    console.error('Error in MIME type detection:', error);
    res.setHeader('Content-Type', 'application/octet-stream');
  }

  next();
}

handler.use(['/api/v1/assets', '/assets'], setMimeType, express.static(process.env.STORAGE_DIR));

export default handler;
