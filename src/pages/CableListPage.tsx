import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function CableListPage() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = trpc.cable.list.useQuery({ page, pageSize: 25, search });
  const { data: interfaces } = trpc.interface.list.useQuery({ page: 1, pageSize: 1000 });

  const create = trpc.cable.create.useMutation({ onSuccess: () => { utils.cable.list.invalidate(); refetch(); } });
  const update = trpc.cable.update.useMutation({ onSuccess: () => { utils.cable.list.invalidate(); refetch(); } });
  const del = trpc.cable.delete.useMutation({ onSuccess: () => { utils.cable.list.invalidate(); refetch(); } });

  const ifaceOptions = interfaces?.items.map((i: any) => ({
    value: i.id.toString(),
    label: `Interface ${i.name} (Device ID: ${i.deviceId})`
  })) || [];

  return (
    <CrudListPage
      title="Cables"
      description="Physical connections between interfaces"
      moduleColor="#8B5CF6"
      columns={[
        { key: "id", label: "Cable ID", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "length", label: "Length", render: (v, row) => `${v || "—"} ${row.lengthUnit || ""}` },
        { key: "aSideObjectId", label: "A Side Interface", render: (v) => `Interface ID: ${v}` },
        { key: "bSideObjectId", label: "B Side Interface", render: (v) => `Interface ID: ${v}` },
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
      onUpdate={(id, data) => update.mutate({
        id,
        data: {
          ...data,
          length: data.length ? Number(data.length) : null,
          aSideObjectId: Number(data.aSideObjectId),
          bSideObjectId: Number(data.bSideObjectId)
        }
      })}
      createForm={{
        fields: [
          { key: "type", label: "Cable Type (e.g. cat6, fiber)", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [
            { value: "connected", label: "Connected" },
            { value: "planned", label: "Planned" },
            { value: "decommissioned", label: "Decommissioned" }
          ], required: true },
          { key: "length", label: "Length", type: "text" },
          { key: "lengthUnit", label: "Length Unit", type: "select", options: [
            { value: "m", label: "Meters (m)" },
            { value: "ft", label: "Feet (ft)" },
            { value: "in", label: "Inches (in)" },
            { value: "cm", label: "Centimeters (cm)" }
          ] },
          { key: "color", label: "Cable Color (Hex Code)", type: "text" },
          { key: "aSideObjectId", label: "A Side Connection", type: "select", options: ifaceOptions, required: true },
          { key: "bSideObjectId", label: "B Side Connection", type: "select", options: ifaceOptions, required: true },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate({
          ...data,
          length: data.length ? Number(data.length) : null,
          aSideObjectType: "interfaces",
          aSideObjectId: Number(data.aSideObjectId),
          bSideObjectType: "interfaces",
          bSideObjectId: Number(data.bSideObjectId),
          color: data.color || "#3B82F6"
        }),
      }}
    />
  );
}
