export type Reaction = "like" | "dislike" | null;

export type Message = {
  role: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  media?: {
    type: "image" | "link";
    url: string;
  };
  reaction?: Reaction;
};

export interface AiChatbotProps {
  title?: string;
  finetune?: boolean;
  sharedInput: string;
  onInputChange: (value: string) => void;
}

