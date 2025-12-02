import { eq, and, desc, inArray, count } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { userActions } from "../../db/userActions";
import { placeDetailsCache } from "../../db/places";
import { UserAction } from "../../domain/entities";
import { UserActionId, ActionType } from "../../domain/value-object/userAction";
import { UserId } from "../../domain/value-object/user";
import { PlaceId } from "../../domain/value-object/place";
import * as schema from "../../db/schema";

export type UserActionWithPlace = {
  userAction: UserAction;
  place: {
    name: string;
    cachedImageUrl: string | null;
  } | null;
};

export type FindUserActionsParams = {
  userId: UserId;
  actionType?: ActionType;
  placeIds?: PlaceId[];
  limit?: number;
  offset?: number;
};

export type CreateUserActionInput = {
  userId: UserId;
  placeId: PlaceId;
  actionType: ActionType;
};

export interface IUserActionRepository {
  create(input: CreateUserActionInput): Promise<UserAction>;
  findByUserId(params: FindUserActionsParams): Promise<{
    actions: UserActionWithPlace[];
    totalCount: number;
  }>;
  findNopedPlaceIds(userId: UserId): Promise<PlaceId[]>;
}

export class UserActionRepository implements IUserActionRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  async create(input: CreateUserActionInput): Promise<UserAction> {
    const result = await this.db
      .insert(userActions)
      .values({
        userId: input.userId.value,
        placeId: input.placeId.value,
        actionType: input.actionType.value,
      })
      .returning()
      .get();

    return this.toEntity(result);
  }

  async findByUserId(params: FindUserActionsParams): Promise<{
    actions: UserActionWithPlace[];
    totalCount: number;
  }> {
    const { userId, actionType, placeIds, limit = 100, offset = 0 } = params;

    const conditions = [eq(userActions.userId, userId.value)];

    if (actionType) {
      conditions.push(eq(userActions.actionType, actionType.value));
    }

    if (placeIds && placeIds.length > 0) {
      conditions.push(
        inArray(
          userActions.placeId,
          placeIds.map((p) => p.value)
        )
      );
    }

    const whereClause = and(...conditions);

    const [results, countResult] = await Promise.all([
      this.db
        .select({
          userAction: userActions,
          place: {
            name: placeDetailsCache.name,
            cachedImageUrl: placeDetailsCache.cachedImageUrl,
          },
        })
        .from(userActions)
        .leftJoin(
          placeDetailsCache,
          eq(userActions.placeId, placeDetailsCache.placeId)
        )
        .where(whereClause)
        .orderBy(desc(userActions.createdAt))
        .limit(limit)
        .offset(offset)
        .all(),
      this.db
        .select({ count: count() })
        .from(userActions)
        .where(whereClause)
        .get(),
    ]);

    return {
      actions: results.map((r) => ({
        userAction: this.toEntity(r.userAction),
        place: r.place?.name
          ? {
              name: r.place.name,
              cachedImageUrl: r.place.cachedImageUrl,
            }
          : null,
      })),
      totalCount: countResult?.count ?? 0,
    };
  }

  async findNopedPlaceIds(userId: UserId): Promise<PlaceId[]> {
    const results = await this.db
      .select({ placeId: userActions.placeId })
      .from(userActions)
      .where(
        and(
          eq(userActions.userId, userId.value),
          eq(userActions.actionType, "NOPE")
        )
      )
      .all();

    return results.map((r) => PlaceId.of(r.placeId));
  }

  private toEntity(row: typeof userActions.$inferSelect): UserAction {
    return UserAction.of(
      UserActionId.of(row.userActionId),
      UserId.of(row.userId),
      PlaceId.of(row.placeId),
      ActionType.of(row.actionType),
      row.createdAt
    );
  }
}
