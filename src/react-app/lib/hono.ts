import { AppType } from "../../worker/index";
import { hc } from "hono/client";

export const client = hc<AppType>("/");
