import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function SiteListPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Queries for list & relations
  const { data, isLoading, refetch } = trpc.site.list.useQuery({ page, pageSize: 25, search });
  const { data: regions } = trpc.region.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: siteGroups } = trpc.siteGroup.list.useQuery({ page: 1, pageSize: 1000 });
  const { data: tenants } = trpc.tenant.list.useQuery({ page: 1, pageSize: 1000 });

  const create = trpc.site.create.useMutation({ onSuccess: () => { utils.site.list.invalidate(); refetch(); } });
  const del = trpc.site.delete.useMutation({ onSuccess: () => { utils.site.list.invalidate(); refetch(); } });

  // Map relations for display in columns with explicit number->string types
  const regionMap = useMemo(() => new Map<number, string>(regions?.items?.map((r: any) => [r.id, r.name]) || []), [regions]);
  const groupMap = useMemo(() => new Map<number, string>(siteGroups?.items?.map((g: any) => [g.id, g.name]) || []), [siteGroups]);
  const tenantMap = useMemo(() => new Map<number, string>(tenants?.items?.map((t: any) => [t.id, t.name]) || []), [tenants]);

  // Options for forms
  const regionOptions = regions?.items.map((r: any) => ({ value: r.id.toString(), label: r.name })) || [];
  const groupOptions = siteGroups?.items.map((g: any) => ({ value: g.id.toString(), label: g.name })) || [];
  const tenantOptions = tenants?.items.map((t: any) => ({ value: t.id.toString(), label: t.name })) || [];

  const parseSubmitData = (formData: Record<string, any>) => {
    return {
      ...formData,
      regionId: formData.regionId ? Number(formData.regionId) : null,
      siteGroupId: formData.siteGroupId ? Number(formData.siteGroupId) : null,
      tenantId: formData.tenantId ? Number(formData.tenantId) : null,
      latitude: formData.latitude ? String(formData.latitude) : null,
      longitude: formData.longitude ? String(formData.longitude) : null,
      timeZone: formData.timeZone || null,
      physicalAddress: formData.physicalAddress || null,
      shippingAddress: formData.shippingAddress || null,
      comments: formData.comments || null,
      description: formData.description || null,
    };
  };

  return (
    <CrudListPage
      title="Sites"
      description="Physical locations where infrastructure is deployed"
      moduleColor="#3B82F6"
      columns={[
        { key: "name", label: "Name", sortable: true, defaultVisible: true },
        { key: "slug", label: "Slug", sortable: true, defaultVisible: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true, defaultVisible: true },
        { key: "regionId", label: "Region", render: (v) => regionMap.get(Number(v)) || "—", defaultVisible: true },
        { key: "tenantId", label: "Tenant", render: (v) => tenantMap.get(Number(v)) || "—", defaultVisible: true },
        { key: "description", label: "Description", defaultVisible: true },
        { key: "siteGroupId", label: "Site Group", render: (v) => groupMap.get(Number(v)) || "—", defaultVisible: false },
        { key: "timeZone", label: "Time Zone", defaultVisible: false },
        { key: "physicalAddress", label: "Physical Address", defaultVisible: false },
        { key: "shippingAddress", label: "Shipping Address", defaultVisible: false },
        { key: "latitude", label: "Latitude", defaultVisible: false },
        { key: "longitude", label: "Longitude", defaultVisible: false },
      ]}
      data={data?.items || []}
      total={data?.total || 0}
      page={page}
      pageSize={25}
      onPageChange={setPage}
      onSearch={setSearch}
      onRefresh={refetch}
      onDelete={(id) => del.mutate({ id })}
      detailPath={(id) => `/sites/${id}`}
      statusOptions={["planned", "staging", "active", "decommissioning", "retired"]}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "planned", label: "Planned" }, { value: "staging", label: "Staging" }, { value: "active", label: "Active" }, { value: "decommissioning", label: "Decommissioning" }, { value: "retired", label: "Retired" }] },
          { key: "regionId", label: "Region", type: "select", options: regionOptions },
          { key: "siteGroupId", label: "Site Group", type: "select", options: groupOptions },
          { key: "tenantId", label: "Tenant", type: "select", options: tenantOptions },
          { key: "timeZone", label: "Time Zone (e.g. UTC, Asia/Kolkata)", type: "text" },
          { key: "physicalAddress", label: "Physical Address", type: "textarea" },
          { key: "shippingAddress", label: "Shipping Address", type: "textarea" },
          { key: "latitude", label: "Latitude (Decimal)", type: "text" },
          { key: "longitude", label: "Longitude (Decimal)", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "comments", label: "Comments", type: "textarea" },
        ],
        onSubmit: (cdata) => create.mutate(parseSubmitData(cdata)),
      }}
    />
  );
}
