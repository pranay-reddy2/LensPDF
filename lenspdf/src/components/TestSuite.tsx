import { TEST_QUERIES } from '@/src/constants';
import { PlayCircle, AlertCircle } from 'lucide-react';

interface TestSuiteProps {
  onSelectQuery: (query: string) => void;
  disabled: boolean;
}

export function TestSuite({ onSelectQuery, disabled }: TestSuiteProps) {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-3 bg-emerald-500 rounded-full" />
          <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-emerald-500">Retrieval Check</h3>
        </div>
        <div className="space-y-1.5">
          {TEST_QUERIES.valid.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelectQuery(q)}
              disabled={disabled}
              className="w-full text-left p-3 text-xs bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all font-sans disabled:opacity-30 disabled:cursor-not-allowed group flex gap-2 items-start"
            >
              <span className="opacity-40 group-hover:opacity-100">•</span>
              {q}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-3 bg-rose-500 rounded-full" />
          <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-rose-500">Hallucination Test</h3>
        </div>
        <div className="space-y-1.5">
          {TEST_QUERIES.invalid.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelectQuery(q)}
              disabled={disabled}
              className="w-full text-left p-3 text-xs bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-rose-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all font-sans disabled:opacity-30 disabled:cursor-not-allowed group flex gap-2 items-start"
            >
              <span className="opacity-40 group-hover:opacity-100">•</span>
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
