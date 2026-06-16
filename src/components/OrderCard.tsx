import { format } from "date-fns";
import { ChevronRight, Eye } from "lucide-react";
import type { Order } from "@/context/OrderContext";

interface OrderCardProps {
  order: Order;
  onViewInvoice: (order: Order) => void;
}

export default function OrderCard({ order, onViewInvoice }: OrderCardProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{order.formattedId}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.date), "MMM dd, yyyy 'at' hh:mm a")}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="mb-4 pb-4 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Items</p>
            <p className="font-semibold text-foreground">{order.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="font-semibold text-foreground">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewInvoice(order)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View Invoice
        </button>
        <button className="flex items-center justify-center px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
