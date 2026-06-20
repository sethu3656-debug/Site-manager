import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const vrfRouter = createRouter(createCrudRouter(schema.vrfs, "vrf", ["name", "rd", "description"]));
