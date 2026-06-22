import { useBrandSettings } from "@/context/LogoContext";

export default function RefundPolicy() {
  const lastUpdated = "June 17, 2026"; // This can be dynamically set based on actual last update time
  const { settings } = useBrandSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Refund & Returns Policy</h1>
        <p className="text-muted-foreground">
          Last updated: <span className="font-semibold">{lastUpdated}</span>
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl prose dark:prose-invert">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Satisfaction Guarantee</h2>
            <p className="text-muted-foreground">
              We stand behind every product we sell. If you're not completely satisfied with your purchase, 
              we're here to make it right. Our goal is your 100% satisfaction.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Return Window</h2>
            <p className="text-muted-foreground">
              We offer a <span className="font-semibold">30-day money-back guarantee</span> on most products. 
              The 30-day period begins from the date you receive your order, not from the date of purchase. 
              Items must be returned within this window to be eligible for a refund or exchange.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Return Conditions</h2>
            <p className="text-muted-foreground mb-3">
              To be eligible for a return, items must meet the following conditions:
            </p>
            <p className="text-muted-foreground mb-3">
              Because products are made on-demand through our fulfillment partner, Printful, please inspect your order carefully and contact us immediately if there is an issue.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Unused and in original, unused condition</li>
              <li>All original packaging and materials included</li>
              <li>All tags and labels still attached (where applicable)</li>
              <li>No signs of wear, damage, or alteration</li>
              <li>Not washed, worn, or otherwise used</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Items showing signs of use may be refused or subject to a restocking fee of up to 20%.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Non-Returnable Items</h2>
            <p className="text-muted-foreground mb-3">
              The following categories of items cannot be returned or exchanged:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Clearance or final sale items (marked as such at purchase)</li>
              <li>Undergarments or intimate items (for hygiene reasons)</li>
              <li>Made-to-order or custom products</li>
              <li>Perishable items or food products</li>
              <li>Digital products or software</li>
              <li>Gift cards or store credit</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Return Process</h2>
            <p className="text-muted-foreground mb-3">
              To initiate a return:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Log into your account or contact customer support</li>
              <li>Provide your order number and reason for return</li>
              <li>Receive return authorization and shipping label</li>
              <li>Package items securely with original materials</li>
              <li>Ship items back using the provided label</li>
              <li>Once received and inspected, refund will be processed</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Return Shipping</h2>
            <p className="text-muted-foreground">
              We provide prepaid return shipping labels for all eligible returns within the 30-day window. 
              Simply use the provided label when shipping items back to us. For non-eligible returns, 
              return shipping costs are the responsibility of the customer.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Refund Processing</h2>
            <p className="text-muted-foreground mb-3">
              Upon receipt and inspection of your returned items:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Items are inspected for condition and authenticity</li>
              <li>Refunds are processed to the original payment method</li>
              <li>Processing typically takes 5-10 business days</li>
              <li>Shipping fees are generally non-refundable</li>
              <li>Full refund includes original item cost minus any discounts applied</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Restocking Fee</h2>
            <p className="text-muted-foreground">
              Items showing signs of wear, use, or damage may be subject to a restocking fee of up to 20% 
              of the purchase price. This fee covers inspection, cleaning, and relistings costs. If applicable, 
              the fee will be deducted from your refund.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. Damaged or Defective Items</h2>
            <p className="text-muted-foreground">
              If you receive a damaged or defective item:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Report the issue within 7 days of receipt</li>
              <li>Provide photos of the damage</li>
              <li>We will replace or fully refund the item</li>
              <li>Return shipping will be covered by us</li>
              <li>No restocking fees apply</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">10. Missing Items</h2>
            <p className="text-muted-foreground">
              If your order arrives incomplete:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Report the issue within 7 days of receipt</li>
              <li>Provide your order number and list of missing items</li>
              <li>We will ship the missing items at no charge or provide a full refund</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">11. Lost or Stolen Packages</h2>
            <p className="text-muted-foreground">
              We recommend signing for high-value orders. If a package is marked as delivered but not received:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Contact us immediately with your order number</li>
              <li>We will file a claim with the carrier</li>
              <li>Refund or replacement will be issued once claim is resolved</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">12. Exchanges</h2>
            <p className="text-muted-foreground">
              You can exchange items for different sizes, colors, or products within the 30-day return window. 
              Simply specify the replacement item during the return process. If the new item costs more, 
              you'll be charged the difference. If it costs less, the credit will be applied to your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">13. Partial Returns</h2>
            <p className="text-muted-foreground">
              If you ordered multiple items and want to return only some, each item must meet the return 
              conditions independently. Items will be refunded individually based on their eligibility status.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">14. Special Orders and Pre-Orders</h2>
            <p className="text-muted-foreground">
              Special orders and pre-orders are generally non-refundable unless the item is damaged or defective 
              upon arrival. Cancellations must be requested before the item ships.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">15. Sale and Clearance Items</h2>
            <p className="text-muted-foreground">
              Sale and clearance items marked "Final Sale" are non-returnable. However, if the item is damaged 
              or defective upon receipt, we will replace it or issue a full refund.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">16. International Returns</h2>
            <p className="text-muted-foreground">
              International customers may return items, but return shipping fees are the responsibility of the customer. 
              Refunds will be issued in the original currency minus applicable fees.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">17. Exceptions and Special Cases</h2>
            <p className="text-muted-foreground">
              Be An Example reserves the right to make exceptions to this policy in cases of legitimate issues 
              or customer satisfaction concerns. Contact customer support to discuss special circumstances.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">18. Policy Updates</h2>
            <p className="text-muted-foreground">
              We reserve the right to update this return policy at any time. Changes will be effective immediately 
              upon posting to the Website. Your continued use of our services constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">19. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about returns or refunds, please contact our customer support team:
            </p>
            <div className="bg-secondary/30 p-6 rounded-lg mt-4">
              <p className="font-semibold">{settings.companyName}</p>
              <p className="text-muted-foreground">Email: {settings.supportEmail}</p>
              <p className="text-muted-foreground">Hours: {settings.weekdayHours}, {settings.weekendHours}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
