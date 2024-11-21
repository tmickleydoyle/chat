"use client";

import { useState, useRef } from "react";
import { AiChatbot } from "@/components/ai-chatbot";

export default function Page() {
  const [sharedInput, setSharedInput] = useState("");
  const chatbotRef1 = useRef<{ handleSendMessage: () => Promise<void> } | null>(
    null
  );
  const chatbotRef2 = useRef<{ handleSendMessage: () => Promise<void> } | null>(
    null
  );

  const handleInputChange = (value: string) => {
    setSharedInput(value);
  };

  const handleSendMessage = async () => {
    if (sharedInput.trim() === "") return;
    // Call send message function for both chatbots
    await Promise.all([
      chatbotRef1.current?.handleSendMessage(),
      chatbotRef2.current?.handleSendMessage(),
    ]);
    setSharedInput(""); // Clear the input after sending
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <div className="flex-1">
          <AiChatbot
            ref={chatbotRef1}
            title="Chat - Fine Tune"
            finetune={true}
            sharedInput={sharedInput}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
          />
        </div>
        <div className="flex-1">
          <AiChatbot
            ref={chatbotRef2}
            title="Chat - Original"
            finetune={false}
            sharedInput={sharedInput}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
      <div
        style={{
          maxWidth: "30rem",
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        <p className="text-center text-sm text-gray-500">

          This is a simple example of how you can use the same input for two
          different chatbots. You can type in the input field and send the
          message to both chatbots. The fine-tuned model will respond with
          shorter answers.
        </p>
      </div>
    </>
  );
}
