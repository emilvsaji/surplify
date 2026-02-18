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
} from 'react-icons/hi';

const Cart = () => {
  const { cartItems, cartShopId, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      await api.post('/orders', {
        shopId: cartShopId,
        items: cartItems.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
        })),
      });
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    }
  };

  if (cartItems.length === 0) {
    return (
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
    );
  }

  return (
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

            <button onClick={handleOrder} className="btn-primary w-full mt-6 gap-2">
              Place Order
              <HiOutlineArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              You'll pick up your order at the shop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
