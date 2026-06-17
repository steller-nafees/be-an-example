export default function CookiePolicy() {
  const lastUpdated = "June 17, 2024";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Cookie Policy</h1>
        <p className="text-muted-foreground">
          Last updated: <span className="font-semibold">{lastUpdated}</span>
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl prose dark:prose-invert">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your device (computer, mobile phone, or tablet) 
              when you visit a website. They help websites remember information about your visit, including preferences 
              and login details. Cookies are widely used to make websites work more efficiently.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>
            <p className="text-muted-foreground mb-3">
              Be An Example uses the following types of cookies:
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Essential Cookies</h3>
            <p className="text-muted-foreground mb-2">
              These cookies are necessary for the website to function properly:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Session management (keeping you logged in)</li>
              <li>Security tokens and CSRF protection</li>
              <li>Language and region preferences</li>
              <li>Shopping cart functionality</li>
              <li>Payment processing</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Performance Cookies</h3>
            <p className="text-muted-foreground mb-2">
              These cookies help us understand how visitors use the website:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Google Analytics for traffic analysis</li>
              <li>Page load times and performance metrics</li>
              <li>Error tracking and debugging</li>
              <li>User behavior analysis</li>
              <li>Crash reporting</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Functional Cookies</h3>
            <p className="text-muted-foreground mb-2">
              These cookies enhance your experience by remembering preferences:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Theme preferences (dark/light mode)</li>
              <li>Product filters and sorting preferences</li>
              <li>Sidebar state and UI preferences</li>
              <li>Previous searches and browse history</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.4 Marketing Cookies</h3>
            <p className="text-muted-foreground mb-2">
              These cookies are used for targeted advertising and marketing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Facebook Pixel for retargeting campaigns</li>
              <li>Google Ads conversion tracking</li>
              <li>Affiliate tracking cookies (30-day duration)</li>
              <li>Email marketing tags</li>
              <li>Product recommendation engines</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Cookie Duration</h2>
            <p className="text-muted-foreground mb-3">
              Cookies have different lifespans:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold">Session Cookies:</span> Deleted when browser closes</li>
              <li><span className="font-semibold">Persistent Cookies:</span> Remain for specified duration (typically 30 days to 2 years)</li>
              <li><span className="font-semibold">Affiliate Cookies:</span> 30-day duration for commission tracking</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-3">
              We use third-party services that place cookies on your device:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold">Google Analytics:</span> Traffic and user behavior analysis</li>
              <li><span className="font-semibold">Facebook:</span> Conversion tracking and retargeting</li>
              <li><span className="font-semibold">Stripe:</span> Payment processing</li>
              <li><span className="font-semibold">Supabase:</span> Backend services and authentication</li>
              <li><span className="font-semibold">Email Services:</span> Campaign tracking and analytics</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              These third parties have their own privacy policies governing cookie usage.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. How We Use Cookie Information</h2>
            <p className="text-muted-foreground mb-3">
              We use cookie data for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Personalizing your website experience</li>
              <li>Remembering login credentials and preferences</li>
              <li>Processing transactions securely</li>
              <li>Analyzing website usage and performance</li>
              <li>Detecting fraud and ensuring security</li>
              <li>Serving targeted advertisements</li>
              <li>Measuring marketing campaign effectiveness</li>
              <li>Improving website features and functionality</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Consent and Opt-In</h2>
            <p className="text-muted-foreground">
              When you first visit Be An Example, you'll see a cookie consent banner. This banner allows you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Accept all cookies</li>
              <li>Accept only essential cookies</li>
              <li>Manage cookie preferences in detail</li>
              <li>Decline non-essential cookies</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Essential cookies are always enabled to ensure website functionality. Marketing and performance 
              cookies require your consent.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-3">
              You have control over cookies:
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Browser Settings</h3>
            <p className="text-muted-foreground mb-4">
              Most browsers allow you to control cookies through settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li><span className="font-semibold">Chrome:</span> Settings → Privacy and Security → Cookies</li>
              <li><span className="font-semibold">Firefox:</span> Preferences → Privacy → Cookies</li>
              <li><span className="font-semibold">Safari:</span> Preferences → Privacy → Cookies</li>
              <li><span className="font-semibold">Edge:</span> Settings → Privacy → Cookies</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Cookie Preferences</h3>
            <p className="text-muted-foreground">
              You can modify your cookie preferences at any time by clicking the cookie settings link in our website footer.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Do Not Track</h2>
            <p className="text-muted-foreground">
              If your browser sends a "Do Not Track" signal, Be An Example will respect this preference and disable 
              tracking cookies (except those essential for functionality). However, some features may be limited.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. GDPR and Privacy Regulations</h2>
            <p className="text-muted-foreground mb-3">
              For users in the EU and other jurisdictions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You have the right to access cookies placed on your device</li>
              <li>You can withdraw consent at any time</li>
              <li>You can request deletion of marketing cookies</li>
              <li>Essential cookies are justified as necessary for contract performance</li>
              <li>Non-essential cookies require explicit consent</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">10. Affiliate Cookies and Commission Tracking</h2>
            <p className="text-muted-foreground">
              Be An Example uses affiliate cookies to track referrals and attribute sales to affiliates:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Duration: 30 days from click</li>
              <li>Purpose: Commission tracking and fraud detection</li>
              <li>Data: Affiliate ID, click source, conversion tracking</li>
              <li>If you visit through an affiliate link, this cookie records it</li>
              <li>Commissions only paid on valid, non-fraudulent purchases</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">11. Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect cookie data. However, no system is completely 
              secure. Sensitive information (passwords, payment details) is encrypted.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">12. Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy periodically. Significant changes will be communicated via email 
              or prominent notice on our website. Your continued use constitutes acceptance of updated policies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">13. Questions or Concerns</h2>
            <p className="text-muted-foreground">
              If you have questions about our cookie practices:
            </p>
            <div className="bg-secondary/30 p-6 rounded-lg mt-4">
              <p className="font-semibold">Be An Example Inc.</p>
              <p className="text-muted-foreground">Email: privacy@beanexample.com</p>
              <p className="text-muted-foreground">Support: support@beanexample.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
