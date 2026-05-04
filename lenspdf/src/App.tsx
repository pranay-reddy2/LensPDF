import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ChatWindow } from './components/ChatWindow';
import { TestSuite } from './components/TestSuite';
import { PDFPreview } from './components/PDFPreview';
import { queryPdf } from './lib/gemini';
import { SAMPLE_PDF_BASE64 } from './constants';
import { BookOpen, HelpCircle, Layout, Info } from 'lucide-react';

interface Msg {
  role: 'user' | 'bot';
  content: string;
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      const base64 = await fileToBase64(file);
      setPdfBase64(base64);
      setMessages([]);
    } catch (err) {
      console.error("File processing error:", err);
    }
  };

  const loadSample = () => {
    const blob = new Blob([atob(SAMPLE_PDF_BASE64)], { type: 'application/pdf' });
    const file = new File([blob], "LensPDF_Grounding_Spec.pdf", { type: 'application/pdf' });
    setSelectedFile(file);
    setPdfBase64(SAMPLE_PDF_BASE64);
    setMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!pdfBase64) return;

    const newMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await queryPdf(pdfBase64, text, chatHistory);
      setMessages(prev => [...prev, { role: 'bot', content: response || "No response received." }]);
    } catch (err: any) {
      let errorMessage = "Error: Failed to process document. Please try again.";
      
      if (err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("429")) {
        errorMessage = "Quota Exceeded: Your project has exceeded its Gemini API spending cap or rate limit. Please check your AI Studio settings.";
      }
      
      setMessages(prev => [...prev, { role: 'bot', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPdfBase64(null);
    setMessages([]);
  };

  return (
    <div className="h-screen flex overflow-hidden font-sans text-slate-800 bg-slate-50">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 text-white flex flex-col border-r border-slate-700">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white">LP</div>
            <h1 className="text-lg font-bold tracking-tight uppercase">LensPDF</h1>
          </div>
          <p className="text-xs text-slate-400">PDF-Constrained Retrieval System</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8 scrollbar-hide">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Source</h2>
              {!selectedFile && (
                <button onClick={loadSample} className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Load Demo
                </button>
              )}
            </div>
            <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} onClear={handleClear} />
            
            {pdfBase64 && (
              <div className="mt-6 space-y-4">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visual Buffer</h2>
                <PDFPreview base64={pdfBase64} />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Verification Pack</h2>
            <TestSuite onSelectQuery={handleSendMessage} disabled={!pdfBase64 || isLoading} />
          </section>
        </div>

        <div className="p-4 bg-slate-950">
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Status: Grounded Only</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded uppercase text-slate-600">Strict Mode</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600 truncate max-w-md">
              {selectedFile ? `Analyzing: ${selectedFile.name}` : "Ready for Analysis"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-slate-100 p-1 rounded text-[10px] font-medium text-slate-500">
              <span className="px-3 py-1 bg-white shadow-sm rounded text-slate-900">EN</span>
              <span className="px-3 py-1 opacity-50 cursor-not-allowed">ES</span>
              <span className="px-3 py-1 opacity-50 cursor-not-allowed">FR</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <ChatWindow 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            disabled={!pdfBase64}
          />
        </div>
      </div>
    </div>
  );
}
