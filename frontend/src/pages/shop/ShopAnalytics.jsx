import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingBag,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ShopAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveAnalyticsPath = () => {
      const baseUrl = (api.defaults.baseURL || '').replace(/\/+$/, '').toLowerCase();
      // If base URL is already scoped to /api/shop, request /analytics directly.
      if (baseUrl.endsWith('/api/shop')) return '/analytics';
      return '/shop/analytics';
    };

    const fetchAnalytics = async () => {
      const primaryPath = resolveAnalyticsPath();
      const fallbackPath = primaryPath === '/analytics' ? '/shop/analytics' : '/analytics';

      try {
        const res = await api.get(primaryPath);
        setAnalytics(res.data.analytics);
      } catch (err) {
        // Support environments where VITE_API_URL may include or exclude /shop.
        if (err.response?.status === 404) {
          try {
            const res = await api.get(fallbackPath);
            setAnalytics(res.data.analytics);
            return;
          } catch {
            // fall through to generic failure state
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;
  if (!analytics) return <p className="text-gray-500">Unable to load analytics.</p>;

  const chartData = analytics.mostSoldFoods?.map((item) => ({
    name: item._id?.length > 12 ? item._id.substring(0, 12) + '...' : item._id,
    sold: item.count,
  })) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Sales Dashboard</h1>
        <p className="section-subtitle">Track your shop's performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={HiOutlineCurrencyRupee} label="Total Revenue" value={`₹${analytics.totalRevenue.toFixed(2)}`} color="primary" />
        <StatCard icon={HiOutlineClipboardCheck} label="Completed Orders" value={analytics.completedOrders} color="green" />
        <StatCard icon={HiOutlineClock} label="Pending Orders" value={analytics.pendingOrders} color="accent" />
        <StatCard icon={HiOutlineShoppingBag} label="Items Sold" value={analytics.totalItemsSold} color="blue" />
        <StatCard icon={HiOutlineChartBar} label="Active Items" value={analytics.activeItems} color="purple" />
        <StatCard icon={HiOutlineStar} label="Rating" value={`${analytics.avgRating || 'N/A'} (${analytics.totalRatings})`} color="accent" />
      </div>

      {/* Most Sold Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Most Sold Items</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No sales data yet</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Inventory Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">Total Listed Items</span>
              <span className="font-bold text-gray-900">{analytics.totalItems}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <span className="text-sm text-gray-600">Active Items</span>
              <span className="font-bold text-green-700">{analytics.activeItems}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <span className="text-sm text-gray-600">Remaining Stock</span>
              <span className="font-bold text-blue-700">{analytics.remainingStock}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="font-bold text-primary-700">{analytics.totalOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pricing Insight */}
      {analytics.mostSoldFoods?.length > 0 && (
        <div className="card p-6 mt-6 border-primary-200 bg-primary-50/30">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineSparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-semibold text-gray-900">AI Pricing Insight</h3>
          </div>
          <div className="space-y-3">
            {analytics.mostSoldFoods.slice(0, 3).map((item, i) => {
              const demandTag = item.count >= 10 ? 'High' : item.count >= 3 ? 'Medium' : 'Low';
              const tagColor = demandTag === 'High' ? 'bg-green-100 text-green-700' : demandTag === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
              const discountRange = demandTag === 'High' ? '25%–35%' : demandTag === 'Medium' ? '35%–45%' : '45%–55%';
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item._id}</p>
                    <p className="text-xs text-gray-500">Suggested discount range: {discountRange}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tagColor}`}>
                    {demandTag} demand
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">Based on your recent sales data. Use AI Suggest Price when adding items for precise recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default ShopAnalytics;
