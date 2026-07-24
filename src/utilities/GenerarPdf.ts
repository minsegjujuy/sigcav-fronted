import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { ParamsDate } from "../models/ParamsDate";

export const generarPDF = async (contentRef: React.RefObject<HTMLDivElement | null>, params: ParamsDate) => {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Primera página
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Páginas siguientes
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
    }
    pdf.save(`informe ${params.fechaInicio} al ${params.fechaFin}.pdf`);
  };