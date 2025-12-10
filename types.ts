export enum AppStep {
  UPLOAD = 'UPLOAD',
  CONFIG = 'CONFIG',
  PROCESSING = 'PROCESSING',
  CHAT = 'CHAT'
}

export enum ParserType {
  DOCLING = 'Docling (Layout Aware)',
  LANGCHAIN = 'LangChain (Recursive Character)',
  UNSTRUCTURED = 'Unstructured.io'
}

export type ModelProvider = 'google' | 'hf';

export interface ProcessingConfig {
  chunkSize: number;
  overlap: number;
  retrievalK: number; // New: Top-K retrieval simulation
  parser: ParserType;
  modelProvider: ModelProvider;
  model: string; // Can be a Gemini model ID or a HF model ID
  generatePkl: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  base64: string; // Base64 encoded string without prefix for Gemini
}

export interface VectorNode {
  id: string;
  x: number;
  y: number;
  active: boolean;
}