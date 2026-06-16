import { useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OrderCard from "@/components/OrderCard";
import Invoice from "@/components/Invoice";
import InvoiceDownloadButton from "@/components/InvoiceDownload";
import { useAuth } from "@/context/AuthContext";
import type { Order } from "@/context/OrderContext";
import ModalPortal from "@/components/ModalPortal";
import { supabase } from "@/lib/supabase";

interface DBOrderItem {
  id: string;
  product_id: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
}

interface DBOrderRow {
  id: string;
  formatted_id: string | null;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  shipping_method: "standard" | "express" | "overnight";
  delivery_fee: number;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  created_at: string;
  order_items: DBOrderItem[];
}

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setOrders([]);
      } else {
        setOrders(
          ((data as DBOrderRow[]) || []).map((o) => ({
            id: o.id,
            formattedId: o.formatted_id ?? `BAEO-0000`,
            customerInfo: {
              firstName: o.first_name || "",
              lastName: o.last_name || "",
              email: o.email,
              phone: o.phone || "",
              address: o.address || "",
              city: o.city || "",
              state: o.state || "",
              zip: o.zip || "",
            },
            items: (o.order_items || []).map((item) => ({
              id: item.product_id,
              name: item.name,
              price: item.price,
              image: item.image || "",
              size: item.size || "",
              quantity: item.quantity,
            })),
            shippingMethod: o.shipping_method,
            deliveryFee: o.delivery_fee,
            subtotal: o.subtotal,
            tax: o.tax,
            total: o.total,
            date: o.created_at,
            status: o.status as Order["status"],
          }))
        );
      }
      setLoading(false);
    };

    loadOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order History</h1>
          <p className="text-muted-foreground">View and manage all your orders</p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewInvoice={setSelectedOrder}
              />
            ))}
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {selectedOrder && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
                <h2 className="font-semibold text-lg">Invoice {selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-accent rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <Invoice order={selectedOrder} />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Close
                </button>
                <InvoiceDownloadButton
                  order={selectedOrder}
                  contentId="invoice-content"
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
