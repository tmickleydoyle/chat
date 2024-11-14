import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const defaultColor = "#c2deb9";

export const useColorManagement = () => {
  const [inputColor, setInputColor] = useState("");
  const [popoverColor, setPopoverColor] = useState(defaultColor);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleColorChange = (value: string) => {
    setInputColor(value);
  };

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
        setPopoverColor(hexColor);
      } else {
        setPopoverColor(defaultColor);
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

  return {
    inputColor,
    popoverColor,
    isLoading,
    handleColorChange,
    fetchBotColor,
  };
};

