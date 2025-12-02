import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const extractedSearchParamsSchema = z.object({
  searchKeywords: z.array(z.string()),
  placeTypes: z.array(z.string()),
  priceLevel: z.enum(["cheap", "moderate", "expensive"]).nullable().optional(),
  vibeKeywords: z.array(z.string()),
});

export type ExtractedSearchParams = {
  searchKeywords: string[];
  placeTypes: string[];
  priceLevel?: "cheap" | "moderate" | "expensive";
  vibeKeywords: string[];
};

export interface IGeminiService {
  extractSearchParams(query: string): Promise<ExtractedSearchParams>;
}

export class GeminiService implements IGeminiService {
  private readonly client: GoogleGenAI;
  private readonly model = "gemini-1.5-flash";

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async extractSearchParams(query: string): Promise<ExtractedSearchParams> {
    const prompt = `あなたは場所検索のアシスタントです。ユーザーの自然言語クエリから、Google Places APIで検索するためのパラメータを抽出してください。

ユーザーのクエリ: "${query}"

以下のJSON形式で回答してください。余計な説明は不要です。JSONのみを出力してください。

{
  "searchKeywords": ["検索に使うキーワード（例：ラーメン、カフェ、イタリアン）"],
  "placeTypes": ["Google Places APIのtype（例：restaurant, cafe, bar, bakery）"],
  "priceLevel": "cheap | moderate | expensive | null",
  "vibeKeywords": ["雰囲気を表すキーワード（例：おしゃれ、静か、にぎやか）"]
}

利用可能なplaceTypes: restaurant, cafe, bar, bakery, meal_takeaway, meal_delivery, night_club, spa, gym, park, museum, shopping_mall, store`;

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = extractedSearchParamsSchema.safeParse(
        JSON.parse(jsonMatch[0])
      );
      if (!parsed.success) {
        throw new Error("Invalid extracted params");
      }
      return {
        searchKeywords: parsed.data.searchKeywords,
        placeTypes: parsed.data.placeTypes,
        priceLevel: parsed.data.priceLevel ?? undefined,
        vibeKeywords: parsed.data.vibeKeywords,
      };
    } catch {
      return {
        searchKeywords: [query],
        placeTypes: ["restaurant"],
        vibeKeywords: [],
      };
    }
  }
}
