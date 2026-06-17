import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Mail, ArrowRight } from "lucide-react";
import { useLogo } from "@/context/LogoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Footer() {
  const { logo } = useLogo();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: Integrate with Supabase to store newsletter subscriptions
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/shop" },
    { label: "Wishlist", href: "/wishlist" },
  ];

  const aboutLinks = [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Affiliate Program", href: "/affiliate/apply" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Affiliate Agreement", href: "/affiliate-agreement" },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/beanexample", color: "#1877F2" },
    { icon: Instagram, label: "Instagram", href: "#", color: "#E1306C" },
    { icon: Twitter, label: "Twitter", href: "#", color: "#1DA1F2" },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Column 1: Logo & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            {logo && (
              <div className="mb-6">
                <img src={logo} alt="Logo" className="h-10 object-contain invert" />
              </div>
            )}
            <p className="text-sm text-primary-foreground/70 mb-6">
              Be the one others look up to.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    title={social.label}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Shop</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: About Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-3">
              {aboutLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 5: Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Newsletter</h3>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Subscribe for exclusive updates and offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-r-none bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="rounded-l-none"
                >
                  <ArrowRight size={16} />
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="border-t border-primary-foreground/10 py-8"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sm text-primary-foreground/60">
                © {new Date().getFullYear()} Be An Example Inc. All rights reserved.
              </p>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <p className="text-xs text-primary-foreground/60 uppercase tracking-widest">We Accept</p>
              <div className="flex gap-3">
                {/* Stripe Badge */}
                <div className="bg-primary-foreground/10 px-3 py-1.5 rounded text-xs font-semibold text-primary-foreground">
                  Stripe
                </div>
                {/* PayPal Badge */}
                <div className="bg-primary-foreground/10 px-3 py-1.5 rounded text-xs font-semibold text-primary-foreground">
                  PayPal
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-right">
              <a href="mailto:support@beanexample.com" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center justify-center md:justify-end gap-2">
                <Mail size={16} />
                support@beanexample.com
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
