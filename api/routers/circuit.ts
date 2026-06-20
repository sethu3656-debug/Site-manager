import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const circuitRouter = createRouter(createCrudRouter(schema.circuits, "circuit", ["cid", "description"]));
