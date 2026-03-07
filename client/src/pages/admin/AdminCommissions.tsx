import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Award, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminCommissions() {
  const [, setLocation] = useLocation();

  const commissionModules = [
    {
      title: "Bonus Module",
      description: "Manage deposit bonuses, welcome bonuses, and promotional offers",
      icon: Gift,
      url: "/admin/commissions/bonus",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      features: ["Deposit Bonus", "Welcome Bonus", "Seasonal Promotions"],
    },
    {
      title: "Reward Module",
      description: "Configure client rewards and loyalty programs",
      icon: Award,
      url: "/admin/commissions/rewards",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      features: ["Trading Rewards", "Loyalty Points", "Achievement Badges"],
    },
    {
      title: "IB Reward Module",
      description: "Manage Introducing Broker commission structures and payouts",
      icon: Users,
      url: "/admin/commissions/ib-rewards",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      features: ["Commission Tiers", "IB Payouts", "Referral Tracking"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Commissions</h1>
          <p className="text-muted-foreground">Manage bonuses, rewards, and IB commissions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {commissionModules.map((module, index) => (
          <Card
            key={index}
            className="p-6 border-card-border hover:shadow-xl transition-all group"
          >
            <div className="space-y-4">
              <div className={`w-16 h-16 ${module.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <module.icon className={`w-8 h-8 ${module.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {module.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="group-hover:bg-primary group-hover:text-white transition-colors"
                onClick={() => setLocation(module.url)}
              >
                Manage Module
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Commission Activity */}
      <Card className="p-6 border-card-border">
        <h2 className="text-xl font-semibold mb-4">Recent Commission Activity</h2>
        <div className="text-center text-muted-foreground py-8">
          No recent activity to display
        </div>
      </Card>
    </div>
  );
}

