import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const providerRouter = createRouter(createCrudRouter(schema.providers, "provider", ["name"]));
