import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function TenantListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.tenant.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.tenant.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.tenant.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Tenants"
      description="Tenants and customer organizations"
      moduleColor="#EC4899"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "slug", label: "Slug", sortable: true },
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
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
