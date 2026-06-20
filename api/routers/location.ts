import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const locationRouter = createRouter(createCrudRouter(schema.locations, "location", ["name"]));
