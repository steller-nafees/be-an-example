import { useBrandSettings } from "@/context/LogoContext";

export default function TermsPage() {
  const lastUpdated = "June 17, 2024";
  const { settings } = useBrandSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: <span className="font-semibold">{lastUpdated}</span>
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl prose dark:prose-invert">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Be An Example (the "Website" or "Service"), you accept and agree to be bound by 
              and abide by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-3">
              Be An Example grants you a limited license to access and use the Website and Services for personal, 
              non-commercial purposes. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Modify or copy material on the Website</li>
              <li>Use material for commercial purposes or any public display</li>
              <li>Attempt to decompile or reverse engineer software on the Website</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the material to another person or "mirror" it on another server</li>
              <li>Engage in automated data collection or scraping</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The material on Be An Example is provided on an "as is" basis. Be An Example makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Limitations of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall Be An Example or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use the materials on Be An Example, even if Be An Example or an authorized representative has been 
              notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground">
              The material appearing on Be An Example could include technical, typographical, or photographic errors. 
              Be An Example does not warrant that any of the materials on its Website are accurate, complete, or current. 
              Be An Example may make changes to the materials contained on its Website at any time without notice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Links</h2>
            <p className="text-muted-foreground">
              Be An Example has not reviewed all of the sites linked to its Website and is not responsible for the 
              contents of any such linked site. The inclusion of any link does not imply endorsement by Be An Example 
              of the site. Use of any such linked website is at the user's own risk.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Modifications</h2>
            <p className="text-muted-foreground">
              Be An Example may revise these terms of service for its Website at any time without notice. By using this 
              Website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with the laws of the United States, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. User Accounts</h2>
            <p className="text-muted-foreground mb-3">
              When you create an account on Be An Example, you are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>Accepting responsibility for all activities under your account</li>
              <li>Providing accurate and complete registration information</li>
              <li>Updating your information to keep it accurate and current</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">10. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-3">
              You agree not to engage in any of the following prohibited conduct:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Harassing, threatening, or abusing other users</li>
              <li>Using offensive, abusive, or defamatory language</li>
              <li>Posting spam or unsolicited promotional content</li>
              <li>Attempting to gain unauthorized access to systems</li>
              <li>Posting content that violates intellectual property rights</li>
              <li>Engaging in fraudulent or illegal activities</li>
              <li>Transmitting viruses or malicious code</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">11. Intellectual Property Rights</h2>
            <p className="text-muted-foreground">
              All content on Be An Example, including text, graphics, logos, images, and software, is the property of 
              Be An Example or its content suppliers and is protected by international copyright laws. Unauthorized 
              reproduction or distribution is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">12. User-Generated Content</h2>
            <p className="text-muted-foreground">
              By submitting content (reviews, comments, images) to Be An Example, you grant us a worldwide, royalty-free 
              license to use, reproduce, modify, and distribute your content. You represent that you own or have rights 
              to the submitted content.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">13. Product Availability</h2>
            <p className="text-muted-foreground">
              Be An Example reserves the right to limit quantities, discontinue products, and restrict purchases to 
              authorized customers. We reserve the right to refuse or cancel any order at our sole discretion.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">14. Order Acceptance</h2>
            <p className="text-muted-foreground">
              All orders are subject to acceptance and confirmation by Be An Example. We reserve the right to refuse 
              any order. Prices are subject to change without notice. Tax and shipping charges will be added to your order.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">15. Termination</h2>
            <p className="text-muted-foreground">
              Be An Example may terminate or suspend your account and access to the Website immediately, without prior 
              notice or liability, if you breach any terms of this agreement or engage in prohibited activities.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">16. Dispute Resolution</h2>
            <p className="text-muted-foreground mb-3">
              Any disputes arising from the use of Be An Example shall be resolved through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Good faith negotiation between parties</li>
              <li>Binding arbitration in accordance with applicable laws</li>
              <li>Litigation in courts of competent jurisdiction</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">17. Limitation Period</h2>
            <p className="text-muted-foreground">
              You agree that regardless of any statute or law to the contrary, any claim or cause of action arising 
              out of or related to the use of Be An Example must be filed within one (1) year after such claim arose 
              or be forever barred.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">18. Entire Agreement</h2>
            <p className="text-muted-foreground">
              These terms of service constitute the entire agreement between you and Be An Example regarding the use 
              of the Website and supersede all prior negotiations, representations, or agreements related to this subject matter.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">19. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall 
              continue in full force and effect.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">20. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-secondary/30 p-6 rounded-lg mt-4">
              <p className="font-semibold">{settings.companyName}</p>
              <p className="text-muted-foreground">Email: {settings.legalEmail}</p>
              <p className="text-muted-foreground">Support: {settings.supportEmail}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
