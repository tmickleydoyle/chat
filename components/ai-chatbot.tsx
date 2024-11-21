"use client";

import * as React from "react";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  User,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { AiChatbotProps, Message } from "../app/types/index";
import {
  scrollToBottom,
  formatMessages,
  handleReaction,
} from "../app/utils/chat-utils";
import { useColorManagement } from "../hooks/use-color-management";

const sampleMessages: Message[] = [
  {
    role: "bot",
    content: "Hello",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
];

export const AiChatbot = forwardRef<
  { handleSendMessage: () => Promise<void> },
  AiChatbotProps & {
    sharedInput: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
  }
>(({ title, finetune, sharedInput, onInputChange, onSendMessage }, ref) => {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [thumbsDownCount, setThumbsDownCount] = useState(0);
  const [isPoorConversation, setIsPoorConversation] = useState(false);
  const [showSupportOption, setShowSupportOption] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    inputColor,
    popoverColor,
    isLoading,
    handleColorChange,
    fetchBotColor,
  } = useColorManagement();

  useEffect(() => {
    scrollToBottom(messagesEndRef);
  }, [messages]);

  useEffect(() => {
    if (thumbsDownCount > 2 && !isPoorConversation) {
      setIsPoorConversation(true);
      setShowSupportOption(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "system",
          content:
            "We're sorry that you're not finding this conversation helpful. Would you like to talk to a customer support representative?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [thumbsDownCount, isPoorConversation]);

  useImperativeHandle(ref, () => ({
    handleSendMessage: async () => {
      await handleSendMessage();
    },
  }));

  const handleSendMessage = async () => {
    if (sharedInput.trim() === "") return;

    const userMessage: Message = {
      role: "user",
      content: sharedInput,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    onInputChange(""); // Clear the input after sending
    setIsTyping(true);

    try {
      const formattedMessages = formatMessages(messages, sharedInput);
      const response = await fetch(
        finetune ? "/api/chat" : "/api/chat-original",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: formattedMessages }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bot response");
      }
      const dataMessage = await response.text();
      const botMessage: Message = {
        role: "bot",
        content: dataMessage,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bot response.",
        variant: "destructive",
      });

      AiChatbot.displayName = "AiChatbot";
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputFocus = () => {
    scrollToBottom(messagesEndRef);
  };

  return (
    <Card
      className={`w-[600px] h-[800px] transition-colors duration-300 mx-auto my-auto`}
    >
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{title || "Chat"}</CardTitle>
        <div className="flex justify-center w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100%] max-w-[800px] mx-2">
              <div className="grid gap-4">
                <div className="space-y-2 text-center">
                  <h4 className="font-medium leading-none">Customize Chat</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the color of the robot&apos;s text box.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    (From Hugging Face Inference)
                  </p>
                </div>
                <div className="grid gap-2 w-[100%] max-w-[800px] mx-2 ">
                  <Input
                    id="colorInput"
                    placeholder="e.g. light orange"
                    value={inputColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    aria-label="Enter color"
                    className="w-[95%]"
                  />
                  <Button
                    onClick={fetchBotColor}
                    disabled={isLoading}
                    className="w-[95%]"
                  >
                    {isLoading ? "Loading..." : "Fetch Color"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end mb-4 ${
                message.role === "bot"
                  ? "justify-start"
                  : message.role === "user"
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              {message.role === "bot" && (
                <Avatar className="mr-2">
                  <AvatarFallback>
                    <Bot size={24} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "bot"
                    ? `${popoverColor} ml-0 mr-auto`
                    : message.role === "user"
                    ? "bg-light-grey text-primary-foreground ml-auto mr-0"
                    : "bg-yellow-100 text-yellow-800 mx-auto"
                }`}
                style={{
                  backgroundColor:
                    message.role === "bot"
                      ? popoverColor
                      : message.role === "user"
                      ? "lightgrey"
                      : undefined,
                  color: "black",
                  borderColor: message.role === "bot" ? inputColor : undefined,
                }}
              >
                {message.role === "system" && (
                  <AlertCircle
                    className="inline-block mr-2 text-yellow-500"
                    size={16}
                  />
                )}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
                <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                  <span>{format(message.timestamp, "HH:mm")}</span>
                  {message.role === "bot" && (
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleReaction(
                            messages,
                            index,
                            "like",
                            setMessages,
                            setThumbsDownCount
                          )
                        }
                        className={`p-1 ${
                          message.reaction === "like"
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        <ThumbsUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleReaction(
                            messages,
                            index,
                            "dislike",
                            setMessages,
                            setThumbsDownCount
                          )
                        }
                        className={`p-1 ${
                          message.reaction === "dislike"
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        <ThumbsDown size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {message.role === "user" && (
                <Avatar className="ml-2">
                  <AvatarFallback>
                    <User size={24} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Bot size={24} />
              <span>Bot is typing...</span>
            </div>
          )}
          {showSupportOption && (
            <div className="flex justify-center mt-4"></div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex w-full items-center space-x-2"
        >
          <div className="w-full">
            <Input
              ref={inputRef}
              className="flex w-full"
              placeholder="Type your message..."
              value={sharedInput}
              onChange={(e) => onInputChange(e.target.value)}
              onClick={handleInputFocus}
            />
          </div>
          <Button type="submit" size="icon" disabled={isTyping}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
});
