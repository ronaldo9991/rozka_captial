import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Clock, CheckCircle2, Plus, User, Shield } from "lucide-react";
import { FullPageLoader, InlineLoader } from "@/components/DashboardLoader";
import type { SupportTicket } from "@shared/schema";

export default function Support() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Create ticket form
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [message, setMessage] = useState("");

  // Fetch tickets - removed auto-refresh to prevent constant reloading
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
    refetchInterval: false, // Disabled auto-refresh - user can manually refresh if needed
    retry: false, // Don't retry on 401 errors
    queryFn: async () => {
      const res = await fetch("/api/support-tickets", {
        credentials: "include",
      });
      if (res.status === 401) {
        // Return empty array instead of throwing - prevents error spam
        return [];
      }
      if (!res.ok) {
        throw new Error(`Failed to load tickets: ${res.statusText}`);
      }
      return await res.json();
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (res.status === 401) {
        throw new Error("You must be logged in to create a support ticket. Please sign in and try again.");
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || "Failed to create ticket");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setCreateDialogOpen(false);
      setSubject("");
      setCategory("");
      setPriority("Medium");
      setMessage("");
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    },
  });

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      return await apiRequest("POST", `/api/support-tickets/${ticketId}/reply`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setNewMessage("");
      toast({
        title: "Reply Sent",
        description: "Your message has been added to the ticket.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleCreateTicket = () => {
    if (!subject.trim() || !category || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate({
      subject,
      category,
      priority,
      message,
    });
  };

  const handleSendReply = () => {
    if (!selectedTicket || !newMessage.trim()) return;
    addReplyMutation.mutate({ ticketId: selectedTicket.id, message: newMessage });
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "In Progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Resolved": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Closed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return <FullPageLoader text="Loading support tickets..." />;
  }

  const openTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress");
  const closedTickets = tickets.filter(t => t.status === "Resolved" || t.status === "Closed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl" />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="neon-gold font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="relative p-6 border-green-500/30 bg-gradient-to-br from-black/60 to-green-500/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Open Tickets</div>
            <div className="text-3xl font-bold text-green-400">{openTickets.length}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-primary/30 bg-gradient-to-br from-black/60 to-primary/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Total Tickets</div>
            <div className="text-3xl font-bold text-primary">{tickets.length}</div>
          </div>
        </Card>
        <Card className="relative p-6 border-purple-500/30 bg-gradient-to-br from-black/60 to-purple-500/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Resolved</div>
            <div className="text-3xl font-bold text-purple-400">{closedTickets.length}</div>
          </div>
        </Card>
      </div>

      {/* Open Tickets */}
      <div>
        <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-4">
          Active Tickets ({openTickets.length})
        </h2>
        {openTickets.length > 0 ? (
          <div className="space-y-4">
            {openTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="relative p-6 border-primary/30 bg-gradient-to-br from-black/80 to-primary/5 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => openTicket(ticket)}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg text-foreground">{ticket.subject}</h3>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                      <span className={`text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{ticket.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.createdAt!).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {ticket.replies?.length || 0} replies
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-primary/30">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="relative p-12 text-center border-primary/30 bg-black/80 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <p className="text-muted-foreground">No open tickets. Create one if you need help!</p>
          </Card>
        )}
      </div>

      {/* Closed Tickets */}
      {closedTickets.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-purple-400 uppercase tracking-wider mb-4">
            Resolved Tickets ({closedTickets.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {closedTickets.slice(0, 6).map((ticket) => (
              <Card
                key={ticket.id}
                className="p-4 border-purple-500/30 bg-gradient-to-br from-black/60 to-purple-500/5 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => openTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      <p className="font-semibold truncate">{ticket.subject}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Resolved: {new Date(ticket.updatedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl">Create Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and our support team will help you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-primary uppercase tracking-wider text-xs font-bold">
                Subject *
              </Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-primary/30 bg-black/40"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-primary uppercase tracking-wider text-xs font-bold">
                  Category *
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="border-primary/30 bg-black/40">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-primary/30">
                    <SelectItem value="Account">Account Issues</SelectItem>
                    <SelectItem value="Deposit">Deposit/Withdrawal</SelectItem>
                    <SelectItem value="Trading">Trading Platform</SelectItem>
                    <SelectItem value="Verification">Document Verification</SelectItem>
                    <SelectItem value="Technical">Technical Support</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-primary uppercase tracking-wider text-xs font-bold">
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="border-primary/30 bg-black/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-primary/30">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-primary uppercase tracking-wider text-xs font-bold">
                Message *
              </Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-primary/30 bg-black/40 min-h-[150px]"
              />
            </div>

            <Button
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
              className="neon-gold font-bold"
            >
              {createTicketMutation.isPending ? (
                <><InlineLoader className="mr-2" />Creating...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Submit Ticket</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-black border-primary/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-primary text-xl">{selectedTicket.subject}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                    <span className={`text-sm font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
                <DialogDescription>
                  Ticket #{selectedTicket.id.slice(0, 8)} • {selectedTicket.category}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Original Message */}
                <Card className="p-4 border-primary/30 bg-gradient-to-br from-black/60 to-primary/5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">You</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(selectedTicket.createdAt!).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>
                  </div>
                </Card>

                {/* Replies */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <div className="space-y-3">
                    {selectedTicket.replies.map((reply: any) => (
                      <Card key={reply.id} className={`p-4 ${reply.isAdminReply ? 'border-green-500/30 bg-gradient-to-br from-black/60 to-green-500/5' : 'border-primary/30 bg-gradient-to-br from-black/60 to-primary/5'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${reply.isAdminReply ? 'bg-green-500/20' : 'bg-primary/20'} rounded-full flex items-center justify-center flex-shrink-0`}>
                            {reply.isAdminReply ? (
                              <Shield className="w-5 h-5 text-green-400" />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${reply.isAdminReply ? 'text-green-400' : 'text-primary'}`}>
                                {reply.isAdminReply ? 'Support Team' : 'You'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Reply Input (only for open tickets) */}
                {(selectedTicket.status === "Open" || selectedTicket.status === "In Progress") && (
                  <div className="space-y-2 pt-4 border-t border-primary/20">
                    <Label htmlFor="reply" className="text-primary uppercase tracking-wider text-xs font-bold">
                      Add Reply
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="reply"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="border-primary/30 bg-black/40"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleSendReply}
                      disabled={addReplyMutation.isPending || !newMessage.trim()}
                      className="neon-gold"
                    >
                      {addReplyMutation.isPending ? (
                        <><InlineLoader className="mr-2" />Sending...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" />Send Reply</>
                      )}
                    </Button>
                  </div>
                )}

                {(selectedTicket.status === "Resolved" || selectedTicket.status === "Closed") && (
                  <Card className="p-4 border-purple-500/30 bg-gradient-to-br from-black/60 to-purple-500/5">
                    <div className="flex items-center gap-2 text-purple-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">This ticket has been {selectedTicket.status.toLowerCase()}</span>
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

