import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Database, FileText, Split, Sparkles } from 'lucide-react';
import { VectorNode, ProcessingConfig } from '../types';

interface ProcessingViewProps {
  onComplete: () => void;
  config: ProcessingConfig;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ onComplete, config }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [nodes, setNodes] = useState<VectorNode[]>([]);
  const [log, setLog] = useState<string[]>([]);

  // Use the parser name in the step description
  const parserName = config.parser.split(' ')[0];

  const steps = [
    { name: `Parsing with ${parserName}`, icon: FileText, duration: 2000 },
    { name: `Chunking (${config.chunkSize}t / ${config.overlap}ov)`, icon: Split, duration: 1500 },
    { name: 'Generating Embeddings', icon: Sparkles, duration: 2000 },
    { name: 'Building Vector Index', icon: Database, duration: 1000 }
  ];

  // Particle effect simulation
  useEffect(() => {
    if (currentStep === 2) {
      const interval = setInterval(() => {
        setNodes(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            active: true
          }
        ].slice(-20)); // Keep last 20
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  useEffect(() => {
    let stepIndex = 0;
    
    const runStep = () => {
      if (stepIndex >= steps.length) {
        setTimeout(onComplete, 800);
        return;
      }

      setCurrentStep(stepIndex);
      setLog(prev => [...prev, `> ${steps[stepIndex].name}...`]);

      setTimeout(() => {
        setLog(prev => [...prev, `  Done.`]);
        stepIndex++;
        runStep();
      }, steps[stepIndex].duration);
    };

    runStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Visualizer Area - Kept dark for contrast and industrial feel */}
      <div className="relative h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-md">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-20">
            {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-slate-600"></div>
            ))}
        </div>
        
        {/* Dynamic Visual Content based on Step */}
        <div className="absolute inset-0 flex items-center justify-center">
            {currentStep === 0 && (
                <div className="animate-pulse flex flex-col items-center text-slate-400">
                    <FileText className="w-16 h-16 mb-2" />
                    <span className="font-mono text-xs">Reading Binary Stream...</span>
                </div>
            )}
            {currentStep === 1 && (
                <div className="flex flex-wrap gap-2 w-3/4 justify-center">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-2 w-16 bg-primary/80 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms`}} />
                    ))}
                </div>
            )}
            {currentStep === 2 && (
                <div className="relative w-full h-full">
                    {nodes.map(node => (
                        <div 
                            key={node.id}
                            className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#e96116] animate-ping"
                            style={{ left: `${node.x}%`, top: `${node.y}%`, animationDuration: '3s' }}
                        />
                    ))}
                </div>
            )}
            {currentStep === 3 && (
                 <Database className="w-24 h-24 text-primary animate-bounce" />
            )}
        </div>
        
        {/* Logs Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent p-4 font-mono text-xs text-green-400 overflow-hidden flex flex-col justify-end">
            {log.slice(-4).map((l, i) => (
                <div key={i}>{l}</div>
            ))}
        </div>
      </div>

      {/* Steps Progress */}
      <div className="grid grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div key={index} className="flex flex-col items-center space-y-3 relative">
               {/* Connector Line */}
               {index < steps.length - 1 && (
                 <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-colors duration-500 ${isCompleted ? 'bg-primary' : 'bg-slate-200'}`} />
               )}

              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 border-2
                ${isActive ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 
                  isCompleted ? 'bg-white border-primary text-primary' : 'bg-white border-slate-200 text-slate-300'}
              `}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : 
                 isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-bold text-center transition-colors ${isActive ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-slate-400'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};