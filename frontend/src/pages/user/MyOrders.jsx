import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineLocationMarker, HiOutlineX } from 'react-icons/hi';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billOrder, setBillOrder] = useState(null);

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

  const parseOrderDate = (value) => {
    if (!value) return new Date();

    if (typeof value === 'string') {
      const hasTimezone = /([zZ]|[+\-]\d{2}:?\d{2})$/.test(value);
      if (!hasTimezone && value.includes('T')) {
        return new Date(`${value}Z`);
      }
    }

    return new Date(value);
  };

  const formatDateTime = (value) => {
    const date = parseOrderDate(value);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

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
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBillOrder(order)}
                    className="btn-secondary btn-sm"
                  >
                    View Bill
                  </button>
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

      {billOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-xl bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="px-6 py-6 text-center border-b border-dashed border-gray-300">
              <p className="text-[10px] tracking-[0.25em] text-gray-500 font-semibold">SURPLIFY BILLING</p>
              <h3 className="text-xl font-bold text-gray-900 mt-2">{billOrder.shopName || 'Partner Shop'}</h3>
              <p className="text-sm text-gray-600 mt-1">{billOrder.shopAddress || 'Shop address unavailable'}</p>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto font-mono text-[13px]">
              <div className="grid grid-cols-2 gap-3 text-sm border-b border-dashed border-gray-300 pb-4">
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Bill No</p>
                  <p className="font-semibold text-gray-900">#{billOrder._id?.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Date & Time</p>
                  <p className="font-semibold text-gray-900">{formatDateTime(billOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Payment</p>
                  <p className="font-semibold text-gray-900 capitalize">{billOrder.paymentStatus || 'pending'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Order</p>
                  <p className="font-semibold text-gray-900 capitalize">{billOrder.orderStatus || 'pending'}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Amount</span>
                </div>
                {(billOrder.items || []).map((item, idx) => (
                  <div key={`${item.foodId || item.foodName}-${idx}`} className="grid grid-cols-12 px-4 py-3 border-t border-gray-100 items-center text-gray-800">
                    <p className="col-span-6 truncate pr-2">{item.foodName}</p>
                    <p className="col-span-2 text-center">{item.quantity}</p>
                    <p className="col-span-4 text-right font-semibold">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-gray-300 flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-base">Grand Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(billOrder.totalAmount)}
                </span>
              </div>

              <p className="text-center text-xs text-gray-500 pt-2">Thank you for dining with us</p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <button onClick={() => setBillOrder(null)} className="btn-primary w-full">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
