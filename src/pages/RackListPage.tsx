import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function RackListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Queries for list & relations
  const { data: sites } = trpc.site.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: locations } = trpc.location.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: tenants } = trpc.tenant.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: rackRoles } = trpc.rackRole.list.useQuery({ page: 1, pageSize: 1000 });
  const { data, refetch } = trpc.rack.list.useQuery({ page, pageSize: 25, search });

  const create = trpc.rack.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.rack.update.useMutation({ onSuccess: () => refetch() });
  const del = trpc.rack.delete.useMutation({ onSuccess: () => refetch() });

  // Map relations for display in columns with explicit number->string types
  const siteMap = useMemo(() => new Map<number, string>(sites?.items?.map((s: any) => [s.id, s.name]) || []), [sites]);
  const locationMap = useMemo(() => new Map<number, string>(locations?.items?.map((l: any) => [l.id, l.name]) || []), [locations]);
  const tenantMap = useMemo(() => new Map<number, string>(tenants?.items?.map((t: any) => [t.id, t.name]) || []), [tenants]);
  const roleMap = useMemo(() => new Map<number, string>(rackRoles?.items?.map((r: any) => [r.id, r.name]) || []), [rackRoles]);

  // Options for forms
  const siteOptions = sites?.items.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [];
  const locationOptions = locations?.items.map((l: any) => ({ value: l.id.toString(), label: l.name })) || [];
  const tenantOptions = tenants?.items.map((t: any) => ({ value: t.id.toString(), label: t.name })) || [];
  const roleOptions = rackRoles?.items.map((r: any) => ({ value: r.id.toString(), label: r.name })) || [];

  const parseSubmitData = (formData: Record<string, any>) => {
    return {
      ...formData,
      siteId: Number(formData.siteId),
      locationId: formData.locationId ? Number(formData.locationId) : null,
      tenantId: formData.tenantId ? Number(formData.tenantId) : null,
      roleId: formData.roleId ? Number(formData.roleId) : null,
      uHeight: formData.uHeight ? Number(formData.uHeight) : 42,
      descUnits: formData.descUnits === "true" || formData.descUnits === true,
      serial: formData.serial || null,
      assetTag: formData.assetTag || null,
      type: formData.type || null,
      width: formData.width || "19",
    };
  };

  return (
    <CrudListPage
      title="Racks"
      description="Physical rack units in datacenters"
      moduleColor="#10B981"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "siteId", label: "Site", render: (v) => siteMap.get(Number(v)) || "—" },
        { key: "locationId", label: "Location", render: (v) => locationMap.get(Number(v)) || "—" },
        { key: "tenantId", label: "Tenant", render: (v) => tenantMap.get(Number(v)) || "—" },
        { key: "roleId", label: "Role", render: (v) => roleMap.get(Number(v)) || "—" },
        { key: "uHeight", label: "Height (U)", sortable: true },
        { key: "type", label: "Type" },
        { key: "width", label: "Width" },
        { key: "serial", label: "Serial" },
        { key: "assetTag", label: "Asset Tag" },
      ]}
      data={data?.items || []}
      total={data?.total || 0}
      page={page}
      pageSize={25}
      onPageChange={setPage}
      onSearch={setSearch}
      onRefresh={refetch}
      onDelete={(id) => del.mutate({ id })}
      onUpdate={(id, udata) => update.mutate({ id, data: parseSubmitData(udata) })}
      detailPath={(id) => `/racks/${id}`}
      statusOptions={["reserved", "available", "planned", "active", "deprecated"]}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "reserved", label: "Reserved" }, { value: "available", label: "Available" }, { value: "planned", label: "Planned" }, { value: "deprecated", label: "Deprecated" }] },
          { key: "siteId", label: "Site", type: "select", options: siteOptions, required: true },
          { key: "locationId", label: "Location", type: "select", options: locationOptions },
          { key: "tenantId", label: "Tenant", type: "select", options: tenantOptions },
          { key: "roleId", label: "Rack Role", type: "select", options: roleOptions },
          { key: "uHeight", label: "Height (U)", type: "number", required: true },
          { key: "type", label: "Rack Type", type: "select", options: [
            { value: "2-post-frame", label: "2-Post Frame" },
            { value: "4-post-frame", label: "4-Post Frame" },
            { value: "4-post-cabinet", label: "4-Post Cabinet" },
            { value: "wall-frame", label: "Wall-mount Frame" },
            { value: "wall-cabinet", label: "Wall-mount Cabinet" }
          ]},
          { key: "width", label: "Rack Width", type: "select", options: [
            { value: "19", label: "19 inches" },
            { value: "21", label: "21 inches" },
            { value: "23", label: "23 inches" }
          ]},
          { key: "descUnits", label: "Descending Units", type: "select", options: [
            { value: "false", label: "False (1 at bottom)" },
            { value: "true", label: "True (1 at top)" }
          ]},
          { key: "serial", label: "Serial", type: "text" },
          { key: "assetTag", label: "Asset Tag", type: "text" },
        ],
        onSubmit: (cdata) => create.mutate(parseSubmitData(cdata)),
      }}
    />
  );
}
