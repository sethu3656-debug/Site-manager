import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const regionRouter = createRouter(createCrudRouter(schema.regions, "region", ["name"]));
