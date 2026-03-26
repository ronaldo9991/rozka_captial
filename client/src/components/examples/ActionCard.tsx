import ActionCard from '../ActionCard'
import { Plus } from 'lucide-react'

export default function ActionCardExample() {
  return (
    <div className="p-8 grid md:grid-cols-2 gap-6">
      <ActionCard
        title="Open Live Account"
        description="Start trading with real money"
        icon={Plus}
        buttonText="Open Account"
        onClick={() => console.log('Open account clicked')}
      />
    </div>
  )
}
