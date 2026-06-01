import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const MARGIN_X = 10;
const MARGIN_Y = 15;
const OVERLAP_PX = 40;

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

    const sliceEnd = Math.min(currentY + contentHeightPx, canvas.height);
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

    const sliceImgHeight = (sliceHeight / canvas.width) * contentWidth;
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', MARGIN_X, MARGIN_Y, contentWidth, sliceImgHeight);

    currentY = sliceEnd - OVERLAP_PX;
    page++;
  }
}
