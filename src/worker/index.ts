import { Hono } from "hono";
import { usersRoutes } from "./controller/UsersRoutes";
import { placesRoutes } from "./controller/PlacesRoutes";
import { categoriesRoutes } from "./controller/CategoriesRoutes";
import { userActionsRoutes } from "./controller/UserActionsRoutes";
import { sharedPacksRoutes } from "./controller/SharedPacksRoutes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const api = new Hono<{ Bindings: Env }>().use(logger()).use(cors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = api
  .get("/", (c) => c.json({ message: "Hello, World!" }))
  .get("/debug/ip", (c) => {
    // Cloudflare WorkersのIPアドレス情報を取得
    const cf = c.req.raw.cf;
    const headers = c.req.raw.headers;
    
    return c.json({
      // Cloudflare経由のリクエストの場合、実際のクライアントIPは取得できない
      // Cloudflare Workers自体のIPアドレスは動的で、複数のIP範囲を使用
      message: "Cloudflare Workersは動的IPを使用するため、特定のIPアドレスを制限に追加するのは困難です",
      recommendation: "開発環境では「アプリケーションの制限」を「なし」に設定することを推奨します",
      requestInfo: {
        // リクエストヘッダーから取得できる情報
        userAgent: headers.get("user-agent"),
        cfRay: headers.get("cf-ray"),
        // Cloudflareの情報（利用可能な場合）
        country: cf?.country,
        colo: cf?.colo,
        asn: cf?.asn,
        asOrganization: cf?.asOrganization,
      },
      note: "本番環境では、APIキーを別途作成し、サーバーサイド用として「なし」または「IPアドレス」制限を設定してください",
    });
  })
  .route("/users", usersRoutes)
  .route("/places", placesRoutes)
  .route("/categories", categoriesRoutes)
  .route("/user-actions", userActionsRoutes)
  .route("/shared-packs", sharedPacksRoutes);

const app = new Hono<{ Bindings: Env }>()
  .route("/api", api)
  .all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
export type ApiType = typeof routes;
