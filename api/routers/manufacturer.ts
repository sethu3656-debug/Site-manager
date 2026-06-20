import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const manufacturerRouter = createRouter(createCrudRouter(schema.manufacturers, "manufacturer", ["name"]));
