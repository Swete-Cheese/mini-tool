import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const MARGIN_X = 10;
const MARGIN_Y = 15;
const OVERLAP_PX = 10;

function findBreakRow(
  imageData: ImageData,
  idealY: number,
  searchRange: number,
  canvasWidth: number
): number {
  const { data } = imageData;
  const maxY = Math.min(idealY + searchRange, imageData.height - 1);
  const minY = Math.max(idealY - searchRange, 0);

  let bestY = idealY;
  let bestWhiteness = 0;

  for (let y = minY; y < maxY; y++) {
    let whitePixels = 0;
    const rowStart = y * canvasWidth * 4;
    for (let x = 0; x < canvasWidth; x++) {
      const idx = rowStart + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r > 250 && g > 250 && b > 250) {
        whitePixels++;
      }
    }
    const whiteness = whitePixels / canvasWidth;
    if (whiteness > bestWhiteness) {
      bestWhiteness = whiteness;
      bestY = y;
    }
  }

  // Only use the found break if it's significantly white (paragraph gap or margin)
  if (bestWhiteness > 0.85) return bestY;
  return idealY;
}

async function canvasToPdf(
  canvas: HTMLCanvasElement,
  pdf: jsPDF
): Promise<void> {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pdfWidth - 2 * MARGIN_X;
  const contentHeight = pdfHeight - 2 * MARGIN_Y;

  const scale = contentWidth / canvas.width;
  const contentHeightPx = contentHeight / scale;

  // Get image data for break detection
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const searchRange = Math.floor(contentHeightPx * 0.15);

  let currentY = 0;
  let page = 0;

  while (currentY < canvas.height) {
    if (page > 0) pdf.addPage();

    let sliceEnd: number;
    if (currentY + contentHeightPx >= canvas.height) {
      sliceEnd = canvas.height;
    } else {
      sliceEnd = findBreakRow(imageData, currentY + contentHeightPx, searchRange, canvas.width);
    }

    const sliceHeight = sliceEnd - currentY;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const sliceCtx = sliceCanvas.getContext('2d')!;
    sliceCtx.drawImage(
      canvas,
      0, currentY, canvas.width, sliceHeight,
      0, 0, canvas.width, sliceHeight
    );

    const sliceData = sliceCanvas.toDataURL('image/png');
    const sliceImgHeight = (sliceHeight / canvas.width) * contentWidth;

    pdf.addImage(sliceData, 'PNG', MARGIN_X, MARGIN_Y, contentWidth, sliceImgHeight);

    currentY = sliceEnd - OVERLAP_PX;
    page++;
  }
}

export async function generatePdf(
  previewElement: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  await canvasToPdf(canvas, pdf);
  pdf.save(`${filename}.pdf`);
}

export async function generatePdfDataUrl(
  previewElement: HTMLElement
): Promise<string> {
  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  await canvasToPdf(canvas, pdf);
  return pdf.output('datauristring');
}
