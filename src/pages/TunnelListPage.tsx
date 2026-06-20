import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function TunnelListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.tunnel.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.tunnel.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.tunnel.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Tunnels"
      description="VPN and GRE tunnels"
      moduleColor="#06B6D4"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "encapsulation", label: "Encapsulation", sortable: true },
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
      statusOptions={["planned", "provisioning", "active", "closed"]}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "planned", label: "Planned" }, { value: "provisioning", label: "Provisioning" }, { value: "active", label: "Active" }, { value: "closed", label: "Closed" }] },
          { key: "encapsulation", label: "Encapsulation", type: "select", options: [{ value: "ipsec", label: "IPSec" }, { value: "gre", label: "GRE" }, { value: "ip-ip", label: "IP-in-IP" }] },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
