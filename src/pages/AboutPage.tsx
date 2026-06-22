import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Award, Leaf, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrandSettings } from "@/context/LogoContext";

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
      description: "Reducing environmental impact through conscious sourcing and practices."
    }
  ];

  const timeline = [
    {
      year: "2026",
      title: "The Beginning",
      description: "Founded with a vision to create a platform where quality products meet purposeful commerce."
    },
    /*
    {
      year: "2021",
      title: "First Milestone",
      description: "Reached 10,000+ satisfied customers and expanded our product collection."
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Launched international shipping and established partnerships with premium brands."
    },
    {
      year: "2023",
      title: "Community Growth",
      description: "Launched affiliate program, reaching 1,000+ active partners."
    },
    {
      year: "2024",
      title: "Sustainability Initiative",
      description: "Committed to carbon-neutral operations and introduced eco-friendly packaging."
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Expanding our community and impact while maintaining uncompromising quality."
    }*/
  ];

  return (
    <div className="min-h-screen bg-background">
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
                Every product undergoes our 5-stage quality assessment process. We partner with only the most trusted manufacturers and artisans who share our commitment to excellence.
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
                Before launching a product, we carefully review materials, print quality, fit, and overall presentation to ensure it meets the standards of the {settings.brandName} brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}

      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Our Commitment
        </h2>

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
