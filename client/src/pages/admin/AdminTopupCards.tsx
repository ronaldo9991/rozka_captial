import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/DataTable";
import { Search, Plus, CreditCard, Loader2, DollarSign, UserPlus, Eye, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/DashboardLoader";
import TopupCardDisplay from "@/components/TopupCardDisplay";
import type { User } from "@shared/schema";

interface TopupCard {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  balance: string;
  currency: string;
  assignedToUserId: string | null;
  createdByAdminId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  pin?: string; // PIN (stored as CVV)
  cvv?: string; // CVV (same as PIN)
}

export default function AdminTopupCards() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewCardDialogOpen, setViewCardDialogOpen] = useState(false);
  const [loadFundsDialogOpen, setLoadFundsDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [cardUsage, setCardUsage] = useState<any>(null);
  const [selectedCard, setSelectedCard] = useState<TopupCard | null>(null);
  const [viewCardDetails, setViewCardDetails] = useState<TopupCard | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [newlyCreatedCard, setNewlyCreatedCard] = useState<TopupCard | null>(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardHolderName: "Binofox Limited",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    initialBalance: "100",
    currency: "USD", // Fixed to USD only
  });
  const [loadAmount, setLoadAmount] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Fetch all topup cards
  const { data: cards = [], isLoading, refetch } = useQuery<TopupCard[]>({
    queryKey: ["/api/admin/topup-cards"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/topup-cards");
      return await response.json();
    },
  });

  // Fetch all users for assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json();
    },
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: typeof cardForm & { autoGenerate?: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/topup-cards", data);
      return await response.json();
    },
    onSuccess: (createdCard: TopupCard) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topup-cards"] });
      setNewlyCreatedCard(createdCard);
      setCreateDialogOpen(false);
      setViewCardDialogOpen(true);
      setCardForm({
        cardNumber: "",
        cardHolderName: "Binofox Limited",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        initialBalance: "100",
        currency: "USD",
      });
      toast({
        title: "Success",
        description: "Topup card created successfully! View the card details below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create topup card",
        variant: "destructive",
      });
    },
  });

  // Load funds mutation
  const loadFundsMutation = useMutation({
    mutationFn: async ({ cardId, amount }: { cardId: string; amount: string }) => {
      return await apiRequest("POST", `/api/admin/topup-cards/${cardId}/load-funds`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topup-cards"] });
      setLoadFundsDialogOpen(false);
      setLoadAmount("");
      setSelectedCard(null);
      toast({
        title: "Success",
        description: "Funds loaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load funds",
        variant: "destructive",
      });
    },
  });

  // Assign card mutation
  const assignCardMutation = useMutation({
    mutationFn: async ({ cardId, userId }: { cardId: string; userId: string }) => {
      return await apiRequest("POST", `/api/admin/topup-cards/${cardId}/assign`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topup-cards"] });
      setAssignDialogOpen(false);
      setSelectedUserId("");
      setSelectedCard(null);
      toast({
        title: "Success",
        description: "Card assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to assign card",
        variant: "destructive",
      });
    },
  });

  // Format card number for display
  const formatCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/-/g, "");
    return cleaned.match(/.{1,4}/g)?.join("-") || cardNumber;
  };

  // Mask card number
  const maskCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/-/g, "");
    if (cleaned.length < 8) return cardNumber;
    const first4 = cleaned.substring(0, 4);
    const last4 = cleaned.substring(cleaned.length - 4);
    return `${first4}-****-****-${last4}`;
  };

  // Get assigned user name
  const getAssignedUserName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName || user.username || user.email : "Unknown";
  };

  const filteredCards = cards.filter((card) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      card.cardNumber.toLowerCase().includes(search) ||
      card.cardHolderName.toLowerCase().includes(search) ||
      getAssignedUserName(card.assignedToUserId).toLowerCase().includes(search)
    );
  });

  const filteredUsers = users.filter((user) => {
    if (!userSearchTerm) return true;
    const search = userSearchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search) ||
      user.username.toLowerCase().includes(search)
    );
  });

  const handleCreateCard = () => {
    if (autoGenerate) {
      // Auto-generate card
      createCardMutation.mutate({
        ...cardForm,
        autoGenerate: true,
      });
    } else {
      // Manual entry
      if (!cardForm.cardNumber || !cardForm.cardHolderName || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
        toast({
          title: "Error",
          description: "All fields are required",
          variant: "destructive",
        });
        return;
      }

      // Format card number with dashes
      const formattedCardNumber = formatCardNumber(cardForm.cardNumber);
      createCardMutation.mutate({
        ...cardForm,
        cardNumber: formattedCardNumber,
        autoGenerate: false,
      });
    }
  };

  const handleViewCard = async (card: TopupCard) => {
    try {
      const response = await apiRequest("GET", `/api/admin/topup-cards/${card.id}`);
      const cardDetails = await response.json();
      setViewCardDetails(cardDetails);
      setViewCardDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load card details",
        variant: "destructive",
      });
    }
  };

  const handleLoadFunds = () => {
    if (!selectedCard || !loadAmount || parseFloat(loadAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    loadFundsMutation.mutate({ cardId: selectedCard.id, amount: loadAmount });
  };

  const handleAssignCard = () => {
    if (!selectedCard || !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }
    assignCardMutation.mutate({ cardId: selectedCard.id, userId: selectedUserId });
  };

  const handleViewUsage = async (card: TopupCard) => {
    try {
      setSelectedCard(card);
      const response = await apiRequest("GET", `/api/admin/topup-cards/${card.id}/usage`);
      const usageData = await response.json();
      setCardUsage(usageData);
      setUsageDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load card usage data",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "cardNumber",
      label: "Card Number",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="font-mono">{maskCardNumber(value)}</span>
        </div>
      ),
    },
    {
      key: "cardHolderName",
      label: "Card Holder",
      sortable: true,
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value: string, row: TopupCard) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="font-semibold">{parseFloat(value).toFixed(2)} {row.currency}</span>
        </div>
      ),
    },
    {
      key: "assignedToUserId",
      label: "Assigned To",
      sortable: true,
      render: (value: string | null) => (
        <Badge variant={value ? "default" : "secondary"}>
          {getAssignedUserName(value)}
        </Badge>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      sortable: false,
      render: (_: any, row: TopupCard) => {
        // This will be populated by the usage query
        return <Badge variant="outline">View Details</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_: any, row: TopupCard) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewCard(row)}
          >
            <Eye className="w-3 h-3 mr-1" />
            View Card
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCard(row);
              setLoadFundsDialogOpen(true);
            }}
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Load Funds
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCard(row);
              setAssignDialogOpen(true);
            }}
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Assign
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewUsage(row)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Usage
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Topup Cards</h1>
          <p className="text-muted-foreground">Manage credit cards for user deposits</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Card
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-card-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by card number, holder name, or assigned user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Cards Table */}
      <Card className="border-card-border">
        <DataTable
          columns={columns}
          data={filteredCards}
          exportFileName="topup-cards"
          onRefresh={() => {
            refetch().catch(() => {});
          }}
        />
      </Card>

      {/* Create Card Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Create Topup Card</DialogTitle>
            <DialogDescription>
              Create a new credit card for user deposits. Only Super Admins can create cards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Auto-generate toggle */}
            <div className="flex items-center space-x-2 p-4 border border-primary/30 rounded-lg bg-primary/5">
              <input
                type="checkbox"
                id="autoGenerate"
                checked={autoGenerate}
                onChange={(e) => {
                  setAutoGenerate(e.target.checked);
                  if (e.target.checked) {
                    // Clear manual fields when auto-generate is enabled
                    setCardForm({
                      ...cardForm,
                      cardNumber: "",
                      expiryMonth: "",
                      expiryYear: "",
                      cvv: "",
                    });
                  }
                }}
                className="w-4 h-4 text-primary"
              />
              <Label htmlFor="autoGenerate" className="flex items-center gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Auto-generate card number and PIN</span>
              </Label>
            </div>

            {!autoGenerate && (
              <>
                <div className="space-y-2">
                  <Label>Card Number *</Label>
                  <Input
                    placeholder="1234-5678-9012-3456"
                    value={cardForm.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 16) {
                        setCardForm({ ...cardForm, cardNumber: value });
                      }
                    }}
                    maxLength={16}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Month *</Label>
                    <Select
                      value={cardForm.expiryMonth}
                      onValueChange={(value) => setCardForm({ ...cardForm, expiryMonth: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = String(i + 1).padStart(2, "0");
                          return (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Expiry Year *</Label>
                    <Input
                      placeholder="YYYY"
                      value={cardForm.expiryYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 4) {
                          setCardForm({ ...cardForm, expiryYear: value });
                        }
                      }}
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>PIN (4 digits) *</Label>
                    <Input
                      type="password"
                      placeholder="1234"
                      value={cardForm.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 4) {
                          setCardForm({ ...cardForm, cvv: value });
                        }
                      }}
                      maxLength={4}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Card Holder Name</Label>
              <Input
                placeholder="Binofox Limited"
                value={cardForm.cardHolderName}
                onChange={(e) => setCardForm({ ...cardForm, cardHolderName: e.target.value })}
              />
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Balance</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cardForm.initialBalance}
                  onChange={(e) => setCardForm({ ...cardForm, initialBalance: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value="USD"
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Only USD currency is supported</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCard}
              disabled={createCardMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createCardMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Card"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Dialog */}
      <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Card Usage & Monitoring
            </DialogTitle>
            <DialogDescription>
              Track all deposits made using this topup card
            </DialogDescription>
          </DialogHeader>

          {cardUsage && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-black/40 border-primary/30 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Card Number</div>
                  <div className="text-lg font-mono font-semibold text-primary">
                    {cardUsage.cardNumber}
                  </div>
                </Card>
                <Card className="bg-black/40 border-primary/30 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Transactions</div>
                  <div className="text-lg font-semibold text-primary">
                    {cardUsage.usageCount}
                  </div>
                </Card>
                <Card className="bg-black/40 border-primary/30 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                  <div className="text-lg font-semibold text-green-500">
                    ${parseFloat(cardUsage.totalAmount || "0").toFixed(2)} USD
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                {cardUsage.transactions && cardUsage.transactions.length > 0 ? (
                  <div className="space-y-2">
                    {cardUsage.transactions.map((transaction: any, index: number) => (
                      <Card key={index} className="bg-black/40 border-primary/30 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">
                              ${parseFloat(transaction.amount || "0").toFixed(2)} {transaction.currency}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Deposit ID: {transaction.depositId}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              User ID: {transaction.userId}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(transaction.depositDate || transaction.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={transaction.status === "Completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found for this card</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUsageDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Funds Dialog */}
      <Dialog open={loadFundsDialogOpen} onOpenChange={setLoadFundsDialogOpen}>
        <DialogContent className="bg-black border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Load Funds to Card</DialogTitle>
            <DialogDescription>
              Add funds to {selectedCard ? maskCardNumber(selectedCard.cardNumber) : "card"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedCard && (
              <div className="p-4 border border-primary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-primary">
                  ${parseFloat(selectedCard.balance).toFixed(2)} {selectedCard.currency}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount to Load *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={loadAmount}
                onChange={(e) => setLoadAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadFundsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLoadFunds}
              disabled={loadFundsMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {loadFundsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Funds"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Card Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Assign Card to User</DialogTitle>
            <DialogDescription>
              Assign {selectedCard ? maskCardNumber(selectedCard.cardNumber) : "card"} to a user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search User</Label>
              <Input
                placeholder="Search by name, email, or username..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-primary/10 ${
                    selectedUserId === user.id ? "border-primary bg-primary/5" : "border-primary/30"
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <p className="font-semibold">{user.fullName || user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignCard}
              disabled={assignCardMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {assignCardMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Card"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Card Dialog */}
      <Dialog open={viewCardDialogOpen} onOpenChange={setViewCardDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Topup Card Details</DialogTitle>
            <DialogDescription>
              {newlyCreatedCard ? "Card created successfully! Save these details securely." : "View card information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {(viewCardDetails || newlyCreatedCard) && (
              <TopupCardDisplay
                cardNumber={(viewCardDetails || newlyCreatedCard)!.cardNumber}
                pin={(viewCardDetails || newlyCreatedCard)!.pin || (viewCardDetails || newlyCreatedCard)!.cvv || "****"}
                amount={(viewCardDetails || newlyCreatedCard)!.balance}
                status={(viewCardDetails || newlyCreatedCard)!.enabled ? "Valid" : "Expired"}
                cardHolderName={(viewCardDetails || newlyCreatedCard)!.cardHolderName}
                expiryMonth={(viewCardDetails || newlyCreatedCard)!.expiryMonth}
                expiryYear={(viewCardDetails || newlyCreatedCard)!.expiryYear}
                showFullDetails={true}
                className="mx-auto"
              />
            )}

            {newlyCreatedCard && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400 font-semibold mb-2">⚠️ Important:</p>
                <p className="text-sm text-muted-foreground">
                  Please save the card number and PIN securely. The PIN will not be shown again after closing this dialog.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setViewCardDialogOpen(false);
              setViewCardDetails(null);
              setNewlyCreatedCard(null);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

