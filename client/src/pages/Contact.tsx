import PublicHeader from "@/components/PublicHeader";
import { BRAND_TITLE } from "@/lib/brand";
import Footer from "@/components/Footer";
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
  MapPin,
  Headphones,
  Clock,
  MessageCircle,
  Shield,
} from "lucide-react";
import { useState } from "react";
import SearchableCountrySelect from "@/components/SearchableCountrySelect";

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Contact form submitted:", { name, email, phone, country, topic, message });
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setTopic("");
    setMessage("");
  };

  return (
    <div className="min-h-screen">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center overflow-hidden pt-24 sm:pt-32 pb-10 sm:pb-16">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/hero img.jpeg"
            alt="Rozka Capitals Hero"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/90"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-block mb-10">
              <div className="px-5 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm neon-gold">
                <span className="text-primary font-semibold">We are here 24/7 for every trader</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 md:mb-10">
              Contact <span className="text-gradient-gold text-glow-gold">{BRAND_TITLE}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mt-6 sm:mt-8 md:mt-10">
              Reach our global support team for personalised assistance, partnership inquiries, or platform guidance. 
              Your success is our priority.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16 md:pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Quick Contact Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Headphones,
                title: "24/7 Support",
                description: "Live chat & callback assistance",
                isClickable: false,
              },
              {
                icon: Mail,
                title: "Email Us",
                description: "support@rozkacapitals.com",
                isClickable: true,
                link: "mailto:support@rozkacapitals.com",
              },
              {
                icon: Clock,
                title: "Response Time",
                description: "Within one business day",
                isClickable: false,
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
                  {item.isClickable ? (
                    <a 
                      href={item.link} 
                      className="text-sm text-muted-foreground leading-relaxed hover:text-primary transition-colors block"
                    >
                      {item.description}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Contact Details */}
          <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold inline-block pb-2">
                  Direct Support
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Live Chat & Ticketing</p>
                      <p className="font-semibold">24/7 via client portal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href="mailto:support@rozkacapitals.com" className="font-semibold hover:text-primary transition-colors">
                        support@rozkacapitals.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold">
                  Location
                </h2>
                <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Office Address
                    </p>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Rozka+Capitals+Limited+Ground+Floor+The+Sotheby+Building+Rodney+Village+Rodney+Bay+Gros-Islet+Saint+Lucia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      <p>Rozka Capitals Limited</p>
                      <p>Ground Floor, The Sotheby Building,</p>
                      <p>Rodney Village, Rodney Bay, Gros-Islet Saint Lucia.</p>
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> Support Hours
                    </p>
                    <p className="text-muted-foreground">24/7 • Around the Clock</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="glass-morphism-strong border border-primary/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gradient-gold text-glow-gold">
                  Send Us a Message
                </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-testid="input-email"
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
                      placeholder="Enter your phone number"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <SearchableCountrySelect
                      id="country"
                      value={country}
                      onChange={setCountry}
                      placeholder="Select your country"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Select value={topic} onValueChange={setTopic} required>
                    <SelectTrigger data-testid="select-topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="account">Account Support</SelectItem>
                      <SelectItem value="trading">Trading Questions</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    rows={6}
                    data-testid="textarea-message"
                    required
                  />
                </div>

                  <div className="flex justify-center">
                    <Button type="submit" className="neon-gold magnetic-hover" data-testid="button-submit">
                      Send Message
                    </Button>
                  </div>
              </form>
            </Card>
            </motion.div>
          </div>

          {/* Privacy Policy Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <details className="glass-morphism-strong border border-primary/20 rounded-3xl p-6 shadow-2xl group" open={false}>
              <summary className="flex items-center justify-between cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gradient-gold text-glow-gold inline-block pb-2">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground">How we protect and use your personal information</p>
                  </div>
                </div>
                <span className="text-primary font-semibold text-sm group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground max-h-[50vh] overflow-y-auto pr-4">
                <section>
                  <p>Rozka Capitals Brokerage Inc. (will be mention as Rozka Capitals in the following) takes your privacy seriously. The main purpose of this Privacy Policy is to inform you of how we treat your personal information that Rozka Capitals collects and receives when you use Rozka Capitals’s customer's portals, intended customer applications, job applications, website visitors. This policy is based on the privacy and data protection principles common to the countries in which we operate.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Are you required to provide Personal Information?</h5>
                  <p>For you to utilize our services, you will provide us with your Personal Information entirely spontaneously. In most circumstances, Rozka Capitals cannot take action without utilizing certain of your Personal Information, for example, because this Personal Information is required to process your instructions or orders or provide you with access to our services or marketing materials. In most cases, it will be impossible for us to provide the services to you without the relevant Personal Information.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Information Rozka Capitals Collects and Uses</h5>
                  <p>Personal information is information about you such as your name, address, email address, or phone number, and that is not otherwise publicly available. For some financial products and services, we might also request your address, Social Security number, and information about your assets. Rozka Capitals depends on our users to update and correct their personal information when necessary.</p>
                  <p className="mt-2">If we use your personal information for purposes other than as described in this Privacy Policy, we will offer you an effective way to opt-out of the use or ask for your consent before the use of such information.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Information Sharing</h5>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>We believe that access, use, disclosure, or continuation of personal information is necessary to respond to satisfy any applicable law or statute, regulation, legal process, government request, to establish or exercise our legal rights or to defend against legal claims concerning Rozka Capitals, its users, or the public as required or permitted by law.</li>
                    <li>We believe the access, use, disclosure, or continuation of personal information is necessary to share information to detect, prevent, investigate, or otherwise take action to address fraud, illegal activities, potential threats to the rights, property, or safety of any persons.</li>
                    <li>We received your confirmation.</li>
                  </ol>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Confidentiality and Security</h5>
                  <p>Rozka Capitals uses physical, electronic, and procedural safeguards and technologies to protect personal information from unauthorized access, use, or disclosure. Rozka Capitals limits access to your personal information to our employees, contractors, and agents who we believe reasonably need to gain access to such information to do their jobs to operate, implement, develop, perform or improve our services. These individuals are bound by confidentiality obligations to Rozka Capitals and may be subject to termination or legal actions if they fail to comply with these obligations.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Retention of Communications</h5>
                  <p>When you send an email or other communications to Rozka Capitals, we retain those communications for a certain period to process your questions and concerns, respond to your requests, and improve our services.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Transferring your Personal Information outside the EEA</h5>
                  <p>For Personal Information subject to the General Data Protection Regulation (EU) 2016/679 (“GDPR”) we may transfer your Personal Information outside the EEA for the Permitted Purposes as described above. This may include countries that do not provide the same level of protection as the laws of your home country (for example, the laws within the EEA or the United States). We will ensure that any such international transfers are made subject to appropriate or suitable safeguards if required by the GDPR or other relevant laws. You may contact us at any time using the contact details below if you would like further information on such safeguards.</p>
                  <p className="mt-2">Concerning persons covered by GDPR, in case Personal Information is transferred to countries or territories outside of the European Economic Area (“EEA”) that are not recognized by the European Commission as offering an adequate level of data protection, we have put in place appropriate data transfer mechanisms to ensure Personal Information is protected.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Further rights for persons or information covered by GDPR</h5>
                  <p>Concerning EEA residents and where your Personal Information is processed by a Rozka Capitals Entity established in the EEA (“Covered Individuals”). If you are a Covered Individual you have several legal rights under GDPR concerning the Personal Information that we hold about you. You can request these pieces of information by sending us an info request: info@rozkacapitals.com</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">Our Policy</h5>
                  <p>Rozka Capitals regularly review our Privacy Policy. We will update this Privacy Policy from time to time, with or without notice. Rozka Capitals will, however, notify you about significant changes by sending a notice to your primary email address or by placing a notice on our website. Please feel free to contact us if you have questions or suggestions regarding this Privacy Policy by contacting us through the website.</p>
                </section>
                <section>
                  <h5 className="text-foreground font-semibold mb-2">How to contact us</h5>
                  <p>We welcome your views about our website and our Privacy Policy. If you have any questions about this Policy, please contact the Data Protection Officer at info@rozkacapitals.com or please contact Rozka Capitals Customer Services through the Rozka Capitals website at https://www.rozkacapitals.com/contact-us.</p>
                </section>
              </div>
            </details>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
