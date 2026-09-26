export interface ProviderConfig {
  name: string;
  apiKey?: string;
  apiUrl?: string;
  timeout: number;
  models?: Record<string, string>;
  enabled?: boolean;
  capabilities?: string[];
  priority?: number;
  rateLimits?: { requestsPerMinute: number; requestsPerDay: number };
}

export interface ImageGenParams { prompt: string; model?: string; size?: string; quality?: string; style?: string; [key: string]: any; }
export interface VideoGenParams { prompt: string; model?: string; duration?: number; fps?: number; resolution?: string; [key: string]: any; }
export interface AudioGenParams { prompt: string; model?: string; duration?: number; format?: string; voice?: string; [key: string]: any; }
export interface TTSParams { text: string; voice?: string; language?: string; speed?: number; model?: string; [key: string]: any; }
export interface GeneratedContent { id: string; url: string; format: string; duration?: number; size: number; metadata?: Record<string, any>; }
export interface RateLimitStatus { remaining: number; resetTime: number; limit: number; }
export interface ValidationResult { valid: boolean; errors?: string[]; warnings?: string[]; }
export interface JobExecutionResult { output: Record<string, any>; metadata?: Record<string, any>; }

export interface IProvider {
  name: string;
  capabilities: string[];
  initialize(config: ProviderConfig): Promise<void>;
  generateImage(params: ImageGenParams): Promise<GeneratedContent>;
  generateVideo(params: VideoGenParams): Promise<GeneratedContent>;
  generateAudio(params: AudioGenParams): Promise<GeneratedContent>;
  synthesizeSpeech(params: TTSParams): Promise<GeneratedContent>;
  executeJob?(job: any): Promise<JobExecutionResult>;
  healthCheck(): Promise<boolean>;
  getRateLimit(): Promise<RateLimitStatus>;
  validateInput(type: string, input: any): Promise<ValidationResult>;
  validateCredentials(): Promise<boolean>;
  getSupportedModels?(): Promise<Record<string, string[]>>;
}
