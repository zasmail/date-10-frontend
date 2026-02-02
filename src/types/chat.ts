export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface ChatStreamEvent {
  type: 'conversation_id' | 'text' | 'done';
  content?: string;
  conversation_id?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
