const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Disable standard font loading and rendering features we don't need for pure text extraction
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.js';

/**
 * Extracts text from a PDF buffer reliably across all pages.
 * @param {Buffer} buffer - The raw PDF file buffer
 * @returns {Promise<{text: string, pages: number}>}
 */
async function extractTextFromPDF(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      
      // Combine text items with spaces
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
        
      fullText += pageText + '\n\n';
    }

    const cleanText = fullText.trim();
    
    if (!cleanText) {
      throw new Error('Extracted text is empty');
    }

    return {
      text: cleanText,
      pages: numPages
    };
  } catch (err) {
    console.error('[PDF Parser] Fatal error during extraction:', err.message);
    throw new Error('Unable to extract text from PDF');
  }
}

module.exports = { extractTextFromPDF };
