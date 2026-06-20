import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function VrfListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.vrf.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.vrf.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.vrf.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="VRFs"
      description="Virtual Routing and Forwarding instances"
      moduleColor="#EC4899"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "rd", label: "Route Distinguisher", sortable: true },
        { key: "enforceUnique", label: "Enforce Unique", render: (v) => v ? "Yes" : "No" },
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
          { key: "rd", label: "Route Distinguisher", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
