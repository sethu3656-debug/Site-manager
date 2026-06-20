import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function VlanListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.vlan.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.vlan.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.vlan.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="VLANs"
      description="Virtual LAN configurations and assignments"
      moduleColor="#F59E0B"
      columns={[
        { key: "vid", label: "VID", sortable: true },
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
      statusOptions={["active", "reserved", "deprecated"]}
      createForm={{
        fields: [
          { key: "vid", label: "VID", type: "number", required: true },
          { key: "name", label: "Name", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "reserved", label: "Reserved" }, { value: "deprecated", label: "Deprecated" }] },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({ ...data, vid: Number(data.vid) }),
      }}
    />
  );
}
