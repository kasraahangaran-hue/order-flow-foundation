import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface CameraCaptureSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called with the captured data URL when user taps "Use Photo". */
  onCapture: (dataUrl: string) => void;
}

export function CameraCaptureSheet({ open, onClose, onCapture }: CameraCaptureSheetProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    const tracks = streamRef.current?.getTracks() ?? [];
    tracks.forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setReady(true);
      }
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Camera unavailable.";
      setError(`${message} You can choose from your files instead.`);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const ok = await startStream();
      if (cancelled && ok) stopStream();
    })();
    return () => {
      cancelled = true;
      stopStream();
      setReady(false);
      setPreview(null);
      setError(null);
    };
  }, [open, startStream, stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    stopStream();
  }, [stopStream]);

  const retake = useCallback(async () => {
    setPreview(null);
    setReady(false);
    await startStream();
  }, [startStream]);

  const confirm = useCallback(() => {
    if (!preview) return;
    onCapture(preview);
  }, [preview, onCapture]);

  const handleFileFallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="press-effect flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[14px] font-semibold">
          {preview ? "Review Photo" : "Take a Photo"}
        </p>
        <div className="h-10 w-10" />
      </div>

      {/* Viewfinder / preview */}
      <div className="relative flex-1 overflow-hidden">
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {!ready && !error ? (
              <p className="absolute inset-0 flex items-center justify-center text-sm">
                Starting Camera…
              </p>
            ) : null}
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="press-effect inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-foreground"
                >
                  Choose from Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileFallback}
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex h-28 items-center justify-center px-6">
        {preview ? (
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={retake}
              className="press-effect h-11 rounded-full px-5 text-sm font-semibold text-white"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={confirm}
              className="press-effect h-11 rounded-full bg-white px-6 text-sm font-semibold text-foreground"
            >
              Use Photo
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={capture}
            disabled={!ready}
            aria-label="Capture"
            className="press-effect flex h-16 w-16 items-center justify-center rounded-full border-4 border-white disabled:opacity-50"
          >
            <span className="block h-12 w-12 rounded-full bg-white" />
          </button>
        )}
      </div>
    </div>
  );
}