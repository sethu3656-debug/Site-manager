import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const virtualMachineRouter = createRouter(createCrudRouter(schema.virtualMachines, "virtual-machine", ["name", "description"]));
