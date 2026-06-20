import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const platformRouter = createRouter(createCrudRouter(schema.platforms, "platform", ["name"]));
