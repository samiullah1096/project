export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  featured?: boolean;
  keywords: string[];
  rank: number;
}

export interface ToolCategory {
  name: string;
  description: string;
  icon: string;
  tools: Tool[];
}

export interface ProcessingOptions {
  quality?: number;
  format?: string;
  compression?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ToolResult {
  success: boolean;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
}