import { format } from "date-fns";
import { Building2, Calendar, Mail, MapPin, Phone } from "lucide-react";
import { useBrandSettings, useLogo } from "@/context/LogoContext";
import BrandLogo from "@/components/BrandLogo";
import type { Order } from "@/context/OrderContext";
import { formatCurrency } from "@/lib/currency";

interface InvoiceProps {
  order: Order;
}

export default function Invoice({ order }: InvoiceProps) {
  const { logo } = useLogo();
  const { settings } = useBrandSettings();
  const shippingFeeLabel = {
    standard: "Standard Shipping",
    express: "Standard Shipping",
    overnight: "Standard Shipping",
  }[order.shippingMethod] ?? "Shipping";

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm print:shadow-none print:p-0" id="invoice-content">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            {logo ? (
              <div className="mb-2">
                <BrandLogo baseHeight={40} alt={settings.brandName} />
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-6 h-6" />
                <h1 className="text-3xl font-bold text-gray-900">{settings.brandName}</h1>
              </div>
            )}
            <p className="text-sm text-gray-600">{settings.tagline}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h2>
            <p className="text-sm text-gray-600">
              <Calendar className="w-3 h-3 inline mr-1" />
              {format(new Date(order.date), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Order & Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Order Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">ORDER INFO</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="text-gray-900 font-medium">{order.formattedId}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="text-gray-900 font-medium capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">BILL TO</h3>
          <div className="space-y-1 text-sm text-gray-900">
            <p className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
            <div className="flex items-start gap-1.5 text-gray-600">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <p>{order.customerInfo.address}</p>
                <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zip}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Mail className="w-3 h-3" />
              <p>{order.customerInfo.email}</p>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone className="w-3 h-3" />
              <p>{order.customerInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Size</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Qty</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={`${item.id}-${item.size}`} className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900">{item.name}</td>
                <td className="py-3 px-4 text-center text-gray-600">{item.size}</td>
                <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(item.price)}</td>
                <td className="py-3 px-4 text-right text-gray-900 font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="space-y-2 border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount && order.discountAmount > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Coupon{order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
                <span className="text-gray-900">- {formatCurrency(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{shippingFeeLabel}</span>
              <span className="text-gray-900">{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="text-gray-900">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Thank you for your purchase! Your order is being processed.
        </p>
        <p className="text-xs text-gray-500">
          Please keep this invoice for your records. Questions? Contact us at {settings.supportEmail}
        </p>
      </div>
    </div>
  );
}
