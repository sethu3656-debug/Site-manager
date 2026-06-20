import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function ProviderListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.provider.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.provider.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.provider.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Providers"
      description="Circuit providers and carriers"
      moduleColor="#10B981"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "slug", label: "Slug", sortable: true },
        { key: "portalUrl", label: "Portal URL", render: (v) => v ? <a href={v} target="_blank" rel="noopener" className="text-accent hover:underline">{v}</a> : "—" },
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
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "portalUrl", label: "Portal URL", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
