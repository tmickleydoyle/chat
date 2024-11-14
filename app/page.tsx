import { AiChatbot } from "@/components/ai-chatbot";

export default function Page() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex-1">
        <AiChatbot title="Chat - Fine Tune" finetune={true} />
      </div>
      <div className="flex-1">
        <AiChatbot title="Chat - Original" finetune={false} />
      </div>
    </div>
  );
}
