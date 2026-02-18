import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineClipboardCheck,
  HiOutlineSparkles,
  HiOutlineClock,
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data.analytics);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!analytics) return <p className="text-gray-500">Unable to load dashboard data.</p>;

  const ordersPie = [
    { name: 'Completed', value: analytics.completedOrders, color: '#22c55e' },
    { name: 'Pending', value: analytics.pendingOrders, color: '#f59e0b' },
    { name: 'Cancelled', value: analytics.cancelledOrders, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const topShopsData = analytics.topShops?.map((s) => ({
    name: s.shopName?.length > 10 ? s.shopName.substring(0, 10) + '...' : s.shopName,
    revenue: s.revenue,
    orders: s.orders,
  })) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiOutlineUserGroup} label="Total Users" value={analytics.totalUsers} color="blue" />
        <StatCard icon={HiOutlineOfficeBuilding} label="Active Shops" value={analytics.activeShops} color="green" />
        <StatCard icon={HiOutlineCurrencyDollar} label="Total Revenue" value={`$${analytics.totalRevenue.toFixed(2)}`} color="primary" />
        <StatCard icon={HiOutlineSparkles} label="Food Saved" value={`${analytics.totalFoodSaved} items`} color="accent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiOutlineClipboardCheck} label="Total Orders" value={analytics.totalOrders} color="purple" />
        <StatCard icon={HiOutlineShoppingBag} label="Active Items" value={analytics.activeFoodItems} color="green" />
        <StatCard icon={HiOutlineClock} label="Pending Shops" value={analytics.pendingShops} color="accent" />
        <StatCard icon={HiOutlineUserGroup} label="Shop Owners" value={analytics.totalShopOwners} color="blue" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Top Shops by Revenue</h3>
          {topShopsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topShopsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No revenue data yet</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          {ordersPie.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={ordersPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ordersPie.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No order data yet</p>
          )}
          <div className="flex justify-center gap-6 mt-2">
            {ordersPie.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Orders</h3>
        {analytics.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Shop</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">#{order._id?.slice(-6).toUpperCase()}</td>
                    <td className="py-3 text-gray-600">{order.userName || 'N/A'}</td>
                    <td className="py-3 text-gray-600">{order.shopName || 'N/A'}</td>
                    <td className="py-3 font-medium text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                    <td className="py-3"><StatusBadge status={order.orderStatus} /></td>
                    <td className="py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
