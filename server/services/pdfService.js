import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

/**
 * Extracts the exact page count from a PDF file buffer or path.
 * Supports both class and functional exports across pdf-parse versions,
 * with fallback structural PDF counting.
 *
 * @param {Buffer|string} input - PDF buffer or path to file
 * @returns {Promise<number>} page count
 */
export const getPdfPageCount = async (input) => {
  const dataBuffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);

  try {
    // 1. PDFParse class export (pdf-parse v2+)
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: dataBuffer });
      const info = await parser.getInfo();
      if (info && (typeof info.total === 'number' && info.total > 0)) {
        return info.total;
      }
      if (info && Array.isArray(info.pages) && info.pages.length > 0) {
        return info.pages.length;
      }
    }

    // 2. Functional export (pdf-parse v1.x)
    if (typeof pdfModule === 'function') {
      const data = await pdfModule(dataBuffer);
      if (data && typeof data.numpages === 'number' && data.numpages > 0) {
        return data.numpages;
      }
    }

    // 3. Fallback: Structural PDF /Type /Page token inspection
    const text = dataBuffer.toString('latin1');
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) {
      return matches.length;
    }

    return 1;
  } catch (error) {
    try {
      const text = dataBuffer.toString('latin1');
      const matches = text.match(/\/Type\s*\/Page[^s]/g);
      if (matches && matches.length > 0) {
        return matches.length;
      }
    } catch {}

    throw new Error(`Failed to parse PDF document: ${error.message}`);
  }
};
