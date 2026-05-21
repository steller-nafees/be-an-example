import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2pdf from "html2pdf.js";
import type { Order } from "@/context/OrderContext";

interface InvoiceDownloadProps {
  order: Order;
  contentId: string;
}

export default function InvoiceDownloadButton({ order, contentId }: InvoiceDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(contentId);
    if (!element) return;
    setDownloading(true);

    try {
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `invoice-${order.id}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait" as const, unit: "mm" as const, format: "a4" },
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to download invoice:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download Invoice PDF
        </>
      )}
    </button>
  );
}
