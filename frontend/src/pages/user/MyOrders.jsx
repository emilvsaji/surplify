import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineLocationMarker, HiOutlineX } from 'react-icons/hi';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/my-orders');
      setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">My Orders</h1>
        <p className="section-subtitle">Track and manage your food orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">No orders yet</h3>
          <p className="text-sm text-gray-500 mt-1">Browse available food and place your first order.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      Order #{order._id?.slice(-6).toUpperCase()}
                    </h3>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    {order.shopName && (
                      <span className="flex items-center gap-1">
                        <HiOutlineLocationMarker className="w-4 h-4" />
                        {order.shopName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="btn-danger btn-sm gap-1"
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-4">
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {item.imageURL ? (
                          <img src={item.imageURL} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-600">{item.foodName?.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-gray-700 font-medium">
                          {item.foodName} <span className="text-gray-400">× {item.quantity}</span>
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Total</span>
                  <span className="text-lg font-bold text-primary-700">
                    ₹{order.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
