import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function PrefixListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Queries for list & relations
  const { data: vrfs } = trpc.vrf.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: tenants } = trpc.tenant.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: vlans } = trpc.vlan.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: roles } = trpc.role.list.useQuery({ page: 1, pageSize: 1000 });

  const { data, refetch } = trpc.prefix.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.prefix.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.prefix.update.useMutation({ onSuccess: () => refetch() });
  const del = trpc.prefix.delete.useMutation({ onSuccess: () => refetch() });

  // Map relations for display in columns with explicit number->string types
  const vrfMap = useMemo(() => new Map<number, string>(vrfs?.items?.map((v: any) => [v.id, v.name]) || []), [vrfs]);
  const tenantMap = useMemo(() => new Map<number, string>(tenants?.items?.map((t: any) => [t.id, t.name]) || []), [tenants]);
  const vlanMap = useMemo(() => new Map<number, string>(vlans?.items?.map((vl: any) => [vl.id, `${vl.name} (VID: ${vl.vid})`]) || []), [vlans]);
  const roleMap = useMemo(() => new Map<number, string>(roles?.items?.map((r: any) => [r.id, r.name]) || []), [roles]);

  // Options for forms
  const vrfOptions = vrfs?.items.map((v: any) => ({ value: v.id.toString(), label: v.name })) || [];
  const tenantOptions = tenants?.items.map((t: any) => ({ value: t.id.toString(), label: t.name })) || [];
  const vlanOptions = vlans?.items.map((vl: any) => ({ value: vl.id.toString(), label: `${vl.name} (VID: ${vl.vid})` })) || [];
  const roleOptions = roles?.items.map((r: any) => ({ value: r.id.toString(), label: r.name })) || [];

  const parseSubmitData = (formData: Record<string, any>) => {
    return {
      ...formData,
      vrfId: formData.vrfId ? Number(formData.vrfId) : null,
      tenantId: formData.tenantId ? Number(formData.tenantId) : null,
      vlanId: formData.vlanId ? Number(formData.vlanId) : null,
      roleId: formData.roleId ? Number(formData.roleId) : null,
      isPool: formData.isPool === "true" || formData.isPool === true,
      markUtilized: formData.markUtilized === "true" || formData.markUtilized === true,
      description: formData.description || null,
    };
  };

  return (
    <CrudListPage
      title="Prefixes"
      description="IP network prefixes and their allocation status"
      moduleColor="#3B82F6"
      columns={[
        { key: "prefix", label: "Prefix", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "vrfId", label: "VRF", render: (v) => vrfMap.get(Number(v)) || "Global" },
        { key: "tenantId", label: "Tenant", render: (v) => tenantMap.get(Number(v)) || "—" },
        { key: "vlanId", label: "VLAN", render: (v) => vlanMap.get(Number(v)) || "—" },
        { key: "roleId", label: "Role", render: (v) => roleMap.get(Number(v)) || "—" },
        { key: "isPool", label: "Is Pool", render: (v) => (v ? "Yes" : "No") },
        { key: "markUtilized", label: "Mark Utilized", render: (v) => (v ? "Yes" : "No") },
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
      statusOptions={["container", "active", "reserved", "deprecated"]}
      createForm={{
        fields: [
          { key: "prefix", label: "Prefix (CIDR)", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "container", label: "Container" }, { value: "active", label: "Active" }, { value: "reserved", label: "Reserved" }, { value: "deprecated", label: "Deprecated" }] },
          { key: "vrfId", label: "VRF", type: "select", options: vrfOptions },
          { key: "tenantId", label: "Tenant", type: "select", options: tenantOptions },
          { key: "vlanId", label: "VLAN", type: "select", options: vlanOptions },
          { key: "roleId", label: "Role", type: "select", options: roleOptions },
          { key: "isPool", label: "Is IP Pool", type: "select", options: [
            { value: "false", label: "No" },
            { value: "true", label: "Yes" }
          ]},
          { key: "markUtilized", label: "Mark Utilized", type: "select", options: [
            { value: "false", label: "No" },
            { value: "true", label: "Yes" }
          ]},
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (cdata) => create.mutate(parseSubmitData(cdata)),
      }}
    />
  );
}
