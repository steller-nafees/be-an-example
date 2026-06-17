export default function ShippingPolicy() {
  const lastUpdated = "June 17, 2024";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Shipping Policy</h1>
        <p className="text-muted-foreground">
          Last updated: <span className="font-semibold">{lastUpdated}</span>
        </p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-6 py-20 max-w-4xl prose dark:prose-invert">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Shipping Methods</h2>
            <p className="text-muted-foreground mb-3">
              We offer multiple shipping options to meet your needs:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Standard Shipping (5-7 Business Days)</h3>
                <p className="text-muted-foreground">Our most economical option. Perfect if you're not in a hurry.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Express Shipping (2-3 Business Days)</h3>
                <p className="text-muted-foreground">For customers who need their items quickly.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Overnight Shipping (Next Business Day)</h3>
                <p className="text-muted-foreground">Fastest option for urgent orders.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">International Shipping</h3>
                <p className="text-muted-foreground">Available to 50+ countries with varying delivery times.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">2. Shipping Costs</h2>
            <p className="text-muted-foreground mb-3">
              Shipping costs vary based on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Order total value</li>
              <li>Destination zip code</li>
              <li>Shipping method selected</li>
              <li>Weight and dimensions of package</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All shipping costs are calculated and displayed at checkout before you complete your purchase. 
              We also offer free shipping on orders over $75 (Standard Shipping only).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">3. Processing Time</h2>
            <p className="text-muted-foreground mb-3">
              Please note that processing time is separate from shipping time:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Standard processing: 1-2 business days after order placed</li>
              <li>Expedited processing: Same day for orders placed before 12 PM EST</li>
              <li>Processing does not include weekends or holidays</li>
              <li>You'll receive a shipping confirmation email with tracking number once shipped</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">4. Delivery Times</h2>
            <p className="text-muted-foreground mb-3">
              Estimated delivery times are:
            </p>
            <table className="w-full text-sm my-4 border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="border border-border p-3 text-left font-semibold">Shipping Method</th>
                  <th className="border border-border p-3 text-left font-semibold">Domestic</th>
                  <th className="border border-border p-3 text-left font-semibold">International</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3 font-semibold">Standard</td>
                  <td className="border border-border p-3">5-7 business days</td>
                  <td className="border border-border p-3">10-21 business days</td>
                </tr>
                <tr className="bg-secondary/20">
                  <td className="border border-border p-3 font-semibold">Express</td>
                  <td className="border border-border p-3">2-3 business days</td>
                  <td className="border border-border p-3">5-7 business days</td>
                </tr>
                <tr>
                  <td className="border border-border p-3 font-semibold">Overnight</td>
                  <td className="border border-border p-3">Next business day</td>
                  <td className="border border-border p-3">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">5. Shipping Carriers</h2>
            <p className="text-muted-foreground">
              We partner with reliable carriers including FedEx, UPS, USPS, and DHL. The carrier 
              used depends on your location and selected shipping method. You'll receive tracking 
              information via email once your package ships.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">6. Order Tracking</h2>
            <p className="text-muted-foreground">
              Once your order ships, you'll receive a tracking number via email. You can use this 
              number to track your package in real-time with the carrier. You can also track your 
              order directly from your account dashboard.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">7. Package Protection</h2>
            <p className="text-muted-foreground mb-3">
              All packages are:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Carefully packaged with protective materials</li>
              <li>Fully insured for the purchase value</li>
              <li>Shipped with tracking and confirmation</li>
              <li>Signed for on high-value orders (over $500)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">8. Delivery Issues</h2>
            <p className="text-muted-foreground mb-3">
              If your package doesn't arrive as expected:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Check your tracking for updates</li>
              <li>Contact your local carrier for delivery status</li>
              <li>Contact us if the package is more than 2 days overdue</li>
              <li>We'll file a claim with the carrier if necessary</li>
              <li>Replacement or refund will be issued once resolved</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">9. Damaged or Lost Packages</h2>
            <p className="text-muted-foreground mb-3">
              If your package arrives damaged or is lost:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Report the issue within 48 hours of delivery</li>
              <li>Take photos of the damage or package condition</li>
              <li>Provide your order number and tracking number</li>
              <li>We'll file a carrier claim at no cost to you</li>
              <li>Once approved, we'll replace or refund the item</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">10. International Shipping</h2>
            <p className="text-muted-foreground mb-3">
              For international orders:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Delivery times vary by country (10-21 business days typical)</li>
              <li>Customs duties and import taxes may apply</li>
              <li>Recipient is responsible for any customs fees</li>
              <li>Tracking is available through carrier</li>
              <li>Additional restrictions may apply to certain items or countries</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">11. Restricted Locations</h2>
            <p className="text-muted-foreground mb-3">
              We currently ship to most locations worldwide, but do not ship to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Military addresses (APO/FPO) - available via special request</li>
              <li>Certain countries due to customs restrictions</li>
              <li>PO boxes (for certain shipping methods)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">12. Signature Requirements</h2>
            <p className="text-muted-foreground">
              High-value orders (over $500) require an adult signature upon delivery. 
              Your tracking will indicate if signature is required. If you're not available, 
              the carrier will leave a notice to schedule redelivery.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">13. Holiday Shipping</h2>
            <p className="text-muted-foreground">
              During holiday seasons, shipping times may be extended due to carrier volume. 
              We'll notify you if your order will experience delays. Express and Overnight 
              shipping options remain available (subject to carrier availability).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">14. Delivery Address Changes</h2>
            <p className="text-muted-foreground mb-3">
              To modify your delivery address:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Contact us immediately after placing your order</li>
              <li>Changes must be requested before shipment (typically within 1-2 hours)</li>
              <li>We'll attempt to modify your address if possible</li>
              <li>If already shipped, contact the carrier about rerouting</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">15. Shipping Liability</h2>
            <p className="text-muted-foreground">
              While we take every precaution to ensure safe delivery, Be An Example is not liable for 
              delays or issues caused by carriers or circumstances beyond our control. All deliveries 
              are insured, and claims can be filed with the carrier or Be An Example.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">16. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about shipping, please contact our support team:
            </p>
            <div className="bg-secondary/30 p-6 rounded-lg mt-4">
              <p className="font-semibold">Be An Example Inc.</p>
              <p className="text-muted-foreground">Email: shipping@beanexample.com</p>
              <p className="text-muted-foreground">Support: support@beanexample.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
