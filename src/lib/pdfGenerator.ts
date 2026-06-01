import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const marginX = 10;
  const marginY = 15;
  const contentWidth = pdfWidth - 2 * marginX;
  const contentHeight = pdfHeight - 2 * marginY;

  const imgWidth = contentWidth;
  const scale = contentWidth / canvas.width;
  const contentHeightPx = contentHeight / scale;

  let remainingPx = canvas.height;
  let page = 0;

  while (remainingPx > 0) {
    if (page > 0) {
      pdf.addPage();
    }

    const sourceY = page * contentHeightPx;
    const sliceHeight = Math.min(contentHeightPx, remainingPx);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.drawImage(
      canvas,
      0, sourceY, canvas.width, sliceHeight,
      0, 0, canvas.width, sliceHeight
    );

    const sliceData = sliceCanvas.toDataURL('image/png');
    const sliceImgHeight = (sliceHeight / canvas.width) * contentWidth;

    pdf.addImage(sliceData, 'PNG', marginX, marginY, imgWidth, sliceImgHeight);

    remainingPx -= contentHeightPx;
    page++;
  }

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
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const marginX = 10;
  const marginY = 15;
  const contentWidth = pdfWidth - 2 * marginX;
  const contentHeight = pdfHeight - 2 * marginY;

  const imgWidth = contentWidth;
  const scale = contentWidth / canvas.width;
  const contentHeightPx = contentHeight / scale;

  let remainingPx = canvas.height;
  let page = 0;

  while (remainingPx > 0) {
    if (page > 0) {
      pdf.addPage();
    }

    const sourceY = page * contentHeightPx;
    const sliceHeight = Math.min(contentHeightPx, remainingPx);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.drawImage(
      canvas,
      0, sourceY, canvas.width, sliceHeight,
      0, 0, canvas.width, sliceHeight
    );

    const sliceData = sliceCanvas.toDataURL('image/png');
    const sliceImgHeight = (sliceHeight / canvas.width) * contentWidth;

    pdf.addImage(sliceData, 'PNG', marginX, marginY, imgWidth, sliceImgHeight);

    remainingPx -= contentHeightPx;
    page++;
  }

  return pdf.output('datauristring');
}
