import { z } from "zod";

/**
 * Google Places API (New) Service
 * https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */

const googlePlaceResultSchema = z.object({
  id: z.string(),
  displayName: z.object({
    text: z.string(),
    languageCode: z.string(),
  }),
  formattedAddress: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  priceLevel: z
    .enum([
      "PRICE_LEVEL_UNSPECIFIED",
      "PRICE_LEVEL_FREE",
      "PRICE_LEVEL_INEXPENSIVE",
      "PRICE_LEVEL_MODERATE",
      "PRICE_LEVEL_EXPENSIVE",
      "PRICE_LEVEL_VERY_EXPENSIVE",
    ])
    .optional(),
  primaryType: z.string().optional(),
  primaryTypeDisplayName: z
    .object({
      text: z.string(),
      languageCode: z.string(),
    })
    .optional(),
  photos: z
    .array(
      z.object({
        name: z.string(),
        widthPx: z.number(),
        heightPx: z.number(),
      })
    )
    .optional(),
});

const placesResponseSchema = z.object({
  places: z.array(googlePlaceResultSchema).optional(),
});

export type GooglePlaceResult = z.infer<typeof googlePlaceResultSchema>;

export type NearbySearchRequest = {
  latitude: number;
  longitude: number;
  radius?: number;
  includedTypes?: string[];
  excludedTypes?: string[];
  maxResultCount?: number;
  languageCode?: string;
};

export type TextSearchRequest = {
  textQuery: string;
  latitude: number;
  longitude: number;
  radius?: number;
  includedType?: string;
  maxResultCount?: number;
  languageCode?: string;
};

export type NearbySearchResponse = {
  places: GooglePlaceResult[];
};

export type TextSearchResponse = {
  places: GooglePlaceResult[];
};

export interface IGooglePlacesService {
  nearbySearch(request: NearbySearchRequest): Promise<NearbySearchResponse>;
  textSearch(request: TextSearchRequest): Promise<TextSearchResponse>;
  getPhotoUrl(photoName: string, maxWidth?: number): string;
}

export class GooglePlacesService implements IGooglePlacesService {
  private readonly baseUrl = "https://places.googleapis.com/v1/places";

  constructor(private readonly apiKey: string) {}

  async nearbySearch(
    request: NearbySearchRequest
  ): Promise<NearbySearchResponse> {
    const {
      latitude,
      longitude,
      radius = 1000,
      includedTypes,
      excludedTypes,
      maxResultCount = 20,
      languageCode = "ja",
    } = request;

    const body = {
      includedTypes: includedTypes ?? ["restaurant", "cafe", "bar"],
      excludedTypes,
      maxResultCount: Math.min(maxResultCount, 20),
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
      languageCode,
    };

    const response = await fetch(`${this.baseUrl}:searchNearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.priceLevel",
          "places.primaryType",
          "places.primaryTypeDisplayName",
          "places.photos",
        ].join(","),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Google Places API error: ${response.status} - ${errorText}`;
      
      // 403エラーでAPIキーのリファラー制限の場合、より分かりやすいメッセージを表示
      if (response.status === 403) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.details?.some((d: any) => d.reason === "API_KEY_HTTP_REFERRER_BLOCKED")) {
            errorMessage = `Google Places APIキーの設定エラー: HTTPリファラー制限が有効になっています。サーバーサイド（Cloudflare Workers）から呼び出す場合は、Google Cloud ConsoleでAPIキーの制限を「IPアドレス」に変更するか、制限を解除してください。詳細: ${errorText}`;
          }
        } catch {
          // JSONパースに失敗した場合は元のエラーメッセージを使用
        }
      }
      
      throw new Error(errorMessage);
    }

    const json = await response.json();
    const parseResult = placesResponseSchema.safeParse(json);

    if (!parseResult.success) {
      throw new Error(
        `Invalid Google Places API response: ${parseResult.error.message}`
      );
    }

    return {
      places: parseResult.data.places ?? [],
    };
  }

  async textSearch(request: TextSearchRequest): Promise<TextSearchResponse> {
    const {
      textQuery,
      latitude,
      longitude,
      radius = 5000,
      includedType,
      maxResultCount = 20,
      languageCode = "ja",
    } = request;

    const body: Record<string, unknown> = {
      textQuery,
      maxResultCount: Math.min(maxResultCount, 20),
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
      languageCode,
    };

    if (includedType) {
      body.includedType = includedType;
    }

    const response = await fetch(`${this.baseUrl}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.priceLevel",
          "places.primaryType",
          "places.primaryTypeDisplayName",
          "places.photos",
        ].join(","),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Google Places API error: ${response.status} - ${errorText}`;
      
      // 403エラーでAPIキーのリファラー制限の場合、より分かりやすいメッセージを表示
      if (response.status === 403) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.details?.some((d: any) => d.reason === "API_KEY_HTTP_REFERRER_BLOCKED")) {
            errorMessage = `Google Places APIキーの設定エラー: HTTPリファラー制限が有効になっています。サーバーサイド（Cloudflare Workers）から呼び出す場合は、Google Cloud ConsoleでAPIキーの制限を「IPアドレス」に変更するか、制限を解除してください。詳細: ${errorText}`;
          }
        } catch {
          // JSONパースに失敗した場合は元のエラーメッセージを使用
        }
      }
      
      throw new Error(errorMessage);
    }

    const json = await response.json();
    const parseResult = placesResponseSchema.safeParse(json);

    if (!parseResult.success) {
      throw new Error(
        `Invalid Google Places API response: ${parseResult.error.message}`
      );
    }

    return {
      places: parseResult.data.places ?? [],
    };
  }

  getPhotoUrl(photoName: string, maxWidth: number = 400): string {
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${this.apiKey}`;
  }
}

/**
 * Convert Google Places API price level to numeric value (0-4)
 */
export function priceLevelToNumber(priceLevel?: string): number | null {
  switch (priceLevel) {
    case "PRICE_LEVEL_FREE":
      return 0;
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return null;
  }
}
