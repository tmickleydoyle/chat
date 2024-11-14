import { Message, Reaction } from "../types/index";

export const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollIntoView({ behavior: "smooth" });
};

export const formatMessages = (messages: Message[], input: string) => {
  return [
    ...messages.map((msg) => ({
      role: msg.role === "bot" ? "assistant" : msg.role,
      content: msg.content,
    })),
    { role: "user", content: input },
  ];
};

export const handleReaction = (
  messages: Message[],
  index: number,
  reaction: Reaction,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setThumbsDownCount: React.Dispatch<React.SetStateAction<number>>
) => {
  setMessages((prevMessages) =>
    prevMessages.map((msg, i) => {
      if (i === index) {
        if (msg.reaction === "dislike" && reaction !== "dislike") {
          setThumbsDownCount((prev) => Math.max(0, prev - 1));
        } else if (reaction === "dislike" && msg.reaction !== "dislike") {
          setThumbsDownCount((prev) => prev + 1);
        }
        return {
          ...msg,
          reaction: msg.reaction === reaction ? null : reaction,
        };
      }
      return msg;
    })
  );
};

