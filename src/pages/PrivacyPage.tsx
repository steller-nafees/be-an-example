import { format } from "date-fns";

export default function PrivacyPage() {
  const lastUpdated = "June 17, 2024";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: <span className="font-semibold">{lastUpdated}</span>
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl prose dark:prose-invert">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Be An Example Inc. ("we", "us", "our", or "Company") respects your privacy and is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Account registration information (name, email, password)</li>
              <li>Profile information (address, phone number, preferences)</li>
              <li>Payment information (processed through secure payment gateways)</li>
              <li>Order and transaction history</li>
              <li>Communications (emails, contact form submissions, customer support inquiries)</li>
              <li>Survey responses and feedback</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Cookies and tracking technologies</li>
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent on website</li>
              <li>Referral sources</li>
              <li>Geographic location (approximate)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.3 Third-Party Information</h3>
            <p className="text-muted-foreground">
              We may receive information about you from third parties, including analytics providers, 
              payment processors, and social media platforms if you link your accounts.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Processing and fulfilling orders</li>
              <li>Sending transactional communications (order confirmations, shipping updates)</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Personalizing your experience and recommending products</li>
              <li>Marketing communications (with your consent)</li>
              <li>Fraud detection and prevention</li>
              <li>Analytics and improving our services</li>
              <li>Complying with legal obligations</li>
              <li>Administering affiliate and loyalty programs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing</h2>
            <p className="text-muted-foreground">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li><span className="font-semibold">Contract:</span> To fulfill orders and services you've requested</li>
              <li><span className="font-semibold">Consent:</span> For marketing communications and non-essential cookies</li>
              <li><span className="font-semibold">Legitimate Interest:</span> For fraud prevention and service improvements</li>
              <li><span className="font-semibold">Legal Obligation:</span> To comply with applicable laws and regulations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-3">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold">Service Providers:</span> Shipping, payment processing, analytics (with data processing agreements)</li>
              <li><span className="font-semibold">Business Partners:</span> Affiliated companies and partners (only where necessary)</li>
              <li><span className="font-semibold">Legal Requirements:</span> When required by law, court order, or government request</li>
              <li><span className="font-semibold">Business Transfers:</span> In case of merger, acquisition, or asset sale</li>
              <li><span className="font-semibold">Affiliate Program:</span> Limited information with affiliate partners for commission tracking</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Data Storage and Retention</h2>
            <p className="text-muted-foreground">
              We store your personal information in secure servers. We retain data for as long as necessary to provide services, 
              fulfill legal obligations, and resolve disputes. You can request deletion of your data subject to legal requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal data, including encryption, 
              secure servers, and regular security audits. However, no online system is completely secure. We cannot guarantee 
              absolute security of your information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground mb-3">
              We use cookies and similar tracking technologies to enhance your experience. Types of cookies include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold">Essential Cookies:</span> Required for website functionality</li>
              <li><span className="font-semibold">Performance Cookies:</span> Analytics and performance tracking</li>
              <li><span className="font-semibold">Marketing Cookies:</span> Personalization and targeted advertising</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookies through your browser settings. See our Cookie Policy for more details.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><span className="font-semibold">Access:</span> Request a copy of your personal data</li>
              <li><span className="font-semibold">Correction:</span> Request corrections to inaccurate data</li>
              <li><span className="font-semibold">Deletion:</span> Request deletion of your data (right to be forgotten)</li>
              <li><span className="font-semibold">Portability:</span> Receive your data in a portable format</li>
              <li><span className="font-semibold">Opt-out:</span> Opt-out of marketing communications</li>
              <li><span className="font-semibold">Objection:</span> Object to data processing</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at privacy@beanexample.com.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">10. Third-Party Links and Services</h2>
            <p className="text-muted-foreground">
              Our website may contain links to third-party websites and services. We are not responsible for their privacy practices. 
              Please review their privacy policies before providing your information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">11. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to individuals under 13 years old. We do not knowingly collect personal information 
              from children under 13. If we become aware of such collection, we will take immediate steps to delete the information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">12. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and stored in countries other than your residence. These countries may have 
              data protection laws different from yours. By using our services, you consent to such transfers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">13. Policy Updates</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or prominent 
              notice on our website. Your continued use of our services constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
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
