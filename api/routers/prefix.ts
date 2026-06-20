import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const prefixRouter = createRouter(createCrudRouter(schema.prefixes, "prefix", ["prefix", "description"]));
