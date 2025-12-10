import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, FileData, ParserType, ProcessingConfig } from "../types";

// Initialize Gemini Client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const validateApiKey = (): boolean => {
  return !!process.env.API_KEY;
};

// Specific behavioral instructions for simulated parsers
const PARSER_BEHAVIOR = {
  [ParserType.DOCLING]: "SIMULATION MODE: DOCLING. The user has chosen a layout-aware parser. You should pay extreme attention to tables, headers, and document structure. If the PDF contains tables, represent them accurately in Markdown. Assume the context provided to you was extracted with high structural fidelity.",
  [ParserType.LANGCHAIN]: "SIMULATION MODE: LANGCHAIN. The user has chosen a recursive character splitter. You should simulate the effect of content being split by character count. Context might be fragmented mid-sentence. Focus on text density.",
  [ParserType.UNSTRUCTURED]: "SIMULATION MODE: UNSTRUCTURED. Focus on raw element extraction."
};

/**
 * Sends a message to Gemini with the PDF context.
 * Simulates the RAG pipeline by injecting config details into the system prompt.
 */
export const queryDocument = async (
  file: FileData,
  history: ChatMessage[],
  newMessage: string,
  config: ProcessingConfig
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Determine which Gemini model to use as the "Engine"
    // Even if simulating Hugging Face, we use a capable Gemini model to act the part.
    let engineModel = 'gemini-2.5-flash';
    if (config.modelProvider === 'google' && config.model === 'gemini-3-pro-preview') {
      engineModel = 'gemini-3-pro-preview';
    }

    // Construct a System Instruction that makes Gemini behave like the configured RAG system
    const systemInstruction = `You are an advanced RAG (Retrieval-Augmented Generation) assistant.
    
    CONFIGURATION:
    - Target Document: "${file.name}"
    - Parser Engine: ${config.parser}
    - Chunking Strategy: ${config.chunkSize} tokens per chunk with ${config.overlap} token overlap.
    - Retrieval Depth: Top-${config.retrievalK} chunks.
    
    MODEL PERSONA:
    ${config.modelProvider === 'hf' 
      ? `ACT AS: ${config.model}. Adopt the typical personality, verbosity, and formatting style of this Hugging Face model.` 
      : 'ACT AS: Standard Gemini Assistant (Helpful, Concise).'}

    PARSER BEHAVIOR:
    ${PARSER_BEHAVIOR[config.parser]}

    INSTRUCTIONS:
    1. Answer questions strictly based on the content of the provided document.
    2. If the user asks about the pipeline, explain that you are simulating a RAG system using ${config.parser} with ${config.chunkSize}-token chunks, retrieving the top ${config.retrievalK} relevant segments.
    3. If acting as a specific HF model, try to use its specific catchphrases or formatting quirks (e.g. "Here is the code:" for CodeLlama).
    4. Maintain a professional, technical tone suitable for a vector database admin interface.
    `;

    // Construct the history for the chat
    const chatContent = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Add the new message
    chatContent.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const parts: any[] = [];
    
    // Add PDF
    parts.push({
        inlineData: {
            mimeType: 'application/pdf',
            data: file.base64
        }
    });

    parts.push({
        text: `Here is the conversation history:\n${history.map(h => `${h.role}: ${h.text}`).join('\n')}\n\nUser: ${newMessage}`
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: engineModel,
        contents: {
            role: 'user',
            parts: parts
        },
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3, 
        }
    });

    return response.text || "I processed the document but generated no text response.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error querying document: ${error.message || "Unknown error"}`;
  }
};