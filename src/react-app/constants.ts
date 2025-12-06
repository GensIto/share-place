import { parseAsString } from "nuqs";

export const PLACE_TYPES = [
  { value: "art_gallery", label: "美術館", emoji: "🖼️" },
  { value: "tourist_attraction", label: "観光名所", emoji: "📸" },
  { value: "cafe", label: "カフェ", emoji: "☕" },
  { value: "bar", label: "バー", emoji: "🍺" },
  { value: "florist", label: "花屋", emoji: "🌹" },
  { value: "park", label: "公園", emoji: "🌳" },
  { value: "gym", label: "ジム", emoji: "💪" },
];

export const SEARCH_PARAMS = {
  searchMode: parseAsString.withDefault("ai"),
  type: parseAsString.withDefault(""),
  keyword: parseAsString.withDefault(""),
  prompt: parseAsString.withDefault(""),
};
