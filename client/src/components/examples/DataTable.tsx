import DataTable from '../DataTable'
import { Badge } from '@/components/ui/badge'

export default function DataTableExample() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'accountId', label: 'Account ID' },
    { key: 'type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
  ];

  const data = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    accountId: `MT5-${1000 + i}`,
    type: i % 2 === 0 ? 'Live' : 'Demo',
    status: i % 3 === 0 ? 'active' : 'inactive',
  }));

  return (
    <div className="p-8">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
