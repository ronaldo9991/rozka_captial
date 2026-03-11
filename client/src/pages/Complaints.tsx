import PublicHeader from "@/components/PublicHeader";
import { BRAND_TITLE } from "@/lib/brand";
import Footer from "@/components/Footer";
import AnimatedGrid from "@/components/AnimatedGrid";
import ParticleField from "@/components/ParticleField";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Shield,
  Download,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";

export default function Complaints() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Complaint form submitted:", {
      name,
      email,
      phone,
      accountNumber,
      complaintType,
      message,
    });
    toast({
      title: "Complaint Submitted!",
      description: "We'll review your complaint and get back to you within 5 business days.",
    });
    setName("");
    setEmail("");
    setPhone("");
    setAccountNumber("");
    setComplaintType("");
    setMessage("");
  };

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <div className="relative min-h-[55vh] sm:min-h-[65vh] flex items-center overflow-hidden pt-24 sm:pt-32 pb-10 sm:pb-16">
        <AnimatedGrid variant="cyber" />
        <ParticleField count={60} className="opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-background to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5"></div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-block mb-6">
              <div className="px-5 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-primary font-semibold">Your voice matters to us</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              {BRAND_TITLE} <span className="text-gradient-gold text-glow-gold">Complaints</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We take all complaints seriously. If you have any concerns regarding your account or our services, 
              please contact us through the channels below. We're committed to resolving issues promptly and fairly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16 md:pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Quick Contact Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: Mail,
                title: "Complaint Email",
                description: "complains@rozkacapitals.com",
              },
              {
                icon: AlertCircle,
                title: "Report Abuse",
                description: "abuse@rozkacapitals.com",
              },
              {
                icon: Clock,
                title: "Response Time",
                description: "Within 5 business days",
              },
              {
                icon: Shield,
                title: "Confidential",
                description: "All complaints are handled securely",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 glass-morphism border border-primary/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gradient-gold text-glow-gold mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Complaints Policy & Information */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold inline-block pb-2">
                  Complaints Handling Policy
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    If you have any query regarding your account, or you are dissatisfied with our Services, 
                    in the first instance you should contact our Customer Support Department via e-mail at 
                    <a href="mailto:complains@rozkacapitals.com" className="text-primary hover:underline font-medium ml-1">
                      complains@rozkacapitals.com
                    </a>
                    , live chat, telephone or any other official method of communication made available by the Company.
                  </p>
                  <p>
                    We are committed to handling all complaints fairly, promptly, and in accordance with regulatory 
                    requirements. All complaints are reviewed by our dedicated complaints handling team.
                  </p>
                </div>
              </div>

              <div className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Complaint Email</p>
                      <a
                        href="mailto:complains@rozkacapitals.com"
                        className="font-semibold text-primary hover:underline"
                      >
                        complains@rozkacapitals.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Report Abuse</p>
                      <a
                        href="mailto:abuse@rozkacapitals.com"
                        className="font-semibold text-primary hover:underline"
                      >
                        abuse@rozkacapitals.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Support</p>
                      <p className="font-semibold">
                        <a href="tel:+971547199005" className="hover:text-primary transition-colors">
                          +971 54 719 9005
                        </a>
                        {" • "}
                        <a href="tel:+97143884268" className="hover:text-primary transition-colors">
                          +971 43 88 4268
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Live Chat</p>
                      <p className="font-semibold">24/7 via client portal</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold">
                  Download Complaint Form
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  You can download our official complaint form, fill it out, and send it back via email.
                </p>
                <Button
                  asChild
                  className="neon-gold magnetic-hover"
                >
                  <a
                    href="/complaints_procedure.pdf"
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Form
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Complaint Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold">
                  Submit a Complaint
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 54 719 9005"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number (if applicable)</Label>
                      <Input
                        id="accountNumber"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="complaintType">Type of Complaint</Label>
                    <Select value={complaintType} onValueChange={setComplaintType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complaint type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Related</SelectItem>
                        <SelectItem value="trading">Trading Issue</SelectItem>
                        <SelectItem value="deposit">Deposit/Withdrawal</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="service">Service Quality</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Complaint Details</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide detailed information about your complaint..."
                      rows={8}
                      required
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button type="submit" className="neon-gold magnetic-hover">
                      Submit Complaint
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <Card className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gradient-gold text-glow-gold mb-2 inline-block pb-2">
                    What Happens Next?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    After submitting your complaint, you will receive an acknowledgment email within 24 hours. 
                    Our complaints handling team will review your case and respond within 5 business days. 
                    For complex issues, we may require additional time, but we will keep you informed throughout the process.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

