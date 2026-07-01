import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBrandSettings } from "@/context/LogoContext";
import { supabase } from "@/lib/supabase";
import Seo from "@/components/Seo";

export default function ContactPage() {
  const { toast } = useToast();
  const { settings } = useBrandSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("contact-submit", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          company: formData.company.trim(),
          page_url: window.location.href,
        },
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: `We received your message and will reply at ${settings.supportEmail} as soon as possible.`,
      });
      setFormData({ name: "", email: "", subject: "", message: "", company: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days within the continental US. All orders ship free and include tracking information once your order ships."
    },
    {
      question: "What's your return policy?",
      answer: "We offer a 30-day money-back guarantee on most items. Products must be unused and in original condition. For details, visit our Refund & Returns Policy page."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes! We ship to over 50 countries worldwide. Shipping costs and delivery times vary by location. International orders may be subject to customs duties."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order through your account dashboard or use the tracking link sent to your email. Visit our Order Track page for more details."
    },
    {
      question: "Are your products authentic?",
      answer: "Absolutely. All products sold on Be An Example are 100% authentic. We source directly from authorized manufacturers and artisans. Each product goes through our rigorous quality verification process."
    },
    {
      question: "Can I become an affiliate?",
      answer: "Yes! We offer a competitive affiliate program with commissions, marketing resources, and dedicated support. Visit our Affiliate Program page or apply directly on the affiliate portal."
    },
    {
      question: "How do I contact customer support?",
      answer: `You can reach our support team via email at ${settings.supportEmail}, or use the contact form on this page. We typically respond within 24 hours during business days.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Get In Touch</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Have a question or feedback? We'd love to hear from you. Our team is here to help.
        </p>
      </section>

      {/* Contact Form & Info Section */}
      <section className="container mx-auto px-6 py-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      name="message"
                      placeholder="Your message here..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="sr-only" aria-hidden="true">
                    <label className="text-sm font-medium mb-2 block">Company</label>
                    <Input
                      name="company"
                      autoComplete="off"
                      tabIndex={-1}
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`mailto:${settings.supportEmail}`} className="text-primary hover:underline">
                  {settings.supportEmail}
                </a>
                {settings.phone && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {settings.phone}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  We respond within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{settings.weekdayHours}</p>
                <p>{settings.weekendHours}</p>
                <p className="text-muted-foreground">
                  {settings.closedNote}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{settings.companyName}</p>
                <p className="text-muted-foreground mt-2">
                  {settings.addressLine1}<br />
                  {settings.addressLine2}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-8">
          Check out our legal pages for more detailed information about policies and terms.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </a>
          <a href="/terms">
            <Button variant="outline">Terms of Service</Button>
          </a>
          <a href="/refund-policy">
            <Button variant="outline">Refund Policy</Button>
          </a>
        </div>
      </section>
    </div>
  );
}
