import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";

export function CustomFieldListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.customField.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.customField.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.customField.update.useMutation({ onSuccess: () => refetch() });
  const del = trpc.customField.delete.useMutation({ onSuccess: () => refetch() });

  const sectionOptions = [
    { value: "sites", label: "Sites" },
    { value: "racks", label: "Racks" },
    { value: "tenants", label: "Tenants" },
    { value: "devices", label: "Devices" },
    { value: "prefixes", label: "Prefixes" },
    { value: "ip_addresses", label: "IP Addresses" },
    { value: "vlans", label: "VLANs" },
    { value: "vrfs", label: "VRFs" },
    { value: "circuits", label: "Circuits" },
    { value: "providers", label: "Providers" },
    { value: "virtual_machines", label: "Virtual Machines" },
    { value: "clusters", label: "Clusters" },
    { value: "cables", label: "Cables" }
  ];

  return (
    <CrudListPage
      title="Custom Fields"
      description="Add custom fields to any object type"
      moduleColor="#F59E0B"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "label", label: "Label", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "objectTypes", label: "Applies To", render: (v) => {
          try { const t = typeof v === 'string' ? JSON.parse(v) : v; return Array.isArray(t) ? t.join(", ") : "—"; } catch { return "—"; }
        }},
        { key: "required", label: "Required", render: (v) => v ? "Yes" : "No" },
      ]}
      data={data?.items || []}
      total={data?.total || 0}
      page={page}
      pageSize={25}
      onPageChange={setPage}
      onSearch={setSearch}
      onRefresh={refetch}
      onDelete={(id) => del.mutate({ id })}
      onUpdate={(id, data) => update.mutate({ id, data: { ...data, required: data.required === "true" || data.required === true } })}
      createForm={{
        fields: [
          { key: "name", label: "Name (internal)", type: "text", required: true },
          { key: "label", label: "Display Label", type: "text", required: true },
          { key: "type", label: "Type", type: "select", options: [
            { value: "text", label: "Text" },
            { value: "longtext", label: "Long Text" },
            { value: "integer", label: "Integer" },
            { value: "boolean", label: "Boolean" },
            { value: "date", label: "Date" },
            { value: "url", label: "URL" },
            { value: "json", label: "JSON" },
            { value: "select", label: "Selection" },
            { value: "multiselect", label: "Multi-Select" },
            { value: "object", label: "Object" }
          ] },
          { key: "objectTypes", label: "Applies To Sections", type: "multiselect", options: sectionOptions, required: true },
          { key: "required", label: "Required", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => {
          create.mutate({ ...data, required: data.required === "true" });
        },
      }}
    />
  );
}
