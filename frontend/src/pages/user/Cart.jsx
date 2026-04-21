import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const Cart = () => {
  const { cartItems, cartShopId, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [billData, setBillData] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const formatDateTime = (value) => {
    const date = value ? new Date(value) : new Date();
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const closeBillPopup = () => {
    setBillData(null);
  };

  const handleOrder = async () => {
    if (cartItems.length === 0 || placingOrder) return;

    try {
      setPlacingOrder(true);
      const res = await api.post('/orders', {
        shopId: cartShopId,
        items: cartItems.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
        })),
      });

      const order = res.data?.order;
      if (order) {
        const computedTotal = (order.items || []).reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        );

        setBillData({
          ...order,
          createdAt: order.createdAt || new Date().toISOString(),
          totalAmount: Number(order.totalAmount ?? computedTotal),
        });
      }

      toast.success('Order placed successfully!');
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const isCartEmpty = cartItems.length === 0;
  const billSubtotal = (billData?.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <>
      {isCartEmpty ? (
        <div className="page-container">
          <div className="text-center py-20">
            <HiOutlineShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse available food and add something delicious.</p>
            <button onClick={() => navigate('/browse')} className="btn-primary gap-2">
              Browse Food <HiOutlineArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="page-container">
          <div className="mb-8">
            <h1 className="section-title">Shopping Cart</h1>
            <p className="section-subtitle">{cartCount} item{cartCount > 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="card p-5 flex items-center gap-4">
                  {item.imageURL ? (
                    <img src={item.imageURL} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <HiOutlineShoppingBag className="w-8 h-8 text-primary-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.foodName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ₹{item.discountedPrice?.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <HiOutlineMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, Math.min(item.quantity + 1, item.quantityAvailable))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-600 mt-1"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="btn-ghost text-sm text-red-500 hover:text-red-600">
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary-700">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={handleOrder} disabled={placingOrder} className="btn-primary w-full mt-6 gap-2">
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                  {!placingOrder && <HiOutlineArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  You'll pick up your order at the shop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {billData && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Bill</h3>
                <p className="text-sm text-gray-500">Your order has been placed successfully.</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Bill No.</p>
                  <p className="font-semibold text-gray-900">#{billData._id?.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date & Time</p>
                  <p className="font-semibold text-gray-900">{formatDateTime(billData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{billData.paymentStatus || 'pending'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Order Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{billData.orderStatus || 'pending'}</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl">
                {(billData.items || []).map((item, idx) => (
                  <div key={`${item.foodId || item.foodName}-${idx}`} className="px-4 py-3 flex items-center justify-between border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.foodName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(billSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Service Fee</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-700">
                    {formatCurrency(billData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={closeBillPopup} className="btn-primary w-full">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
