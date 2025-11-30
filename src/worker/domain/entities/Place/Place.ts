import { z } from "zod";
import { PlaceId, Latitude, Longitude } from "../../value-object";

const placeSchema = z.object({
  placeId: z.custom<PlaceId>((val) => val instanceof PlaceId, "Invalid place ID"),
  latitude: z.custom<Latitude>((val) => val instanceof Latitude, "Invalid latitude"),
  longitude: z.custom<Longitude>((val) => val instanceof Longitude, "Invalid longitude"),
  createdAt: z.date(),
});

export class Place {
  private constructor(
    public readonly placeId: PlaceId,
    public readonly latitude: Latitude,
    public readonly longitude: Longitude,
    public readonly createdAt: Date
  ) {}

  static of(
    placeId: PlaceId,
    latitude: Latitude,
    longitude: Longitude,
    createdAt: Date = new Date()
  ): Place {
    const validated = placeSchema.parse({
      placeId,
      latitude,
      longitude,
      createdAt,
    });
    return new Place(
      validated.placeId,
      validated.latitude,
      validated.longitude,
      validated.createdAt
    );
  }

  static tryOf(
    placeId: PlaceId,
    latitude: Latitude,
    longitude: Longitude,
    createdAt: Date = new Date()
  ): { success: true; value: Place } | { success: false; error: string } {
    const result = placeSchema.safeParse({
      placeId,
      latitude,
      longitude,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new Place(
          result.data.placeId,
          result.data.latitude,
          result.data.longitude,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    placeId: string;
    latitude: number;
    longitude: number;
    createdAt: string;
  } {
    return {
      placeId: this.placeId.value,
      latitude: this.latitude.value,
      longitude: this.longitude.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
