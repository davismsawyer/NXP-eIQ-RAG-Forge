import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConfigPanel } from './components/ConfigPanel';
import { ProcessingView } from './components/ProcessingView';
import { ChatInterface } from './components/ChatInterface';
import { AppStep, FileData, ParserType, ProcessingConfig } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [file, setFile] = useState<FileData | null>(null);
  
  const [config, setConfig] = useState<ProcessingConfig>({
    chunkSize: 512,
    overlap: 50,
    retrievalK: 5,
    parser: ParserType.DOCLING,
    modelProvider: 'google',
    model: 'gemini-2.5-flash',
    generatePkl: true
  });

  const handleFileSelect = (selectedFile: FileData) => {
    setFile(selectedFile);
    setStep(AppStep.CONFIG);
  };

  const handleStartProcessing = () => {
    setStep(AppStep.PROCESSING);
  };

  const handleProcessingComplete = () => {
    setStep(AppStep.CHAT);
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* NXP Logo Representation */}
            <div className="flex items-center">
              <span className="font-extrabold text-2xl tracking-tighter text-secondary" style={{fontFamily: 'Inter, sans-serif'}}>NXP</span>
            </div>
            
            <div className="h-6 w-px bg-slate-300 mx-1"></div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-secondary tracking-tight">RAG<span className="text-primary">Forge</span></span>
            </div>
          </div>
          <div className="text-xs text-subtext font-mono hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            eIQ™ MACHINE LEARNING DEVELOPMENT
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 flex flex-col items-center justify-center min-h-screen">
        
        {step === AppStep.UPLOAD && (
          <div className="w-full max-w-4xl space-y-8 text-center animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-secondary">
                Turn PDFs into <span className="text-primary">Intelligence</span>
              </h1>
              <p className="text-subtext text-lg max-w-2xl mx-auto leading-relaxed">
                Securely parse your technical documentation using industrial pipelines. 
                Generate vector embeddings and query datasheets with NXP eIQ™ compatible workflows.
              </p>
            </div>
            <div className="pt-8">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )}

        {step === AppStep.CONFIG && file && (
          <ConfigPanel 
            config={config} 
            setConfig={setConfig} 
            onStart={handleStartProcessing} 
          />
        )}

        {step === AppStep.PROCESSING && (
          <ProcessingView 
            config={config} 
            onComplete={handleProcessingComplete} 
          />
        )}

        {step === AppStep.CHAT && file && (
          <ChatInterface 
            file={file} 
            config={config}
            onReset={handleReset} 
          />
        )}

      </main>

      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
      }}></div>
    </div>
  );
};

export default App;