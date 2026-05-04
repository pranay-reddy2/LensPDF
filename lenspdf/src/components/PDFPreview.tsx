import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite specific worker loading
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Loader2 } from 'lucide-react';

// Initialize PDF.js worker using Vite's internal resolution
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFPreviewProps {
  base64: string;
}

export function PDFPreview({ base64 }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!base64) return;

      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (e) {
          // Task might already be completed or cancelled
        }
      }

      setLoading(true);
      setError(null);

      try {
        const binaryData = atob(base64);
        const dataArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          dataArray[i] = binaryData.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: dataArray });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderTask = (page as any).render({
          canvasContext: context,
          viewport: viewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;

        setLoading(false);
      } catch (err: any) {
        // Ignore "Rendering cancelled" error
        if (err.name === 'RenderingCancelledException') {
          return;
        }
        console.error('PDF Render Error:', err);
        setError('Failed to render preview');
        setLoading(false);
      }
    };

    renderPdf();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [base64]);

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-800 border border-slate-700 overflow-hidden rounded-xl shadow-lg shadow-slate-900/50 group">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10 transition-opacity">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-rose-400 font-mono text-[10px] uppercase tracking-widest text-center px-4">
          {error}
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
    </div>
  );
}
