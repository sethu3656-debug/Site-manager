import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const deviceRoleRouter = createRouter(createCrudRouter(schema.deviceRoles, "device-role", ["name"]));
