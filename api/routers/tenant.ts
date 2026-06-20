import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const tenantRouter = createRouter(createCrudRouter(schema.tenants, "tenant", ["name"]));
