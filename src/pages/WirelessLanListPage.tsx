import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { CrudListPage } from "@/components/CrudListPage";
import { StatusBadge } from "@/components/StatusBadge";

export function WirelessLanListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.wirelessLan.list.useQuery({ page, pageSize: 25, search });
  const create = trpc.wirelessLan.create.useMutation({ onSuccess: () => refetch() });
  const del = trpc.wirelessLan.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <CrudListPage
      title="Wireless LANs"
      description="Wi-Fi networks and SSIDs"
      moduleColor="#8B5CF6"
      columns={[
        { key: "ssid", label: "SSID", sortable: true },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} />, sortable: true },
        { key: "authType", label: "Auth Type", sortable: true },
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
      statusOptions={["active", "reserved", "disabled"]}
      createForm={{
        fields: [
          { key: "ssid", label: "SSID", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "reserved", label: "Reserved" }, { value: "disabled", label: "Disabled" }] },
          { key: "authType", label: "Auth Type", type: "select", options: [{ value: "open", label: "Open" }, { value: "wep", label: "WEP" }, { value: "wpa-personal", label: "WPA Personal" }, { value: "wpa-enterprise", label: "WPA Enterprise" }] },
          { key: "description", label: "Description", type: "textarea" },
        ],
        onSubmit: (data) => create.mutate(data),
      }}
    />
  );
}
