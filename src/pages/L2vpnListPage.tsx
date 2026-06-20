import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function L2vpnListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.l2vpn.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.l2vpn.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.l2vpn.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="L2VPNs"
      description="Layer 2 VPN configurations"
      moduleColor="#8B5CF6"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
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
      statusOptions={["planned", "active", "closed"]}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "type", label: "Type", type: "select", options: [{ value: "vpws", label: "VPWS" }, { value: "vpls", label: "VPLS" }, { value: "evpl", label: "EVPL" }, { value: "epws", label: "EPWS" }, { value: "evpn-vpws", label: "EVPN-VPWS" }, { value: "evpn-vpls", label: "EVPN-VPLS" }] },
          { key: "status", label: "Status", type: "select", options: [{ value: "planned", label: "Planned" }, { value: "active", label: "Active" }, { value: "closed", label: "Closed" }] },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
