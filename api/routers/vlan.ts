import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const vlanRouter = createRouter(createCrudRouter(schema.vlans, "vlan", ["name", "description"]));
