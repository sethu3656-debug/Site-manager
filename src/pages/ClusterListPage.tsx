import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function ClusterListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.cluster.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.cluster.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.cluster.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Clusters"
      description="Virtual machine clusters"
      moduleColor="#06B6D4"
      columns={[
        { key: "name", label: "Name", sortable: true },
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
      statusOptions={["planned", "staging", "active", "decommissioning", "retired"]}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "planned", label: "Planned" }, { value: "staging", label: "Staging" }, { value: "active", label: "Active" }, { value: "decommissioning", label: "Decommissioning" }, { value: "retired", label: "Retired" }] },
          { key: "typeId", label: "Cluster Type ID", type: "number", required: true },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({ ...data, typeId: Number(data.typeId), siteId: data.siteId ? Number(data.siteId) : undefined }),
      }}
    />
  );
}
