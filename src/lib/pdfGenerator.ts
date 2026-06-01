import { jsPDF } from 'jspdf';

export async function generatePdf(
  previewElement: HTMLElement,
  filename: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');

  await pdf.html(previewElement, {
    callback: (doc) => doc.save(`${filename}.pdf`),
    margin: [15, 10, 15, 10],
    autoPaging: 'text',
    html2canvas: {
      scale: 0.58,
      useCORS: true,
      logging: false,
    },
    width: 190,
    windowWidth: previewElement.scrollWidth,
  });
}

export async function generatePdfDataUrl(
  previewElement: HTMLElement
): Promise<string> {
  const pdf = new jsPDF('p', 'mm', 'a4');

  await pdf.html(previewElement, {
    callback: () => {},
    margin: [15, 10, 15, 10],
    autoPaging: 'text',
    html2canvas: {
      scale: 0.58,
      useCORS: true,
      logging: false,
    },
    width: 190,
    windowWidth: previewElement.scrollWidth,
  });

  return pdf.output('datauristring');
}
