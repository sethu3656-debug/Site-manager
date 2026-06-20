import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function ContactListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.contact.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.contact.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.contact.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Contacts"
      description="People associated with tenants and objects"
      moduleColor="#EC4899"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "title", label: "Title" },
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
          { key: "email", label: "Email", type: "email" },
          { key: "phone", label: "Phone", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
