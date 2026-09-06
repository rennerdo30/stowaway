"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, CameraOff, Loader2, SwitchCamera } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopScanning();
    setIsScanning(false);
    onOpenChange(false);
  }, [onOpenChange, stopScanning]);

  useEffect(() => {
    if (!open) return;

    const initScanner = async () => {
      try {
        setError(null);
        setIsScanning(true);

        // Get available video devices
        const videoDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(videoDevices);

        if (videoDevices.length === 0) {
          setError("No camera found");
          setIsScanning(false);
          return;
        }

        // Initialize reader
        const reader = new BrowserMultiFormatReader();

        // Start scanning with the current device
        const deviceId = videoDevices[currentDeviceIndex]?.deviceId;
        if (videoRef.current && deviceId) {
          controlsRef.current = await reader.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            (result) => {
              if (result) {
                const text = result.getText();
                onScan(text);
                toast.success(`Scanned: ${text}`);
                handleClose();
              }
              // Ignore errors during scanning (they happen frequently)
            }
          );
        }
      } catch (scanError) {
        console.error("Scanner error:", scanError);
        setError("Failed to access camera. Please allow camera permissions.");
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      stopScanning();
    };
  }, [open, currentDeviceIndex, onScan, handleClose, stopScanning]);

  const switchCamera = () => {
    if (devices.length > 1) {
      stopScanning();
      setCurrentDeviceIndex((prev) => (prev + 1) % devices.length);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5" aria-hidden="true" />
            Scan barcode
          </DialogTitle>
          <DialogDescription>
            Hold the barcode inside the frame — the code is filled in
            automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <div
              role="alert"
              className="text-muted-foreground flex h-64 flex-col items-center justify-center gap-3 text-center"
            >
              <div className="bg-muted flex size-11 items-center justify-center rounded-full">
                <CameraOff className="size-5" aria-hidden="true" />
              </div>
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setCurrentDeviceIndex(0);
                }}
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <video
                  ref={videoRef}
                  className="size-full object-cover"
                  playsInline
                  muted
                />
                {!isScanning && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    role="status"
                    aria-label="Starting camera"
                  >
                    <Loader2
                      className="size-8 animate-spin text-white"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                >
                  <div className="absolute top-1/2 left-1/2 h-1/3 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-white/50">
                    <div className="absolute top-0 left-0 size-4 rounded-tl-sm border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 size-4 rounded-tr-sm border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 size-4 rounded-bl-sm border-b-2 border-l-2 border-white" />
                    <div className="absolute right-0 bottom-0 size-4 rounded-br-sm border-b-2 border-r-2 border-white" />
                  </div>
                </div>
              </div>
              {devices.length > 1 && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={switchCamera}>
                    <SwitchCamera className="size-4" aria-hidden="true" />
                    Switch camera
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
