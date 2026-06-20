import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const rackRoleRouter = createRouter(createCrudRouter(schema.rackRoles, "rackRole", ["name"]));
