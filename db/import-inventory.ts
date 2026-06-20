import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import { sql, eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function doImport() {
  const db = getDb();
  console.log("Starting data import from clean_inventory.json...");

  // Read file
  const jsonPath = path.join(process.cwd(), "clean_inventory.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("clean_inventory.json not found in working directory!");
    return;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Disable FK Checks
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

  try {
    // 1. Clear database tables
    console.log("Clearing old records...");
    await db.delete(schema.sessions);
    await db.delete(schema.userGroups);
    await db.delete(schema.tenantGroups);
    await db.delete(schema.tenants);
    await db.delete(schema.regions);
    await db.delete(schema.siteGroups);
    await db.delete(schema.sites);
    await db.delete(schema.locations);
    await db.delete(schema.rackRoles);
    await db.delete(schema.racks);
    await db.delete(schema.manufacturers);
    await db.delete(schema.platforms);
    await db.delete(schema.deviceRoles);
    await db.delete(schema.deviceTypes);
    await db.delete(schema.devices);
    await db.delete(schema.interfaces);
    await db.delete(schema.rirs);
    await db.delete(schema.aggregates);
    await db.delete(schema.roles);
    await db.delete(schema.vrfs);
    await db.delete(schema.prefixes);
    await db.delete(schema.ipAddresses);
    await db.delete(schema.ipRanges);
    await db.delete(schema.vlans);
    await db.delete(schema.vlanGroups);
    await db.delete(schema.asns);
    await db.delete(schema.services);
    await db.delete(schema.providers);
    await db.delete(schema.circuits);
    await db.delete(schema.circuitTypes);
    await db.delete(schema.clusters);
    await db.delete(schema.clusterTypes);
    await db.delete(schema.virtualMachines);
    await db.delete(schema.cables);

    // Make sure admin user exists
    const existingAdmin = await db.select().from(schema.users).where(eq(schema.users.username, "admin")).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(schema.users).values({
        username: "admin",
        email: "admin@sitemanager.local",
        name: "Admin User",
        role: "admin",
        status: "active",
        password: "admin",
        unionId: "admin",
      });
    }

    // 2. Import Sites
    console.log(`Importing ${data.sites?.length || 0} sites...`);
    const siteIdMap = new Map<string, number>(); // name -> DB id
    if (data.sites) {
      for (const s of data.sites) {
        const slug = slugify(s.name) || "site-imported";
        const result = await db.insert(schema.sites).values({
          name: s.name,
          slug,
          status: "active",
          description: s.description || null,
          latitude: s.latitude && s.latitude !== "None" ? s.latitude : null,
          longitude: s.longitude && s.longitude !== "None" ? s.longitude : null,
          customData: {
            x: s.x,
            y: s.y,
            z: s.z,
            height: s.height,
            l1_delay: s.l1_delay,
            s_delay: s.s_delay,
            l5_delay: s.l5_delay,
          },
        }).$returningId();
        siteIdMap.set(s.name, result[0].id);
      }
    }

    // 3. Import Racks
    console.log(`Importing ${data.racks?.length || 0} racks...`);
    const rackIdMap = new Map<string, number>(); // name -> DB id
    if (data.racks) {
      for (const r of data.racks) {
        const siteId = siteIdMap.get(r.site);
        if (!siteId) {
          console.warn(`Rack ${r.name} references unknown site ${r.site}. Skipping.`);
          continue;
        }
        const heightMatch = r.height ? r.height.match(/\d+/) : null;
        const uHeight = heightMatch ? parseInt(heightMatch[0], 10) : 42;

        const result = await db.insert(schema.racks).values({
          name: r.name,
          status: "active",
          siteId,
          serial: r.serial && r.serial !== "None" ? r.serial : null,
          assetTag: r.asset_id && r.asset_id !== "None" ? r.asset_id : null,
          uHeight,
          customData: {
            devices_count: r.devices,
          },
        }).$returningId();
        rackIdMap.set(r.name, result[0].id);
      }
    }

    // 4. Import Manufacturers & Roles & Device Types from Devices list
    console.log("Analyzing device types and manufacturers...");
    const mfgIdMap = new Map<string, number>();
    const roleIdMap = new Map<string, number>();
    const dtIdMap = new Map<string, number>();

    if (data.devices) {
      for (const dev of data.devices) {
        // Manufacturer
        const mfgName = dev.manufacturer || "Generic";
        if (!mfgIdMap.has(mfgName)) {
          const mfgSlug = slugify(mfgName) || `mfg-${mfgIdMap.size}`;
          const mfgResult = await db.insert(schema.manufacturers).values({
            name: mfgName,
            slug: mfgSlug,
          }).$returningId();
          mfgIdMap.set(mfgName, mfgResult[0].id);
        }

        // Role
        const roleName = dev.role || "Generic Role";
        if (!roleIdMap.has(roleName)) {
          const roleSlug = slugify(roleName) || `role-${roleIdMap.size}`;
          const roleResult = await db.insert(schema.deviceRoles).values({
            name: roleName,
            slug: roleSlug,
            color: "#3B82F6",
          }).$returningId();
          roleIdMap.set(roleName, roleResult[0].id);
        }

        // Device Type (model)
        const typeModel = dev.device_type || "Generic Model";
        const mfgId = mfgIdMap.get(mfgName)!;
        const dtKey = `${mfgName}::${typeModel}`;
        if (!dtIdMap.has(dtKey)) {
          const dtSlug = slugify(`${mfgName}-${typeModel}`) || `dt-${dtIdMap.size}`;
          const dtResult = await db.insert(schema.deviceTypes).values({
            model: typeModel,
            slug: dtSlug,
            manufacturerId: mfgId,
            uHeight: 1,
          }).$returningId();
          dtIdMap.set(dtKey, dtResult[0].id);
        }
      }
    }

    // 5. Import Devices
    console.log(`Importing ${data.devices?.length || 0} devices...`);
    const deviceIdMap = new Map<string, number>(); // name -> DB id
    if (data.devices) {
      for (const dev of data.devices) {
        const siteId = siteIdMap.get(dev.site);
        if (!siteId) {
          console.warn(`Device ${dev.name} references unknown site ${dev.site}. Skipping.`);
          continue;
        }

        const rackId = dev.rack && dev.rack !== "None" ? rackIdMap.get(dev.rack) : null;
        const roleId = roleIdMap.get(dev.role) || null;
        const deviceTypeId = dtIdMap.get(`${dev.manufacturer || "Generic"}::${dev.device_type || "Generic Model"}`) || null;

        if (!roleId || !deviceTypeId) {
          console.warn(`Device ${dev.name} is missing resolved role or device type. Skipping.`);
          continue;
        }

        // Parse position from location string, e.g. "Rack-1 / U1.0" -> 1.0
        let position: string | null = null;
        if (dev.location && dev.location !== "None") {
          const match = dev.location.match(/U(\d+(\.\d+)?)/);
          if (match) {
            position = match[1];
          }
        }

        const devStatus = ["offline", "active", "planned", "staged", "failed", "inventory", "decommissioning"].includes(dev.status)
          ? dev.status
          : "active";

        const result = await db.insert(schema.devices).values({
          name: dev.name,
          status: devStatus as any,
          deviceTypeId,
          roleId,
          siteId,
          rackId,
          position,
          face: "front",
          serial: dev.serial && dev.serial !== "None" ? dev.serial : null,
          assetTag: dev.asset_id && dev.asset_id !== "None" ? dev.asset_id : null,
          customData: {
            po_number: dev.po_number,
            chain: dev.chain,
            x: dev.x,
            y: dev.y,
            z: dev.z,
            height: dev.height,
            latitude: dev.latitude,
            longitude: dev.longitude,
            l1_delay: dev.l1_delay,
            s_delay: dev.s_delay,
            l5_delay: dev.l5_delay,
          },
        }).$returningId();
        deviceIdMap.set(dev.name, result[0].id);
      }
    }

    // 6. Import Interfaces and IP Addresses (from ips list)
    console.log(`Importing ${data.ips?.length || 0} interfaces & IP addresses...`);
    const interfaceIdMap = new Map<string, number>(); // "devName::ifaceName" -> DB id
    
    // Find or create interface helper
    const getOrCreateInterface = async (deviceName: string, interfaceName: string): Promise<number | null> => {
      const devId = deviceIdMap.get(deviceName);
      if (!devId) return null;
      
      const key = `${deviceName}::${interfaceName}`;
      if (interfaceIdMap.has(key)) {
        return interfaceIdMap.get(key)!;
      }

      // Check if it already exists in DB
      const existing = await db.select().from(schema.interfaces).where(
        sql`${schema.interfaces.deviceId} = ${devId} AND ${schema.interfaces.name} = ${interfaceName}`
      ).limit(1);

      if (existing.length > 0) {
        interfaceIdMap.set(key, existing[0].id);
        return existing[0].id;
      }

      // Create new
      const result = await db.insert(schema.interfaces).values({
        name: interfaceName,
        deviceId: devId,
        type: "1000base-t",
        enabled: true,
      }).$returningId();
      interfaceIdMap.set(key, result[0].id);
      return result[0].id;
    };

    if (data.ips) {
      for (const ip of data.ips) {
        const ifaceId = await getOrCreateInterface(ip.device, ip.interface);
        if (!ifaceId) {
          console.warn(`IP address references unknown device ${ip.device}. Skipping.`);
          continue;
        }

        // Insert IP address
        if (ip.ip_address && ip.ip_address !== "None") {
          await db.insert(schema.ipAddresses).values({
            address: ip.ip_address,
            status: "active",
            assignedObjectType: "interfaces",
            assignedObjectId: ifaceId,
            description: ip.description || null,
          });
        }
      }
    }

    // 7. Import Cables (and their interfaces if not already created)
    console.log(`Importing ${data.cables?.length || 0} cables...`);
    if (data.cables) {
      for (const cab of data.cables) {
        const ifaceAId = await getOrCreateInterface(cab.dev_a, cab.term_a);
        const ifaceBId = await getOrCreateInterface(cab.dev_b, cab.term_b);

        if (!ifaceAId || !ifaceBId) {
          console.warn(`Cable connects unknown interface(s): A: ${cab.dev_a}::${cab.term_a}, B: ${cab.dev_b}::${cab.term_b}. Skipping.`);
          continue;
        }

        const cabLength = cab.length && cab.length !== "None" ? parseFloat(cab.length) : null;
        const cabType = cab.type && cab.type !== "None" ? cab.type : "cat6";

        await db.insert(schema.cables).values({
          type: cabType,
          status: "connected",
          length: cabLength ? String(cabLength) as any : null,
          lengthUnit: "m",
          color: "#3B82F6",
          aSideObjectType: "interfaces",
          aSideObjectId: ifaceAId,
          bSideObjectType: "interfaces",
          bSideObjectId: ifaceBId,
          description: cab.label || null,
        });
      }
    }

    console.log("Data import completed successfully!");

  } catch (error) {
    console.error("Error importing inventory data:", error);
  } finally {
    // Re-enable FK Checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
  }
}

doImport().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
