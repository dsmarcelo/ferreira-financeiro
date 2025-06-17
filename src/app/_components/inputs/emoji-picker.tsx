"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const CATEGORY_EMOJIS = [
  "💸", "💰", "🏠", "🚗", "🍕", "🛒", "👕", "💊", "🎮", "📱",
  "✈️", "🎬", "📚", "⚽", "🎵", "💡", "🔧", "🎂", "☕", "🌮",
  "💳", "🏦", "🎯", "📊", "💼", "🎪", "🎨", "🧾", "📝", "🛍️",
  "🏥", "⛽", "🍔", "🍺", "🎊", "🎁", "🧳", "🚿", "🧴", "🔌",
  "📖", "🎤", "🏃", "🧠", "💻", "📷", "🎸", "🍇", "🥤", "🚲"
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-20 h-20 text-2xl p-0 hover:bg-muted"
            type="button"
          >
            {selectedEmoji || "😀"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="grid grid-cols-8 gap-2">
            {CATEGORY_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                className="w-8 h-8 p-0 text-lg hover:bg-muted"
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