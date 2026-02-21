import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { ADD_PRODUCT_TO_CART } from '@/queries/product';
import { useCartStore } from '@/stores/cartStore';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

interface OrderLine {
  id: string;
  sku: string;
  quantity: number;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function QuickOrderPage() {
  const navigate = useNavigate();
  const { cartId, initCart, fetchCart } = useCartStore();
  const [lines, setLines] = useState<OrderLine[]>([
    { id: generateId(), sku: '', quantity: 1 },
  ]);

  const addToCartMutation = useMutation({
    mutationFn: async (items: { sku: string; quantity: number }[]) => {
      let currentCartId = cartId;
      if (!currentCartId) {
        await initCart();
        currentCartId = useCartStore.getState().cartId;
      }
      return gqlClient.request(ADD_PRODUCT_TO_CART, {
        cartId: currentCartId,
        cartItems: items,
      });
    },
    onSuccess: () => {
      fetchCart();
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
      navigate('/cart');
    },
    onError: (err: any) => {
      const msg = err?.response?.errors?.[0]?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại SKU.';
      toast.error(msg);
    },
  });

  const addLine = () => {
    setLines((prev) => [...prev, { id: generateId(), sku: '', quantity: 1 }]);
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: 'sku' | 'quantity', value: string | number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.sku.trim() && l.quantity > 0);
    if (validLines.length === 0) {
      toast.error('Vui lòng nhập ít nhất một SKU');
      return;
    }
    addToCartMutation.mutate(
      validLines.map((l) => ({ sku: l.sku.trim(), quantity: l.quantity }))
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Helmet>
        <title>Đặt hàng nhanh | MM Mega Market</title>
        <meta name="description" content="Đặt hàng nhanh theo mã SKU tại MM Mega Market" />
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng nhanh</h1>
      <p className="text-sm text-gray-500 mb-6">
        Nhập mã SKU sản phẩm và số lượng để thêm nhanh vào giỏ hàng.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_40px] gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
            <span>Mã SKU</span>
            <span>Số lượng</span>
            <span />
          </div>

          {/* Lines */}
          <div className="divide-y divide-gray-100">
            {lines.map((line, index) => (
              <div key={line.id} className="grid grid-cols-[1fr_100px_40px] gap-3 px-4 py-3 items-center">
                <input
                  type="text"
                  value={line.sku}
                  onChange={(e) => updateLine(line.id, 'sku', e.target.value)}
                  placeholder={`SKU sản phẩm ${index + 1}`}
                  className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#0272BA]"
                />
                <input
                  type="number"
                  value={line.quantity}
                  min={1}
                  onChange={(e) => updateLine(line.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#0272BA] text-center"
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} />
            Thêm dòng
          </button>
          <button
            type="submit"
            disabled={addToCartMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-[#006341] text-white py-2 rounded-lg font-medium hover:bg-[#004d32] disabled:opacity-50 transition-colors"
          >
            <ShoppingCart size={16} />
            {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}
