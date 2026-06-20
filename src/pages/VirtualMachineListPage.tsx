import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function VirtualMachineListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.virtualMachine.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.virtualMachine.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.virtualMachine.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Virtual Machines"
      description="Virtual machines and their resources"
      moduleColor="#8B5CF6"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "vcpus", label: "vCPUs" },
        { key: "memory", label: "Memory (MB)" },
        { key: "disk", label: "Disk (GB)" },
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
      statusOptions={["offline", "active", "planned", "staged", "failed", "decommissioning"]}
      createForm={{
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "offline", label: "Offline" }, { value: "planned", label: "Planned" }, { value: "staged", label: "Staged" }, { value: "failed", label: "Failed" }, { value: "decommissioning", label: "Decommissioning" }] },
          { key: "clusterId", label: "Cluster ID", type: "number" },
          { key: "vcpus", label: "vCPUs", type: "text" },
          { key: "memory", label: "Memory (MB)", type: "number" },
          { key: "disk", label: "Disk (GB)", type: "number" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({ ...data, clusterId: data.clusterId ? Number(data.clusterId) : undefined, memory: data.memory ? Number(data.memory) : undefined, disk: data.disk ? Number(data.disk) : undefined }),
      }}
    />
  );
}
