import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineUser, HiOutlinePhone } from 'react-icons/hi';

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.status = filter;
      const res = await api.get('/shop/orders', { params });
      setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/shop/order/status/${orderId}`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const statuses = ['', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'];
  const statusLabels = { '': 'All', pending: 'Pending', confirmed: 'Confirmed', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };

  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'ready',
    ready: 'completed',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Orders Management</h1>
        <p className="section-subtitle">View and manage incoming orders</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">No orders found</h3>
          <p className="text-sm text-gray-500 mt-1">Orders from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900">
                      #{order._id?.slice(-6).toUpperCase()}
                    </h3>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    {order.customerName && (
                      <span className="flex items-center gap-1">
                        <HiOutlineUser className="w-4 h-4" />
                        {order.customerName}
                      </span>
                    )}
                    {order.customerPhone && (
                      <span className="flex items-center gap-1">
                        <HiOutlinePhone className="w-4 h-4" />
                        {order.customerPhone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {item.foodName} × {item.quantity}
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="font-bold text-primary-700">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                  <div className="flex flex-col gap-2 lg:ml-6">
                    {nextStatus[order.orderStatus] && (
                      <button
                        onClick={() => updateStatus(order._id, nextStatus[order.orderStatus])}
                        className="btn-primary btn-sm whitespace-nowrap"
                      >
                        Mark as {nextStatus[order.orderStatus].charAt(0).toUpperCase() + nextStatus[order.orderStatus].slice(1)}
                      </button>
                    )}
                    {order.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(order._id, 'cancelled')}
                        className="btn-danger btn-sm whitespace-nowrap"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopOrders;
