import React from 'react';
import { Settings, Database, Cpu, Layers, Box, Search } from 'lucide-react';
import { ProcessingConfig, ParserType, ModelProvider } from '../types';

interface ConfigPanelProps {
  config: ProcessingConfig;
  setConfig: (config: ProcessingConfig) => void;
  onStart: () => void;
}

const PRESET_HF_MODELS = [
  "meta-llama/Meta-Llama-3-70B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.2",
  "tiiuae/falcon-180B-chat",
  "microsoft/Phi-3-mini-4k-instruct"
];

const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast, efficient, low latency' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', desc: 'Complex reasoning, high accuracy' }
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, onStart }) => {
  
  const handleParserSelect = (parser: ParserType) => {
    setConfig({ ...config, parser });
  };

  const handleProviderSelect = (provider: ModelProvider) => {
    const defaultModel = provider === 'google' 
      ? 'gemini-2.5-flash' 
      : 'meta-llama/Meta-Llama-3-70B-Instruct';
    setConfig({ ...config, modelProvider: provider, model: defaultModel });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-8">
        
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-secondary">Pipeline Configuration</h2>
        </div>

        {/* Parser Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-secondary">
            <Layers className="w-4 h-4 text-primary" />
            PDF Parsing Engine
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleParserSelect(ParserType.DOCLING)}
              className={`
                p-4 rounded-xl text-left transition-all border relative overflow-hidden
                ${config.parser === ParserType.DOCLING 
                  ? 'bg-orange-50 border-primary shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-primary/40'}
              `}
            >
              <div className="relative z-10">
                <h3 className={`font-bold ${config.parser === ParserType.DOCLING ? 'text-primary' : 'text-secondary'}`}>Docling</h3>
                <p className="text-xs text-subtext mt-1">Layout-aware parsing. Preserves tables, headers, and document structure.</p>
              </div>
            </button>

            <button
              onClick={() => handleParserSelect(ParserType.LANGCHAIN)}
              className={`
                p-4 rounded-xl text-left transition-all border relative overflow-hidden
                ${config.parser === ParserType.LANGCHAIN 
                  ? 'bg-orange-50 border-primary shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-primary/40'}
              `}
            >
              <div className="relative z-10">
                <h3 className={`font-bold ${config.parser === ParserType.LANGCHAIN ? 'text-primary' : 'text-secondary'}`}>LangChain</h3>
                <p className="text-xs text-subtext mt-1">Recursive character splitting. Standard fast parsing for text-heavy documents.</p>
              </div>
            </button>
          </div>
        </div>

        {/* RAG Strategy */}
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-secondary" />
                <span className="text-sm font-bold text-secondary">RAG Strategy</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Chunk Size */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <label className="text-subtext">Chunk Size</label>
                        <span className="text-primary font-mono bg-orange-100 px-2 rounded font-bold">{config.chunkSize}</span>
                    </div>
                    <input 
                        type="range" min="128" max="2048" step="64"
                        value={config.chunkSize}
                        onChange={(e) => setConfig({ ...config, chunkSize: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
                
                {/* Overlap */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <label className="text-subtext">Overlap</label>
                        <span className="text-primary font-mono bg-orange-100 px-2 rounded font-bold">{config.overlap}</span>
                    </div>
                    <input 
                        type="range" min="0" max="512" step="16"
                        value={config.overlap}
                        onChange={(e) => setConfig({ ...config, overlap: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                {/* Top K */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <label className="text-subtext">Top-K Retrieval</label>
                        <span className="text-primary font-mono bg-orange-100 px-2 rounded font-bold">{config.retrievalK}</span>
                    </div>
                    <input 
                        type="range" min="1" max="20" step="1"
                        value={config.retrievalK}
                        onChange={(e) => setConfig({ ...config, retrievalK: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-secondary">
            <Cpu className="w-4 h-4 text-primary" />
            Inference Model
          </label>
          
          <div className="flex gap-4 border-b border-slate-200 mb-4">
             <button 
               onClick={() => handleProviderSelect('google')}
               className={`pb-2 text-sm font-medium transition-colors ${config.modelProvider === 'google' ? 'text-primary border-b-2 border-primary' : 'text-subtext hover:text-secondary'}`}
             >
               Google Gemini
             </button>
             <button 
               onClick={() => handleProviderSelect('hf')}
               className={`pb-2 text-sm font-medium transition-colors ${config.modelProvider === 'hf' ? 'text-primary border-b-2 border-primary' : 'text-subtext hover:text-secondary'}`}
             >
               Hugging Face
             </button>
          </div>

          {config.modelProvider === 'google' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GEMINI_MODELS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setConfig({...config, model: m.id})}
                        className={`p-3 rounded-lg border text-left transition-all ${config.model === m.id ? 'bg-orange-50 border-primary text-secondary' : 'bg-white border-slate-200 text-subtext hover:border-slate-300'}`}
                      >
                          <div className={`font-bold text-sm ${config.model === m.id ? 'text-primary' : ''}`}>{m.name}</div>
                          <div className="text-xs opacity-70">{m.desc}</div>
                      </button>
                  ))}
              </div>
          ) : (
              <div className="space-y-3 animate-fade-in">
                  <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={config.model}
                        onChange={(e) => setConfig({...config, model: e.target.value})}
                        placeholder="Enter Model ID (e.g. meta-llama/Llama-3-70b-chat-hf)"
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm text-secondary focus:border-primary outline-none font-mono"
                      />
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {PRESET_HF_MODELS.map(pm => (
                          <button 
                            key={pm}
                            onClick={() => setConfig({...config, model: pm})}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${config.model === pm ? 'bg-orange-50 border-primary text-primary' : 'bg-white border-slate-200 text-subtext hover:border-slate-400'}`}
                          >
                              {pm.split('/')[1] || pm}
                          </button>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {/* Export Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded text-secondary">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-secondary">Export Vector DB (.pkl)</p>
              <p className="text-xs text-subtext">Download serialized database after processing</p>
            </div>
          </div>
          <button
            onClick={() => setConfig({ ...config, generatePkl: !config.generatePkl })}
            className={`
              w-12 h-6 rounded-full transition-colors relative
              ${config.generatePkl ? 'bg-primary' : 'bg-slate-300'}
            `}
          >
            <div className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm
              ${config.generatePkl ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Cpu className="w-5 h-5" />
          Initialize Vector Pipeline
        </button>

      </div>
    </div>
  );
};