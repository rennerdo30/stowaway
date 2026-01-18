"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, SwitchCamera } from "lucide-react";
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
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="text-center">{error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setCurrentDeviceIndex(0);
                }}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-white/50 rounded-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-sm" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Point your camera at a barcode
                </p>
                {devices.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={switchCamera}>
                    <SwitchCamera className="h-4 w-4 mr-2" />
                    Switch Camera
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
