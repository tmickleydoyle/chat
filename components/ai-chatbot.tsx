"use client";

import * as React from "react";

import { useState, useRef, useEffect } from "react";
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

const defaultColor = "lightgrey";

type Reaction = "like" | "dislike" | null;

type Message = {
  role: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
  media?: {
    type: "image" | "link";
    url: string;
  };
  reaction?: Reaction;
};

const sampleMessages: Message[] = [
  {
    role: "bot",
    content: "Hello",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
];

export function AiChatbot() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thumbsDownCount, setThumbsDownCount] = useState(0);
  const [isPoorConversation, setIsPoorConversation] = useState(false);
  const [showSupportOption, setShowSupportOption] = useState(false);
  const [robotTextBoxColor, setRobotTextBoxColor] = useState("bg-secondary");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputColor, setInputColor] = React.useState("");
  const [popoverColor, setPopoverColor] = React.useState(defaultColor);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleColorChange = (value: string) => {
    // setApiColor("");
    setInputColor(value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  let retryCount = 0;
  const fetchBotColor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/botcolor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputColor }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch color");
      }
      const data = await response.text();
      const colorData = data
        .replace(/\d+:"(.+?)"/g, "$1")
        .replace(/\\/g, "")
        .replace(/\n/g, "");
      const hexColorMatch = colorData.match(/#[0-9A-Fa-f]{6}/);
      const hexColor = hexColorMatch?.[0];

      if (hexColor) {
        setRobotTextBoxColor(hexColor);
        setPopoverColor(hexColor);
        retryCount = 0;
      } else if (retryCount < 5) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return fetchBotColor();
      } else {
        setRobotTextBoxColor(defaultColor);
        setPopoverColor(defaultColor);
        retryCount = 0;
      }
    } catch (error) {
      console.error("Error fetching color:", error);
      setPopoverColor(defaultColor);
      toast({
        title: "Error",
        description: "Failed to fetch color. Using default light grey.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
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

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const formattedMessages = [
        ...messages.map((msg) => ({
          role: msg.role === "bot" ? "assistant" : msg.role,
          content: msg.content,
        })),
        { role: "user", content: input },
      ];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: formattedMessages }),
      });
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
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputFocus = () => {
    scrollToBottom();
  };

  const handleReaction = (index: number, reaction: Reaction) => {
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

  return (
    <Card
      className={`w-[600px] h-[800px] transition-colors duration-300 mx-auto my-auto`}
    >
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Chat</CardTitle>
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
                  {/* <div className="grid gap-2 w-[100%] max-w-[800px] mx-2"> */}
                  <Button
                    onClick={fetchBotColor}
                    disabled={isLoading}
                    className="w-[95%]"
                  >
                    {isLoading ? "Loading..." : "Fetch Color"}
                  </Button>
                  {/* </div> */}
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
                    ? `${robotTextBoxColor} ml-0 mr-auto`
                    : message.role === "user"
                    ? "bg-light-grey text-primary-foreground ml-auto mr-0"
                    : "bg-yellow-100 text-yellow-800 mx-auto"
                }`}
                style={{
                  backgroundColor:
                    message.role === "bot"
                      ? popoverColor || defaultColor
                      : message.role === "user"
                      ? "lightgrey"
                      : undefined,
                  color: "black",
                  borderColor:
                    (message.role === "bot" && popoverColor) || defaultColor
                      ? inputColor
                      : undefined,
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
                        onClick={() => handleReaction(index, "like")}
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
                        onClick={() => handleReaction(index, "dislike")}
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
            handleSendMessage();
          }}
          className="flex w-full items-center space-x-2"
        >
          <div className="w-full">
            <Input
              ref={inputRef}
              className="flex w-full"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
}