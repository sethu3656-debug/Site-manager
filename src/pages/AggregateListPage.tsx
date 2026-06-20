import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function AggregateListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.aggregate.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.aggregate.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.aggregate.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Aggregates"
      description="IP address space aggregates and allocations"
      moduleColor="#3B82F6"
      columns={[
        { key: "prefix", label: "Prefix", sortable: true },
        { key: "rirId", label: "RIR", render: (v) => v ? `RIR-${v}` : "—" },
        { key: "tenantId", label: "Tenant", render: (v) => v ? `Tenant-${v}` : "—" },
        { key: "dateAdded", label: "Date Added" },
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
      createForm={{
        fields: [
          { key: "prefix", label: "Prefix", type: "text", required: true },
          { key: "rirId", label: "RIR ID", type: "number", required: true },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({ ...data, rirId: Number(data.rirId) }),
      }}
    />
  );
}
