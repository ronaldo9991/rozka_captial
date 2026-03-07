import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket, User } from "@shared/schema";

export default function AdminSupport() {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const { data: tickets = [], isLoading, refetch: refetchTickets, isFetching: isRefreshingTickets } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/support-tickets"],
    refetchInterval: false, // Disabled auto-refresh - user can manually refresh if needed
    retry: false, // Don't retry on 401 errors
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const replyToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      return await apiRequest("POST", `/api/admin/support-tickets/${ticketId}/reply`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      setReplyDialogOpen(false);
      setSelectedTicket(null);
      setReplyMessage("");
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the client",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/support-tickets/${ticketId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });

  const handleReply = () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }
    replyToTicketMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyMessage,
    });
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return "Guest";
    const user = users.find((u) => u.id === userId);
    return user?.fullName || user?.username || "Unknown";
  };

  const columns = [
    {
      key: "id",
      label: "Ticket ID",
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}</span>
      ),
    },
    {
      key: "userId",
      label: "Client",
      sortable: true,
      sortValue: (row: SupportTicket) => getUserName(row.userId).toLowerCase(),
      render: (value: string | null) => (
        <span className="font-semibold">{getUserName(value)}</span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value: string | null) => (
        <Badge variant="outline">{value || "General"}</Badge>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value: string | null) => {
        const colors: Record<string, string> = {
          Low: "bg-gray-500",
          Medium: "bg-blue-500",
          High: "bg-orange-500",
          Urgent: "bg-red-500",
        };
        return (
          <Badge className={`${colors[value || "Medium"]} text-white`}>
            {value || "Medium"}
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          Open: "destructive",
          "In Progress": "secondary",
          Resolved: "default",
          Closed: "secondary",
        };
        return <Badge variant={variants[value] || "secondary"}>{value}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: Date) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: SupportTicket) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTicket(row);
              setReplyDialogOpen(true);
            }}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const openTickets = tickets.filter((t) => t.status === "Open" || t.status === "In Progress");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
        <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/10 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-purple-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Support Tickets
              </h1>
              <p className="text-muted-foreground">Manage support tickets and client inquiries</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="relative p-6 border-purple-500/30 bg-gradient-to-br from-black/60 to-purple-500/5 backdrop-blur-sm overflow-hidden hover:border-purple-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Open Tickets</div>
            <div className="text-3xl font-bold text-purple-400">{openTickets.length}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-blue-500/30 bg-gradient-to-br from-black/60 to-blue-500/5 backdrop-blur-sm overflow-hidden hover:border-blue-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Tickets</div>
            <div className="text-3xl font-bold text-blue-400">{tickets.length}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-green-500/30 bg-gradient-to-br from-black/60 to-green-500/5 backdrop-blur-sm overflow-hidden hover:border-green-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Resolved</div>
            <div className="text-3xl font-bold text-green-400">
              {tickets.filter((t) => t.status === "Resolved").length}
            </div>
          </div>
        </Card>
        <Card className="relative p-6 border-red-500/30 bg-gradient-to-br from-black/60 to-red-500/5 backdrop-blur-sm overflow-hidden hover:border-red-500/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Urgent</div>
            <div className="text-3xl font-bold text-red-400">
              {tickets.filter((t) => t.priority === "Urgent" || t.priority === "High").length}
            </div>
          </div>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="border-primary/30 bg-gradient-to-br from-black/80 to-primary/5 backdrop-blur-xl">
        <div className="p-6 border-b border-primary/20">
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">All Support Tickets</h2>
          <p className="text-sm text-muted-foreground mt-1">Click "Reply" to view conversation and respond</p>
        </div>
        {tickets.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={tickets} 
            exportFileName="support-tickets"
            onRefresh={() => refetchTickets()}
            isRefreshing={isRefreshingTickets}
          />
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No support tickets found</p>
          </div>
        )}
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-black border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Support Ticket Conversation</DialogTitle>
            <DialogDescription>
              View conversation history and send reply to client
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="grid md:grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Client</Label>
                  <p className="font-semibold text-primary">{getUserName(selectedTicket.userId)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Status</Label>
                  <Badge className="ml-0">{selectedTicket.status}</Badge>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Subject</Label>
                  <p className="font-semibold text-lg">{selectedTicket.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
                  <p className="font-semibold">{selectedTicket.category || "General"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Priority</Label>
                  <Badge>{selectedTicket.priority || "Medium"}</Badge>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Conversation History</Label>
                
                {/* Original Message */}
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-400">U</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-400">{getUserName(selectedTicket.userId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedTicket.createdAt!).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm pl-10 whitespace-pre-wrap">{selectedTicket.message}</p>
                </Card>

                {/* Replies */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <>
                    {selectedTicket.replies.map((reply: any, index: number) => (
                      <Card 
                        key={index}
                        className={`p-4 ${
                          reply.isAdminReply 
                            ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30' 
                            : 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 ${reply.isAdminReply ? 'bg-green-500/20' : 'bg-blue-500/20'} rounded-full flex items-center justify-center`}>
                            <span className={`text-xs font-bold ${reply.isAdminReply ? 'text-green-400' : 'text-blue-400'}`}>
                              {reply.isAdminReply ? 'A' : 'U'}
                            </span>
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${reply.isAdminReply ? 'text-green-400' : 'text-blue-400'}`}>
                              {reply.isAdminReply ? 'Support Team' : getUserName(selectedTicket.userId)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm pl-10 whitespace-pre-wrap">{reply.message}</p>
                      </Card>
                    ))}
                  </>
                )}
              </div>
              {/* Reply Section */}
              <div className="pt-4 border-t border-primary/20">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider">Send Reply</Label>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to the client..."
                  rows={4}
                  className="mt-2 border-primary/30 bg-black/40 focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-primary/20">
                <Label className="text-sm font-bold text-primary uppercase tracking-wider mb-3 block">Update Status</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500/30 hover:bg-yellow-500/10"
                    onClick={() => updateTicketStatusMutation.mutate({ ticketId: selectedTicket.id, status: "In Progress" })}
                    disabled={updateTicketStatusMutation.isPending}
                  >
                    ⏳ In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 hover:bg-green-500/10"
                    onClick={() => updateTicketStatusMutation.mutate({ ticketId: selectedTicket.id, status: "Resolved" })}
                    disabled={updateTicketStatusMutation.isPending}
                  >
                    ✓ Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-500/30 hover:bg-gray-500/10"
                    onClick={() => updateTicketStatusMutation.mutate({ ticketId: selectedTicket.id, status: "Closed" })}
                    disabled={updateTicketStatusMutation.isPending}
                  >
                    🔒 Closed
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplyDialogOpen(false);
                    setSelectedTicket(null);
                    setReplyMessage("");
                  }}
                  className="flex-1 border-primary/30"
                  disabled={replyToTicketMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={replyToTicketMutation.isPending || !replyMessage.trim()}
                  className="flex-1 neon-gold font-bold"
                >
                  {replyToTicketMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

