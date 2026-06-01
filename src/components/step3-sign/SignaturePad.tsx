import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  value: string | null;
  onChange: (dataUrl: string) => void;
  label?: string;
}

export function SignaturePad({ value, onChange, label = '手写签名' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(2.5);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = '200px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, 200);
      };
      img.src = value;
    }
  }, [value, penSize]);

  useEffect(() => {
    setupCanvas();
    const handler = () => setupCanvas();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [setupCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      // Compress signature to a small JPEG to keep share URLs short
      const offscreen = document.createElement('canvas');
      offscreen.width = 400;
      offscreen.height = 100;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, 400, 100);
        offCtx.drawImage(canvas, 0, 0, 400, 100);
      }
      onChange(offscreen.toDataURL('image/jpeg', 0.6));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    onChange('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
        <label className="label">{label}</label>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden sm:inline">笔触</span>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={penSize}
              onChange={(e) => setPenSize(Number(e.target.value))}
              className="w-16 md:w-20 accent-gold-500"
            />
          </div>
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" />
            清除
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">使用鼠标或触控屏手写签名，可在上方调整笔触大小</p>
    </div>
  );
}
