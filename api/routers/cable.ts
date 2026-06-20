import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const cableRouter = createRouter(
  createCrudRouter(schema.cables, "cables", ["type", "description"])
);
