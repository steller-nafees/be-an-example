import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OrderCard from "@/components/OrderCard";
import Invoice from "@/components/Invoice";
import InvoiceDownloadButton from "@/components/InvoiceDownload";
import { useOrder } from "@/context/OrderContext";
import type { Order } from "@/context/OrderContext";
import ModalPortal from "@/components/ModalPortal";

export default function OrderHistoryPage() {
  const { orders } = useOrder();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        {orders.length === 0 ? (
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
      {selectedOrder && (<ModalPortal>
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
      </ModalPortal>)}
    </div>
  );
}
