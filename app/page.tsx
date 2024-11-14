"use client";

import { useState } from "react";
import { AiChatbot } from "@/components/ai-chatbot";

export default function Page() {
  const [sharedInput, setSharedInput] = useState("");

  const handleInputChange = (value: string) => {
    setSharedInput(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex-1">
        <AiChatbot
          title="Chat - Fine Tune"
          finetune={true}
          sharedInput={sharedInput}
          onInputChange={handleInputChange}
        />
      </div>
      <div className="flex-1">
        <AiChatbot
          title="Chat - Original"
          finetune={false}
          sharedInput={sharedInput}
          onInputChange={handleInputChange}
        />
      </div>
    </div>
  );
}
