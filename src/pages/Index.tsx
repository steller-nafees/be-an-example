import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Collections from "@/components/Collections";
import Seo from "@/components/Seo";

const Index = () => {
  return (
    <>
      <Seo
        title="BE AN EXAMPLE — Premium Streetwear That Sets the Standard"
        description="Bold, premium print-on-demand streetwear for those who lead. Shop tees, hoodies, and essentials designed to make your style an example."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "BE AN EXAMPLE",
          url: "/",
          potentialAction: {
            "@type": "SearchAction",
            target: "/shop?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Hero />
      <FeaturedProducts />
      <Collections />
    </>
  );
};

export default Index;
