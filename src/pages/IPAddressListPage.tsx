import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function IPAddressListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Queries for list & relations
  const { data: vrfs } = trpc.vrf.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: tenants } = trpc.tenant.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: roles } = trpc.role.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: interfaces } = trpc.interface.list.useQuery({ page: 1, pageSize: 1000 });

  const { data, refetch } = trpc.ipAddress.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.ipAddress.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.ipAddress.update.useMutation({ onSuccess: () => refetch() });
  const del = trpc.ipAddress.delete.useMutation({ onSuccess: () => refetch() });

  // Map relations for display in columns with explicit number->string types
  const vrfMap = useMemo(() => new Map<number, string>(vrfs?.items?.map((v: any) => [v.id, v.name]) || []), [vrfs]);
  const tenantMap = useMemo(() => new Map<number, string>(tenants?.items?.map((t: any) => [t.id, t.name]) || []), [tenants]);
  const roleMap = useMemo(() => new Map<number, string>(roles?.items?.map((r: any) => [r.id, r.name]) || []), [roles]);
  const interfaceMap = useMemo(() => new Map<number, string>(interfaces?.items?.map((i: any) => [i.id, `${i.name} (Dev: ${i.deviceId})`]) || []), [interfaces]);

  // Options for forms
  const vrfOptions = vrfs?.items.map((v: any) => ({ value: v.id.toString(), label: v.name })) || [];
  const tenantOptions = tenants?.items.map((t: any) => ({ value: t.id.toString(), label: t.name })) || [];
  const roleOptions = roles?.items.map((r: any) => ({ value: r.id.toString(), label: r.name })) || [];
  const ifaceOptions = interfaces?.items.map((i: any) => ({ value: i.id.toString(), label: `${i.name} (Device ID: ${i.deviceId})` })) || [];

  const parseSubmitData = (formData: Record<string, any>) => {
    return {
      ...formData,
      vrfId: formData.vrfId ? Number(formData.vrfId) : null,
      tenantId: formData.tenantId ? Number(formData.tenantId) : null,
      roleId: formData.roleId ? Number(formData.roleId) : null,
      assignedObjectId: formData.assignedObjectId ? Number(formData.assignedObjectId) : null,
      assignedObjectType: formData.assignedObjectId ? "interfaces" : null,
      dnsName: formData.dnsName || null,
      description: formData.description || null,
      comments: formData.comments || null,
    };
  };

  return (
    <CrudListPage
      title="IP Addresses"
      description="Individual IP addresses and their assignments"
      moduleColor="#06B6D4"
      columns={[
        { key: "address", label: "Address", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "vrfId", label: "VRF", render: (v) => vrfMap.get(Number(v)) || "Global" },
        { key: "tenantId", label: "Tenant", render: (v) => tenantMap.get(Number(v)) || "—" },
        { key: "roleId", label: "Role", render: (v) => roleMap.get(Number(v)) || "—" },
        { key: "assignedObjectId", label: "Interface", render: (v) => interfaceMap.get(Number(v)) || "—" },
        { key: "dnsName", label: "DNS Name" },
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
      statusOptions={["active", "reserved", "deprecated", "dhcp", "slaac"]}
      createForm={{
        fields: [
          { key: "address", label: "Address (with prefix)", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "reserved", label: "Reserved" }, { value: "deprecated", label: "Deprecated" }, { value: "dhcp", label: "DHCP" }, { value: "slaac", label: "SLAAC" }] },
          { key: "vrfId", label: "VRF", type: "select", options: vrfOptions },
          { key: "tenantId", label: "Tenant", type: "select", options: tenantOptions },
          { key: "roleId", label: "Role", type: "select", options: roleOptions },
          { key: "assignedObjectId", label: "Assigned Interface", type: "select", options: ifaceOptions },
          { key: "dnsName", label: "DNS Name", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
        onSubmit: (cdata) => create.mutate(parseSubmitData(cdata)),
      }}
    />
  );
}
