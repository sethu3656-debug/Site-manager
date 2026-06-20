import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function DeviceListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  // Queries for list & relations
  const { data: deviceTypes } = trpc.deviceType.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: roles } = trpc.deviceRole.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: sites } = trpc.site.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: racks } = trpc.rack.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: locations } = trpc.location.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: tenants } = trpc.tenant.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: platforms } = trpc.platform.list.useQuery({ page: 1, pageSize: 1000 });

  const { data, refetch } = trpc.device.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.device.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.device.update.useMutation({ onSuccess: () => refetch() });
  const del = trpc.device.delete.useMutation({ onSuccess: () => refetch() });

  // Map relations for display in columns with explicit number->string types
  const dtMap = useMemo(() => new Map<number, string>(deviceTypes?.items?.map((t: any) => [t.id, t.model]) || []), [deviceTypes]);
  const roleMap = useMemo(() => new Map<number, string>(roles?.items?.map((r: any) => [r.id, r.name]) || []), [roles]);
  const siteMap = useMemo(() => new Map<number, string>(sites?.items?.map((s: any) => [s.id, s.name]) || []), [sites]);
  const rackMap = useMemo(() => new Map<number, string>(racks?.items?.map((k: any) => [k.id, k.name]) || []), [racks]);
  const locationMap = useMemo(() => new Map<number, string>(locations?.items?.map((l: any) => [l.id, l.name]) || []), [locations]);
  const tenantMap = useMemo(() => new Map<number, string>(tenants?.items?.map((t: any) => [t.id, t.name]) || []), [tenants]);
  const platformMap = useMemo(() => new Map<number, string>(platforms?.items?.map((p: any) => [p.id, p.name]) || []), [platforms]);

  // Options for forms
  const dtOptions = deviceTypes?.items.map((t: any) => ({ value: t.id.toString(), label: t.model })) || [];
  const roleOptions = roles?.items.map((r: any) => ({ value: r.id.toString(), label: r.name })) || [];
  const siteOptions = sites?.items.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [];
  const rackOptions = racks?.items.map((k: any) => ({ value: k.id.toString(), label: k.name })) || [];
  const locationOptions = locations?.items.map((l: any) => ({ value: l.id.toString(), label: l.name })) || [];
  const tenantOptions = tenants?.items.map((t: any) => ({ value: t.id.toString(), label: t.name })) || [];
  const platformOptions = platforms?.items.map((p: any) => ({ value: p.id.toString(), label: p.name })) || [];

  const parseSubmitData = (formData: Record<string, any>) => {
    return {
      ...formData,
      deviceTypeId: Number(formData.deviceTypeId),
      roleId: Number(formData.roleId),
      siteId: Number(formData.siteId),
      rackId: formData.rackId ? Number(formData.rackId) : null,
      locationId: formData.locationId ? Number(formData.locationId) : null,
      tenantId: formData.tenantId ? Number(formData.tenantId) : null,
      platformId: formData.platformId ? Number(formData.platformId) : null,
      position: formData.position ? Number(formData.position) : null,
      face: formData.face || null,
      serial: formData.serial || null,
      assetTag: formData.assetTag || null,
      airflow: formData.airflow || null,
      description: formData.description || null,
      comments: formData.comments || null,
    };
  };

  return (
    <CrudListPage
      title="Devices"
      description="Physical hardware installed in sites and racks"
      moduleColor="#8B5CF6"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "deviceTypeId", label: "Device Type", render: (v) => dtMap.get(Number(v)) || "—" },
        { key: "roleId", label: "Role", render: (v) => roleMap.get(Number(v)) || "—" },
        { key: "siteId", label: "Site", render: (v) => siteMap.get(Number(v)) || "—" },
        { key: "rackId", label: "Rack", render: (v) => rackMap.get(Number(v)) || "—" },
        { key: "locationId", label: "Location", render: (v) => locationMap.get(Number(v)) || "—" },
        { key: "tenantId", label: "Tenant", render: (v) => tenantMap.get(Number(v)) || "—" },
        { key: "platformId", label: "Platform", render: (v) => platformMap.get(Number(v)) || "—" },
        { key: "position", label: "Position", sortable: true },
        { key: "face", label: "Face" },
        { key: "airflow", label: "Airflow" },
        { key: "serial", label: "Serial", sortable: true },
        { key: "assetTag", label: "Asset Tag", sortable: true },
        { key: "description", label: "Description" },
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
      statusOptions={["offline", "active", "planned", "staged", "failed", "inventory", "decommissioning"]}
      detailPath={(id) => `/devices/${id}`}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "offline", label: "Offline" }, { value: "planned", label: "Planned" }, { value: "staged", label: "Staged" }, { value: "failed", label: "Failed" }, { value: "inventory", label: "Inventory" }, { value: "decommissioning", label: "Decommissioning" }] },
          { key: "deviceTypeId", label: "Device Type", type: "select", options: dtOptions, required: true },
          { key: "roleId", label: "Role", type: "select", options: roleOptions, required: true },
          { key: "siteId", label: "Site", type: "select", options: siteOptions, required: true },
          { key: "rackId", label: "Rack", type: "select", options: rackOptions },
          { key: "locationId", label: "Location", type: "select", options: locationOptions },
          { key: "tenantId", label: "Tenant", type: "select", options: tenantOptions },
          { key: "platformId", label: "Platform", type: "select", options: platformOptions },
          { key: "position", label: "U Position in Rack", type: "number" },
          { key: "face", label: "Rack Face", type: "select", options: [{ value: "front", label: "Front" }, { value: "rear", label: "Rear" }] },
          { key: "airflow", label: "Airflow Direction", type: "select", options: [
            { value: "front-to-rear", label: "Front to Rear" },
            { value: "rear-to-front", label: "Rear to Front" },
            { value: "left-to-right", label: "Left to Right" },
            { value: "right-to-left", label: "Right to Left" },
            { value: "passive", label: "Passive" },
            { value: "mixed", label: "Mixed" }
          ]},
          { key: "serial", label: "Serial Number", type: "text" },
          { key: "assetTag", label: "Asset Tag", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
        onSubmit: (cdata) => create.mutate(parseSubmitData(cdata)),
      }}
    />
  );
}
