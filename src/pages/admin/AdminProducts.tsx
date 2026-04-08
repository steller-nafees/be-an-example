import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Eye, EyeOff, X, Upload } from "lucide-react";
import { products, Product } from "@/lib/products";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminProducts() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white/90">Products</h1>
          <p className="text-sm text-white/40 mt-0.5">{products.length} products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-md hover:bg-white/90 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-md overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`p-2 transition-colors ${view === "table" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === "table" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Product</th>
                  <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Stock</th>
                  <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-9 h-9 rounded object-cover" />
                        <span className="text-sm font-medium text-white/80">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50 capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-white/70 font-medium">${product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= 5 ? "text-amber-400" : "text-white/60"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.stock > 0 ? "published" : "draft"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden group hover:border-white/[0.12] transition-colors"
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white/80 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-white/60 font-medium">${product.price}</span>
                  <span className={`text-xs ${product.stock <= 5 ? "text-amber-400" : "text-white/40"}`}>
                    {product.stock} in stock
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] md:max-h-[85vh] bg-[hsl(0,0%,8%)] border border-white/[0.08] rounded-lg z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h2 className="text-base font-bold text-white/90">Add Product</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-white/[0.08] rounded-lg p-8 flex flex-col items-center gap-3 hover:border-white/[0.16] transition-colors cursor-pointer">
                  <Upload size={24} className="text-white/20" />
                  <p className="text-sm text-white/40">Drop images here or click to upload</p>
                  <p className="text-xs text-white/20">PNG, JPG up to 5MB</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Product Name</label>
                    <input type="text" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="e.g. Noir Essentials Hoodie" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea rows={3} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-none" placeholder="Product description…" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Price</label>
                      <input type="number" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="$0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Category</label>
                      <select className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none">
                        <option value="hoodies">Hoodies</option>
                        <option value="tshirts">T-Shirts</option>
                        <option value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Stock</label>
                      <input type="number" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Visibility</label>
                      <div className="flex items-center gap-3 h-10">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/[0.12] rounded-md text-xs font-medium text-white/80">
                          <Eye size={12} /> Published
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-white/[0.06] rounded-md text-xs font-medium text-white/30 hover:text-white/50 transition-colors">
                          <EyeOff size={12} /> Draft
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <button key={size} className="px-3 py-1.5 text-xs font-medium border border-white/[0.08] rounded-md text-white/40 hover:text-white hover:border-white/20 transition-colors">
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-white text-black text-sm font-semibold rounded-md hover:bg-white/90 transition-colors">
                  Save Product
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
