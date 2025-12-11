export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ChatResponse {
  userMessage: string;
  chatbotResponse: string;
  timestamp: string;
  to?: string;
}

export interface AutoReplyStatus {
  autoReplyEnabled: boolean;
  timestamp: string;
}
