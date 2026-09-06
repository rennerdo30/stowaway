"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Printer, Copy } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 256 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }).then(setDataUrl);
    }
  }, [value, size]);

  const handleDownload = () => {
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("QR code downloaded");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: system-ui, sans-serif;
              }
              img {
                max-width: 300px;
              }
              p {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
                word-break: break-all;
                max-width: 300px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="QR Code" />
            <p>${value}</p>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border-border rounded-xl border bg-white p-4 shadow-sm">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`QR code linking to ${value}`}
        />
      </div>
      <p className="text-muted-foreground max-w-64 text-center text-xs break-all">
        {value}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="size-4" aria-hidden="true" />
          Copy link
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="size-4" aria-hidden="true" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="size-4" aria-hidden="true" />
          Print
        </Button>
      </div>
    </div>
  );
}
