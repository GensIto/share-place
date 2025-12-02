import { nanoid } from "nanoid";
import { HTTPException } from "hono/http-exception";
import { ISharedPackRepository } from "../../infrastructure/repository/SharedPackRepository";
import { IPlaceRepository } from "../../infrastructure/repository/PlaceRepository";
import { SharedPack, SharedPackItem } from "../../domain/entities";
import {
  ShareToken,
  SharedPackItemId,
  PackTitle,
  SortOrder,
} from "../../domain/value-object/sharedPack";
import { PlaceId } from "../../domain/value-object/place";
import { UserId } from "../../domain/value-object/user";

export type CreateSharedPackInput = {
  userId: string;
  title: string;
  message?: string | null;
  items: Array<{
    placeId: string;
    publicComment?: string | null;
    sortOrder?: number;
  }>;
};

export type CreateSharedPackOutput = {
  shareToken: string;
  shareUrl: string;
  title: string;
  message: string | null;
  itemCount: number;
  createdAt: string;
};

export class CreateSharedPackUseCase {
  constructor(
    private readonly sharedPackRepository: ISharedPackRepository,
    private readonly placeRepository: IPlaceRepository,
    private readonly baseUrl: string
  ) {}

  async invoke(input: CreateSharedPackInput): Promise<CreateSharedPackOutput> {
    if (input.items.length === 0) {
      throw new HTTPException(400, {
        message: "1件以上のアイテムを選択してください",
      });
    }

    for (const item of input.items) {
      const place = await this.placeRepository.findById(
        PlaceId.of(item.placeId)
      );
      if (!place) {
        throw new HTTPException(400, {
          message: `指定された場所が見つかりません: ${item.placeId}`,
        });
      }
    }

    const shareToken = ShareToken.of(nanoid(10));
    const creatorId = UserId.of(input.userId);
    const title = PackTitle.of(input.title);

    const sharedPack = SharedPack.of(
      shareToken,
      creatorId,
      title,
      input.message ?? null
    );

    const sharedPackItems = input.items.map((item, index) =>
      SharedPackItem.of(
        SharedPackItemId.of(0),
        shareToken,
        PlaceId.of(item.placeId),
        item.publicComment ?? null,
        SortOrder.of(item.sortOrder ?? index)
      )
    );

    const result = await this.sharedPackRepository.create(
      sharedPack,
      sharedPackItems
    );

    return {
      shareToken: result.sharedPack.shareToken.value,
      shareUrl: `${this.baseUrl}/p/${result.sharedPack.shareToken.value}`,
      title: result.sharedPack.title.value,
      message: result.sharedPack.message,
      itemCount: result.items.length,
      createdAt: result.sharedPack.createdAt.toISOString(),
    };
  }
}
