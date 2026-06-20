import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const aggregateRouter = createRouter(createCrudRouter(schema.aggregates, "aggregate", ["prefix", "description"]));
