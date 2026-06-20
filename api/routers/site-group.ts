import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const siteGroupRouter = createRouter(createCrudRouter(schema.siteGroups, "siteGroup", ["name"]));
