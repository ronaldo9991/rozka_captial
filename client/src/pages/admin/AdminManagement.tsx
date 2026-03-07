import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, CreditCard, Globe } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminManagement() {
  const [, setLocation] = useLocation();

  const managementOptions = [
    {
      title: "Manage Admins",
      description: "Create, edit, and manage admin users and their permissions",
      icon: Users,
      url: "/admin/admins",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Bank Payment Gateways",
      description: "Configure payment methods and bank integrations",
      icon: CreditCard,
      url: "/admin/payment-gateways",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Global Settings",
      description: "System-wide configuration and preferences",
      icon: Globe,
      url: "/admin/global-settings",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">Management</h1>
          <p className="text-muted-foreground">System administration and configuration</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {managementOptions.map((option, index) => (
          <Card
            key={index}
            className="p-6 border-card-border hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => setLocation(option.url)}
          >
            <div className="space-y-4">
              <div className={`w-16 h-16 ${option.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <option.icon className={`w-8 h-8 ${option.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
              <Button variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors">
                Configure
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

