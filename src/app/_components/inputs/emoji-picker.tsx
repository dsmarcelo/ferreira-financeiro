"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const CATEGORY_EMOJIS = [
  "💸",
  "💰",
  "🏠",
  "🚗",
  "🍕",
  "🛒",
  "👕",
  "💊",
  "🎮",
  "📱",
  "✈️",
  "🎬",
  "📚",
  "⚽",
  "🎵",
  "💡",
  "🔧",
  "🎂",
  "☕",
  "🌮",
  "💳",
  "🏦",
  "🎯",
  "📊",
  "💼",
  "🎪",
  "🎨",
  "🧾",
  "📝",
  "🛍️",
  "🏥",
  "⛽",
  "🍔",
  "🍺",
  "🎊",
  "🎁",
  "🧳",
  "🚿",
  "🧴",
  "🔌",
  "📖",
  "🎤",
  "🏃",
  "🧠",
  "💻",
  "📷",
  "🎸",
  "🍇",
  "🥤",
  "🚲",
];

interface EmojiPickerProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  label?: string;
  messages?: string[];
}

export function EmojiPicker({
  selectedEmoji,
  onEmojiSelect,
  label = "Emoji",
  messages = [],
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input type="hidden" name="emoji" value={selectedEmoji} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="hover:bg-muted h-12 w-12 p-0 text-2xl"
            type="button"
          >
            {selectedEmoji || "😀"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mx-2 max-h-80 w-[90dvw] max-w-[500px] overflow-y-auto p-2">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORY_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                className="hover:bg-muted h-10 w-10 p-0 text-2xl"
                onClick={() => handleEmojiSelect(emoji)}
                type="button"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {messages?.length > 0 && (
        <div className="text-sm text-red-600">
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
