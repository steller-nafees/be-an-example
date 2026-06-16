import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useMyAffiliate } from "@/hooks/use-affiliate";
import StatusBadge from "@/components/admin/StatusBadge";

interface OrderRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  total: number;
  status: string;
  created_at: string;
  user_id: string | null;
}

export default function AffiliateOrders() {
  const { data: affiliate, isLoading: loadingAffiliate } = useMyAffiliate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!affiliate?.code) return;

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,email,first_name,last_name,total,status,created_at,user_id")
        .eq("affiliate_code", affiliate.code)
        .order("created_at", { ascending: false });

      if (!error) {
        setOrders((data as OrderRow[]) ?? []);
      }
      setLoading(false);
    };

    loadOrders();
  }, [affiliate?.code]);

  if (loadingAffiliate || loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">No affiliate profile.</p>
      </div>
    );
  }

  // Filter out self-referral orders (where user_id matches affiliate's user_id)
  const validOrders = orders.filter((o) => o.user_id !== affiliate.user_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Referral Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Orders placed through your affiliate code.</p>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {validOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {validOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <p className="text-foreground/80 font-medium">
                        {[order.first_name, order.last_name].filter(Boolean).join(" ") || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{order.email}</td>
                    <td className="px-5 py-3 font-medium">${Number(order.total).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        status={
                          order.status === "pending"
                            ? "pending"
                            : order.status === "shipped"
                            ? "shipped"
                            : order.status === "delivered"
                            ? "delivered"
                            : "cancelled"
                        }
                      />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground bg-muted/30 border border-muted rounded p-4">
        <p>
          <strong>Note:</strong> Orders placed by yourself using your referral code are excluded from commission calculations.
        </p>
      </div>
    </div>
  );
}
