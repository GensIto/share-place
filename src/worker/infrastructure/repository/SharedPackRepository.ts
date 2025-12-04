import { eq, desc } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { sharedPacks, sharedPackItems } from "../../db/sharedPacks";
import { placeDetailsCache, places } from "../../db/places";
import { users } from "../../db/auth";
import { SharedPack, SharedPackItem } from "../../domain/entities";
import {
  ShareToken,
  SharedPackItemId,
  PackTitle,
  SortOrder,
} from "../../domain/value-object/sharedPack";
import { PlaceId } from "../../domain/value-object/place";
import { UserId } from "../../domain/value-object/user";
import * as schema from "../../db/schema";

export type SharedPackWithItems = {
  sharedPack: SharedPack;
  items: SharedPackItem[];
};

export type SharedPackWithCreator = {
  sharedPack: SharedPack;
  creator: {
    userId: string;
    name: string;
    image: string | null;
  };
  items: Array<{
    sharedPackItemId: number;
    placeId: string;
    publicComment: string | null;
    sortOrder: number;
    placeDetails: {
      name: string;
      address: string | null;
      latitude: number;
      longitude: number;
      photoReference: string | null; // photo reference（画像URLではなく参照のみ）
      rating: number | null;
      reviewCount: number | null;
      priceLevel: number | null;
      categoryTag: string | null;
    } | null;
  }>;
};

export type SharedPackSummary = {
  shareToken: string;
  title: string;
  message: string | null;
  itemCount: number;
  thumbnails: string[];
  createdAt: Date;
};

export interface ISharedPackRepository {
  create(
    sharedPack: SharedPack,
    items: SharedPackItem[]
  ): Promise<SharedPackWithItems>;
  findByShareToken(
    shareToken: ShareToken
  ): Promise<SharedPackWithCreator | null>;
  findByCreatorId(
    creatorId: UserId,
    limit: number,
    offset: number
  ): Promise<{ sharedPacks: SharedPackSummary[]; totalCount: number }>;
}

export class SharedPackRepository implements ISharedPackRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  async create(
    sharedPack: SharedPack,
    items: SharedPackItem[]
  ): Promise<SharedPackWithItems> {
    const insertedPack = await this.db
      .insert(sharedPacks)
      .values({
        shareToken: sharedPack.shareToken.value,
        creatorId: sharedPack.creatorId.value,
        title: sharedPack.title.value,
        message: sharedPack.message,
        createdAt: sharedPack.createdAt,
      })
      .returning()
      .get();

    const insertedItems: SharedPackItem[] = [];
    for (const item of items) {
      const insertedItem = await this.db
        .insert(sharedPackItems)
        .values({
          sharedPackToken: item.sharedPackToken.value,
          placeId: item.placeId.value,
          publicComment: item.publicComment,
          sortOrder: item.sortOrder.value,
        })
        .returning()
        .get();

      insertedItems.push(
        SharedPackItem.of(
          SharedPackItemId.of(insertedItem.sharedPackItemId),
          ShareToken.of(insertedItem.sharedPackToken),
          PlaceId.of(insertedItem.placeId),
          insertedItem.publicComment,
          SortOrder.of(insertedItem.sortOrder)
        )
      );
    }

    return {
      sharedPack: SharedPack.of(
        ShareToken.of(insertedPack.shareToken),
        UserId.of(insertedPack.creatorId),
        PackTitle.of(insertedPack.title),
        insertedPack.message,
        insertedPack.createdAt
      ),
      items: insertedItems,
    };
  }

  async findByShareToken(
    shareToken: ShareToken
  ): Promise<SharedPackWithCreator | null> {
    const pack = await this.db
      .select()
      .from(sharedPacks)
      .innerJoin(users, eq(sharedPacks.creatorId, users.userId))
      .where(eq(sharedPacks.shareToken, shareToken.value))
      .get();

    if (!pack) {
      return null;
    }

    const items = await this.db
      .select()
      .from(sharedPackItems)
      .leftJoin(places, eq(sharedPackItems.placeId, places.placeId))
      .leftJoin(
        placeDetailsCache,
        eq(sharedPackItems.placeId, placeDetailsCache.placeId)
      )
      .where(eq(sharedPackItems.sharedPackToken, shareToken.value))
      .orderBy(sharedPackItems.sortOrder)
      .all();

    return {
      sharedPack: SharedPack.of(
        ShareToken.of(pack.shared_packs.shareToken),
        UserId.of(pack.shared_packs.creatorId),
        PackTitle.of(pack.shared_packs.title),
        pack.shared_packs.message,
        pack.shared_packs.createdAt
      ),
      creator: {
        userId: pack.users.userId,
        name: pack.users.name,
        image: pack.users.image,
      },
      items: items.map((row) => ({
        sharedPackItemId: row.shared_pack_items.sharedPackItemId,
        placeId: row.shared_pack_items.placeId,
        publicComment: row.shared_pack_items.publicComment,
        sortOrder: row.shared_pack_items.sortOrder,
        placeDetails: row.place_details_cache
          ? {
              name: row.place_details_cache.name,
              address: row.place_details_cache.address,
              latitude: row.places?.latitude ?? 0,
              longitude: row.places?.longitude ?? 0,
              photoReference: row.place_details_cache.photoReference,
              rating: row.place_details_cache.rating,
              reviewCount: row.place_details_cache.reviewCount,
              priceLevel: row.place_details_cache.priceLevel,
              categoryTag: row.place_details_cache.categoryTag,
            }
          : null,
      })),
    };
  }

  async findByCreatorId(
    creatorId: UserId,
    limit: number,
    offset: number
  ): Promise<{ sharedPacks: SharedPackSummary[]; totalCount: number }> {
    const packs = await this.db
      .select()
      .from(sharedPacks)
      .where(eq(sharedPacks.creatorId, creatorId.value))
      .orderBy(desc(sharedPacks.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = await this.db
      .select()
      .from(sharedPacks)
      .where(eq(sharedPacks.creatorId, creatorId.value))
      .all();

    const totalCount = countResult.length;

    const summaries: SharedPackSummary[] = [];
    for (const pack of packs) {
      const allItems = await this.db
        .select()
        .from(sharedPackItems)
        .where(eq(sharedPackItems.sharedPackToken, pack.shareToken))
        .all();

      const itemsWithThumbnails = await this.db
        .select()
        .from(sharedPackItems)
        .leftJoin(
          placeDetailsCache,
          eq(sharedPackItems.placeId, placeDetailsCache.placeId)
        )
        .where(eq(sharedPackItems.sharedPackToken, pack.shareToken))
        .orderBy(sharedPackItems.sortOrder)
        .limit(3)
        .all();

      summaries.push({
        shareToken: pack.shareToken,
        title: pack.title,
        message: pack.message,
        itemCount: allItems.length,
        // サムネイルはphotoReferenceから生成する必要があるが、
        // リポジトリ層では画像URLを生成しない（UseCase層で行う）
        thumbnails: [], // UseCase層でphotoReferenceから画像URLを生成
        createdAt: pack.createdAt,
      });
    }

    return { sharedPacks: summaries, totalCount };
  }
}
