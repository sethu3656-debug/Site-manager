import { createRouter } from "../middleware";
import { createCrudRouter } from "./_helpers";
import * as schema from "@db/schema";

export const ipAddressRouter = createRouter(createCrudRouter(schema.ipAddresses, "ip-address", ["address", "dnsName", "description"]));
