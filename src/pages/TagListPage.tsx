import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function TagListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.tag.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.tag.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.tag.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Tags"
      description="Tags for organizing and categorizing objects"
      moduleColor="#10B981"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "slug", label: "Slug", sortable: true },
        { key: "color", label: "Color", render: (v) => (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: v }} />
            <span className="text-sm text-text-secondary">{v}</span>
          </div>
        )},
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
          { key: "color", label: "Color", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data as any),
      }}
    />
  );
}
