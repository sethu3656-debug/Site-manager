import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function ConfigContextListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.configContext.list.useQuery({ page, pageSize: 25 });
  const create = trpc.configContext.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.configContext.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Config Contexts"
      description="Configuration data applied to devices"
      moduleColor="#F59E0B"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "weight", label: "Weight", sortable: true },
        { key: "isActive", label: "Active", render: (v) => v ? "Yes" : "No" },
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
          { key: "name", label: "Name", type: "text", required: true },
          { key: "weight", label: "Weight", type: "number" },
          { key: "data", label: "Config Data (JSON)", type: "textarea" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => {
          let parsedData = {};
          try { parsedData = JSON.parse(data.data || "{}"); } catch {}
          create.mutate({ ...data, data: parsedData, weight: Number(data.weight) || 1000 });
        },
      }}
    />
  );
}
