export default function AffiliateAgreement() {
  const lastUpdated = "June 17, 2024";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Affiliate Agreement</h1>
        <p className="text-muted-foreground">
          Last updated: <span className="font-semibold">{lastUpdated}</span>
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl prose dark:prose-invert">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Program Overview</h2>
            <p className="text-muted-foreground">
              The Be An Example Affiliate Program (the "Program") is an opportunity for individuals and organizations 
              to earn commissions by promoting Be An Example products and services. This Agreement defines the terms 
              and conditions under which you ("Affiliate") can participate in the Program.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Eligibility Requirements</h2>
            <p className="text-muted-foreground mb-3">
              To participate in the Program, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Be at least 18 years old</li>
              <li>Have a valid email address and bank account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not be a convicted felon or violate laws</li>
              <li>Have an established online presence (blog, social media, email list, etc.)</li>
              <li>Agree to follow Program guidelines and ethical standards</li>
              <li>Not engage in prohibited marketing practices</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Application and Approval</h2>
            <p className="text-muted-foreground mb-3">
              The application process:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Complete the online affiliate application form</li>
              <li>Provide accurate information about your platforms and audience</li>
              <li>Be An Example will review applications within 5-7 business days</li>
              <li>Approval is at Be An Example's sole discretion</li>
              <li>We may request additional information or samples of your work</li>
              <li>Rejection reasons will be provided when possible</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Commission Structure</h2>
            <p className="text-muted-foreground mb-3">
              Commission rates and structure:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold">Standard Commission:</span> 10% of sale value for referred customers</li>
              <li><span className="font-semibold">Performance Bonus:</span> Up to 15% for affiliates with 100+ sales/month</li>
              <li><span className="font-semibold">Recurring Commission:</span> Applicable to subscription products (if available)</li>
              <li><span className="font-semibold">Cookie Duration:</span> 30-day attribution window (if purchase within 30 days, you get credit)</li>
              <li>Commissions calculated on sale amount after returns and discounts</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Commission rates may change with 30 days' written notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground mb-3">
              Payment details:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Commissions paid monthly on the 15th of the following month</li>
              <li>Minimum payout threshold: $50</li>
              <li>Payment via bank transfer, PayPal, or other agreed methods</li>
              <li>Payments made in USD</li>
              <li>Tax documentation (W-9, W-8BEN) required before first payment</li>
              <li>Payment failures due to incorrect banking info are affiliate responsibility</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Affiliate Obligations</h2>
            <p className="text-muted-foreground mb-3">
              As an affiliate, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide honest, accurate product recommendations</li>
              <li>Clearly disclose your affiliate relationship ("Affiliate Link" or similar)</li>
              <li>Not use misleading, false, or deceptive marketing practices</li>
              <li>Not spam, send unsolicited emails, or use blackhat SEO tactics</li>
              <li>Not impersonate Be An Example or misrepresent the brand</li>
              <li>Comply with FTC, ASA, and other advertising regulations</li>
              <li>Not promote competing products in the same content as affiliate links</li>
              <li>Not engage in trademark bidding or paid search abuse</li>
              <li>Use only approved marketing materials provided by Be An Example</li>
              <li>Maintain professional and ethical standards</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Marketing Materials</h2>
            <p className="text-muted-foreground mb-3">
              Approved marketing materials include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Product images and descriptions</li>
              <li>Banner ads and display creative</li>
              <li>Email templates</li>
              <li>Social media content</li>
              <li>Product links and affiliate URLs</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All materials must be approved before use. Affiliates are responsible for obtaining proper licenses 
              and permissions for any content created independently.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Prohibited Marketing Practices</h2>
            <p className="text-muted-foreground mb-3">
              The following are strictly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Paid search/PPC campaigns using Be An Example brand keywords</li>
              <li>Email spam or unsolicited bulk emails</li>
              <li>Malware, adware, or pop-up distribution</li>
              <li>Comment spam or blog spam</li>
              <li>False or misleading claims about products</li>
              <li>Unethical SEO practices</li>
              <li>Trademark infringement</li>
              <li>Domain squatting (e.g., "beanexamplepromo.com")</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All Be An Example trademarks, logos, and marketing materials are the property of Be An Example Inc. 
              You may use approved materials only for promoting Be An Example products. You retain rights to your 
              original content (blog posts, videos, etc.), but grant Be An Example a license to use your content 
              for promotional purposes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">10. Term and Termination</h2>
            <p className="text-muted-foreground mb-3">
              Program duration and termination:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Agreement is effective upon approval and continues indefinitely</li>
              <li>Either party may terminate with 30 days' written notice</li>
              <li>Be An Example may immediately terminate for policy violations</li>
              <li>Upon termination, affiliate links become inactive</li>
              <li>Final commission payment made within 60 days of termination</li>
              <li>Previously earned commissions remain payable</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">11. Fraud Detection</h2>
            <p className="text-muted-foreground">
              Be An Example reserves the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Monitor affiliate activities for fraud or suspicious behavior</li>
              <li>Decline commissions on suspicious orders</li>
              <li>Investigate unusual traffic patterns or commission spikes</li>
              <li>Withhold payments pending investigation</li>
              <li>Terminate accounts engaged in fraudulent activity</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">12. Liability and Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Be An Example from any claims, damages, or legal action 
              arising from your violation of this agreement or your marketing practices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">13. Disclaimer</h2>
            <p className="text-muted-foreground">
              Be An Example provides the Program "as is" without guarantees regarding earnings or traffic. 
              Affiliate success depends on your marketing efforts and audience quality. Be An Example is not 
              responsible for platform changes, algorithm updates, or traffic fluctuations.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">14. Support and Resources</h2>
            <p className="text-muted-foreground mb-3">
              Be An Example provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Dedicated affiliate manager for top performers</li>
              <li>Monthly performance reports and analytics</li>
              <li>Email support for affiliate questions</li>
              <li>Exclusive affiliate tools and dashboard</li>
              <li>Marketing recommendations and best practices</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">15. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Disputes regarding commissions or agreement terms:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Contact affiliate support with documentation</li>
              <li>Be An Example will investigate within 15 days</li>
              <li>Decision made in good faith based on available data</li>
              <li>Further disputes subject to binding arbitration</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">16. Governing Law</h2>
            <p className="text-muted-foreground">
              This Agreement is governed by the laws of the United States and is subject to US regulations 
              regarding affiliate marketing and advertising.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">17. Contact Information</h2>
            <p className="text-muted-foreground">
              For affiliate program questions or support:
            </p>
            <div className="bg-secondary/30 p-6 rounded-lg mt-4">
              <p className="font-semibold">Be An Example Affiliate Program</p>
              <p className="text-muted-foreground">Email: affiliates@beanexample.com</p>
              <p className="text-muted-foreground">Support: support@beanexample.com</p>
              <p className="text-muted-foreground">Apply: /affiliate/apply</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
