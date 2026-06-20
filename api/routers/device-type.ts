import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const deviceTypeRouter = createRouter(createCrudRouter(schema.deviceTypes, "device-type", ["model", "partNumber"]));
