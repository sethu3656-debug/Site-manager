import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const serviceRouter = createRouter(createCrudRouter(schema.services, "service", ["name"]));
