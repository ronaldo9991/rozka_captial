import StatCard from '../StatCard'
import { Wallet } from 'lucide-react'

export default function StatCardExample() {
  return (
    <div className="p-8 grid md:grid-cols-2 gap-6">
      <StatCard title="Balance" value="$10,250.00" icon={Wallet} index={0} />
      <StatCard title="Equity" value="$10,450.00" icon={Wallet} index={1} />
    </div>
  )
}
