import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function DeviceTypeListPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = trpc.deviceType.list.useQuery({ page, pageSize: 25, search });
  const { data: manufacturers } = trpc.manufacturer.list.useQuery({ page: 1, pageSize: 1000 });

  const create = trpc.deviceType.create.useMutation({ onSuccess: () => { utils.deviceType.list.invalidate(); refetch(); } });
  const update = trpc.deviceType.update.useMutation({ onSuccess: () => { utils.deviceType.list.invalidate(); refetch(); } });
  const del = trpc.deviceType.delete.useMutation({ onSuccess: () => { utils.deviceType.list.invalidate(); refetch(); } });

  const mfgOptions = manufacturers?.items.map((m: any) => ({ value: m.id.toString(), label: m.name })) || [];

  return (
    <CrudListPage
      title="Device Types"
      description="Models of physical network switches, routers, or servers"
      moduleColor="#10B981"
      columns={[
        { key: "model", label: "Model", sortable: true },
        { key: "partNumber", label: "Part Number", sortable: true },
        { key: "uHeight", label: "U Height", render: (v) => `${v}U` },
        { key: "airflow", label: "Airflow" },
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
      onUpdate={(id, data) => update.mutate({ id, data: { ...data, uHeight: Number(data.uHeight), manufacturerId: Number(data.manufacturerId) } })}
      createForm={{
        fields: [
          { key: "model", label: "Model Name", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "manufacturerId", label: "Manufacturer", type: "select", options: mfgOptions, required: true },
          { key: "partNumber", label: "Part Number", type: "text" },
          { key: "uHeight", label: "U Height (slots)", type: "number", required: true },
          { key: "airflow", label: "Airflow", type: "select", options: [
            { value: "front-to-rear", label: "Front to Rear" },
            { value: "rear-to-front", label: "Rear to Front" },
            { value: "left-to-right", label: "Left to Right" },
            { value: "right-to-left", label: "Right to Left" },
            { value: "passive", label: "Passive" },
            { value: "mixed", label: "Mixed" }
          ]},
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({
          ...data,
          uHeight: Number(data.uHeight),
          manufacturerId: Number(data.manufacturerId)
        }),
      }}
    />
  );
}
