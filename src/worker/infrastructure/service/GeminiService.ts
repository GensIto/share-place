import { z } from "zod";

const geminiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string() })),
      }),
    })
  ),
});

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
  private readonly baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models";
  private readonly model = "gemini-1.5-flash";

  constructor(private readonly apiKey: string) {}

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

    const response = await fetch(
      `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const json = await response.json();
    const parseResult = geminiResponseSchema.safeParse(json);

    if (!parseResult.success) {
      throw new Error(
        `Invalid Gemini API response: ${parseResult.error.message}`
      );
    }

    const text = parseResult.data.candidates[0]?.content?.parts[0]?.text;
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
