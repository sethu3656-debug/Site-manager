import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const clusterRouter = createRouter(createCrudRouter(schema.clusters, "cluster", ["name"]));
