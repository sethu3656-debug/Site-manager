import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function CircuitListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.circuit.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.circuit.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.circuit.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Circuits"
      description="WAN circuits and connectivity"
      moduleColor="#F59E0B"
      columns={[
        { key: "cid", label: "Circuit ID", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "providerId", label: "Provider", render: (v) => v ? `Provider-${v}` : "—" },
        { key: "commitRate", label: "Commit Rate", render: (v) => v ? `${v} kbps` : "—" },
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
      statusOptions={["planned", "provisioning", "active", "offline", "deprovisioning", "decommissioning"]}
      createForm={{
        fields: [
          { key: "cid", label: "Circuit ID", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "planned", label: "Planned" }, { value: "provisioning", label: "Provisioning" }, { value: "active", label: "Active" }, { value: "offline", label: "Offline" }, { value: "deprovisioning", label: "Deprovisioning" }, { value: "decommissioning", label: "Decommissioning" }] },
          { key: "providerId", label: "Provider ID", type: "number", required: true },
          { key: "typeId", label: "Circuit Type ID", type: "number", required: true },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({ ...data, providerId: Number(data.providerId), typeId: Number(data.typeId), commitRate: data.commitRate ? Number(data.commitRate) : undefined }),
      }}
    />
  );
}
