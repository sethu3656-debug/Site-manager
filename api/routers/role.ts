import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const roleRouter = createRouter(createCrudRouter(schema.roles, "role", ["name"]));
