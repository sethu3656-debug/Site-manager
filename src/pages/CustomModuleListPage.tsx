import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { Box, ArrowRight } from "lucide-react";

export function CustomModuleListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.customModule.list.useQuery({ page, pageSize: 25 });
  const create = trpc.customModule.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.customModule.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Custom Modules"
      description="Create entirely new entity types"
      moduleColor="#8B5CF6"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "pluralName", label: "Plural Name", sortable: true },
        { key: "slug", label: "Slug", sortable: true },
        { key: "icon", label: "Icon" },
        { key: "color", label: "Color", render: (v) => (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: v }} />
            <span className="text-sm text-text-secondary">{v}</span>
          </div>
        )},
        { key: "actions", label: "Entities", render: (_v, row) => (
          <Link to={`/custom-modules/${row.slug}/entities`} className="inline-flex items-center gap-1 text-accent hover:text-accent-light text-sm font-medium">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )},
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
          { key: "name", label: "Singular Name", type: "text", required: true },
          { key: "pluralName", label: "Plural Name", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "icon", label: "Icon", type: "text" },
          { key: "color", label: "Color (hex)", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
