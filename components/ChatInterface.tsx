import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Bot, User, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { ChatMessage, FileData, ProcessingConfig } from '../types';
import { queryDocument, validateApiKey } from '../services/gemini';

interface ChatInterfaceProps {
  file: FileData;
  config: ProcessingConfig;
  onReset: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ file, config, onReset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: `Database ready. I've ingested "${file.name}" using the ${config.parser.split(' ')[0]} strategy with ${config.chunkSize}-token chunks. \n\nI am simulating: ${config.model}`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!validateApiKey()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Error: No API Key found in process.env.API_KEY. Please configure your environment.",
        timestamp: Date.now()
      }]);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await queryDocument(file, messages, input, config);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error processing that request.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPkl = () => {
    const dummyData = {
      meta: {
        filename: file.name,
        parsed_by: config.parser,
        chunk_size: config.chunkSize,
        overlap: config.overlap,
        embedding_model: config.model,
        timestamp: new Date().toISOString()
      },
      vector_store_mock: "Binary data placeholder for 768-dim vectors...",
      chat_history: messages
    };
    
    const blob = new Blob([JSON.stringify(dummyData, null, 2)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.split('.')[0]}_${config.model.replace(/\//g, '-')}.pkl`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[80vh] w-full max-w-6xl mx-auto gap-6 animate-fade-in">
      
      {/* Sidebar Info - White Card */}
      <div className="hidden md:flex flex-col w-64 glass-panel rounded-2xl p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-subtext uppercase tracking-wider mb-3">Active Datasheet</h3>
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="bg-red-50 p-2 rounded text-red-500">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-secondary truncate" title={file.name}>{file.name}</p>
              <p className="text-xs text-subtext">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>

        <div>
           <h3 className="text-xs font-bold text-subtext uppercase tracking-wider mb-3">Pipeline Specs</h3>
           <div className="space-y-2 text-xs text-subtext font-mono">
             <div className="flex justify-between border-b border-slate-100 pb-1">
               <span>Parser:</span>
               <span className="text-secondary font-semibold">{config.parser.split(' ')[0]}</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-1">
               <span>Chunk:</span>
               <span className="text-secondary font-semibold">{config.chunkSize} / {config.overlap}</span>
             </div>
             <div className="flex flex-col gap-1 mt-2">
               <span>Model ({config.modelProvider}):</span>
               <span className="text-secondary bg-slate-100 p-1 rounded border border-slate-200 break-words font-semibold">
                   {config.model}
               </span>
             </div>
           </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200">
           {config.generatePkl && (
             <button 
               onClick={downloadPkl}
               className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-black text-white py-2 rounded-lg text-xs font-bold transition-colors mb-3 shadow-sm"
             >
               <Download className="w-3 h-3" />
               Download .pkl DB
             </button>
           )}
           <button 
             onClick={onReset}
             className="w-full flex items-center justify-center gap-2 text-xs text-subtext hover:text-red-600 transition-colors py-2"
           >
             <RefreshCw className="w-3 h-3" />
             Reset Session
           </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-orange-400 to-primary" />
        
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-secondary'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`
                max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-secondary rounded-tl-none border border-slate-200'}
              `}>
                <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-secondary flex items-center justify-center shadow-sm">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-200 flex items-center gap-2 shadow-sm">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask a question (Model: ${config.model.split('/')[1] || config.model})...`}
              className="w-full bg-slate-50 border border-slate-200 text-secondary rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 font-medium transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
               <AlertTriangle className="w-3 h-3" />
               AI generated content. Verify critical data with official NXP datasheets.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};