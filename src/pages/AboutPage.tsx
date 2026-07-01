import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Award, Leaf, Package, ShieldCheck, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrandSettings } from "@/context/LogoContext";
import Seo from "@/components/Seo";

export default function AboutPage() {
  const { settings } = useBrandSettings();
  const values = [
    {
      icon: Target,
      title: "Quality First",
      description: "We meticulously curate every product to meet our rigorous quality standards."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Building a community of individuals who inspire and elevate each other."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering excellence in every interaction and product."
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Reducing environmental impact through mindful product choices and on-demand production."
    }
  ];

  const productCategories = [
    "Hoodies",
    "Sweatshirts",
    "Crewnecks",
    "Tote bags",
    "Phone cases",
    "Lifestyle essentials"
  ];

  const timeline = [
    {
      year: "2026",
      title: "The Beginning",
      description: "Founded with a vision to create a platform where quality products meet purposeful commerce."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="About BE AN EXAMPLE — Our Story & Values"
        description="Learn how BE AN EXAMPLE crafts premium print-on-demand streetwear for a community that leads by example."
        path="/about"
      />
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
          Be the One<br />Others Look Up To
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          {settings.brandName} was created for those who choose growth over excuses, discipline over shortcuts, and purpose over trends.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          We're more than a clothing brand. We're a community of people committed to becoming the best version of themselves—one decision, one habit, and one example at a time.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Every piece we create is designed with intention: clean, timeless, and built to represent a mindset. Because what you wear should reflect who you're becoming.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          This is for the leaders, the builders, the dreamers, and the ones who keep showing up when nobody is watching.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Be the standard. Be the example.
        </p>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            To create products that inspire growth, confidence, and self-respect.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-4">
            We believe that the small choices we make every day shape the person we become. That's why everything we create is designed to represent discipline, purpose, and the pursuit of excellence.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-4">
            {settings.brandName} - {settings.tagline}
          </p>
        </div>

        {/* Values Grid */}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <Card key={idx} className="border-0 bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <CardHeader className="pb-3">
                  <Icon className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Our Products Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Our Products</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            At {settings.brandName}, we create products designed to inspire confidence, discipline, and personal growth through everyday style.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Our collection includes premium hoodies, sweatshirts, crewnecks, tote bags, phone cases, and other lifestyle essentials. Every design is created with a focus on minimal aesthetics, meaningful messaging, and long-lasting wearability.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We believe clothing should be more than something you wear—it should reflect who you are and who you're becoming.
          </p>

          <div className="flex flex-wrap gap-3">
            {productCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-4 py-2 text-sm font-medium text-foreground"
              >
                <Package className="w-3.5 h-3.5 text-primary" />
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Our Journey</h2>
        <div className="space-y-8">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-6 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="w-16 md:w-24 text-center flex-shrink-0">
                  <span className="text-2xl md:text-3xl font-black text-primary">{item.year}</span>
                </div>
                {idx < timeline.length - 1 && (
                  <div className="w-1 h-12 md:h-20 bg-gradient-to-b from-primary to-primary/20 mt-4" />
                )}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Sourcing Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">How We Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Thoughtful Design</h3>
              <p className="text-muted-foreground mb-4">
                Every product starts with deliberate design decisions — from blank selection to graphic placement. We carefully choose the products we offer based on material quality, fit, and how well they represent the {settings.brandName} standard.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Premium Production</h3>
              <p className="text-muted-foreground mb-4">
                We partner with trusted print-on-demand fulfillment providers to ensure high-quality materials, reliable printing, and consistent craftsmanship across every order.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Made On Demand</h3>
              <p className="text-muted-foreground mb-4">
                Each item is produced specifically for you after your order is placed. This approach helps reduce overproduction and allows us to focus on quality over quantity.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quality Standards</h3>
              <p className="text-muted-foreground mb-4">
                Before launching any product, we review samples to evaluate materials, print quality, fit, and overall presentation — ensuring everything meets the standard we'd be proud to put the {settings.brandName} name on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality & Fulfillment Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Quality & Fulfillment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-bold">Trusted Partners</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To ensure consistent quality and reliable delivery, we partner with Printful, one of the world's leading print-on-demand fulfillment providers.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-bold">Printed On Demand</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Each item is printed specifically for your order, helping reduce unnecessary waste and overproduction while maintaining high production standards. Printful operates fulfillment centers across multiple regions, allowing us to serve customers efficiently around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Our Commitment
        </h2>

        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          We're building more than a clothing brand—we're building a community that values growth, discipline, and positive impact. We believe success should create positive impact beyond ourselves, which is why we're committed to giving back as the brand grows: once we reach a meaningful revenue milestone, we will begin donating a portion of all revenue to Stripe Climate, supporting innovative technologies focused on carbon removal and long-term climate solutions. Every order helps us move one step closer to that goal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Responsible Production
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Made on demand to help reduce unnecessary waste and overproduction.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Produced through trusted fulfillment partners known for consistent quality.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Focused on creating timeless pieces rather than fast-moving trends.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Committed to making thoughtful improvements as our brand continues to grow.</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">
              Community Impact
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Building a community centered around growth, discipline, and self-respect.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Creating products that inspire confidence and intentional living.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Listening to customer feedback to shape future collections.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Encouraging people to lead by example in everyday life.</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-10 italic">
          Thank you for being part of the journey.
        </p>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Join Our Community</h2>
          <p className="text-lg mb-8 opacity-90">
            Become part of something bigger. Join our affiliate program and earn while sharing
            products you believe in.
          </p>
          <Link to="/affiliate/apply">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              Become an Affiliate
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}