import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const MARGIN_X = 10;
const MARGIN_Y = 15;

function collectBreakPoints(element: HTMLElement, accumulatedTop: number): number[] {
  const points: number[] = [];

  for (const child of Array.from(element.children)) {
    const el = child as HTMLElement;
    const top = el.offsetTop + accumulatedTop;
    const bottom = top + el.offsetHeight;

    if (el.children.length > 0) {
      points.push(...collectBreakPoints(el, top));
    }
    points.push(bottom);
  }

  return points.filter((y, i, arr) => i === 0 || y - arr[i - 1] > 5);
}

function findBestBreak(
  idealY: number,
  breakPoints: number[],
  canvasHeight: number
): number {
  // Sort break points ascending
  const sorted = [...breakPoints].sort((a, b) => a - b);

  // Find the closest break point BEFORE the ideal position
  let best = idealY;
  for (const point of sorted) {
    if (point >= idealY) {
      // If we found one past ideal, use the previous one (if close enough)
      if (best !== idealY) break;
      // If first point is already past ideal, just use ideal
      break;
    }
    best = point;
  }

  // Don't go too far from ideal (max 200px back)
  if (idealY - best > 200) return idealY;

  return best;
}

async function renderToPdf(
  previewElement: HTMLElement,
  pdf: jsPDF
): Promise<void> {
  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // Collect break points from DOM structure
  const breakPoints = collectBreakPoints(previewElement, 0);

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pdfWidth - 2 * MARGIN_X;
  const contentHeight = pdfHeight - 2 * MARGIN_Y;
  const scale = contentWidth / canvas.width;
  const contentHeightPx = contentHeight / scale;

  let currentY = 0;
  let page = 0;

  while (currentY < canvas.height) {
    if (page > 0) pdf.addPage();

    const idealEnd = currentY + contentHeightPx;
    let sliceEnd: number;

    if (idealEnd >= canvas.height) {
      sliceEnd = canvas.height;
    } else {
      sliceEnd = findBestBreak(idealEnd, breakPoints, canvas.height);
    }

    const sliceHeight = Math.min(sliceEnd - currentY, canvas.height - currentY);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const sliceCtx = sliceCanvas.getContext('2d')!;
    sliceCtx.drawImage(
      canvas,
      0, currentY, canvas.width, sliceHeight,
      0, 0, canvas.width, sliceHeight
    );

    const sliceImgHeight = (sliceHeight / canvas.width) * contentWidth;
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', MARGIN_X, MARGIN_Y, contentWidth, sliceImgHeight);

    currentY = sliceEnd;
    page++;
  }
}

export async function generatePdf(
  previewElement: HTMLElement,
  filename: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  await renderToPdf(previewElement, pdf);
  pdf.save(`${filename}.pdf`);
}

export async function generatePdfDataUrl(
  previewElement: HTMLElement
): Promise<string> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  await renderToPdf(previewElement, pdf);
  return pdf.output('datauristring');
}
