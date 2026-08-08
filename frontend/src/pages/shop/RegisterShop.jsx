import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

const RegisterShop = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ shopName: '', address: '', city: '' });

  useEffect(() => {
    checkExistingShop();
  }, []);

  const checkExistingShop = async () => {
    try {
      const res = await api.get('/shop/my-shop');
      setShop(res.data.shop);
    } catch {
      // No shop yet
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/shop/register', form);
      setShop(res.data.shop);
      toast.success('Shop registration submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (shop) {
    const statusConfig = {
      pending: {
        icon: HiOutlineClock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        msg: 'Your shop registration is pending admin approval.',
      },
      approved: {
        icon: HiOutlineCheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        msg: 'Your shop is approved! You can start adding food items.',
      },
      rejected: {
        icon: HiOutlineExclamationCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        msg: 'Your shop registration was rejected. Please contact support.',
      },
    };

    const s = statusConfig[shop.approvalStatus] || statusConfig.pending;

    return (
      <div>
        <h1 className="section-title mb-6">My Shop</h1>
        <div className={`card p-6 ${s.bg} border ${s.border} mb-6`}>
          <div className="flex items-center gap-3">
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <p className={`font-medium ${s.color}`}>{s.msg}</p>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{shop.shopName}</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <HiOutlineLocationMarker className="w-4 h-4" />
              {shop.address}, {shop.city}
            </p>
            <p>Rating: {shop.avgRating || 'N/A'} ({shop.totalRatings || 0} reviews)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title mb-2">Register Your Shop</h1>
      <p className="section-subtitle mb-8">Fill in your shop details to get started on Surplify.</p>

      <div className="card p-8 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
            <div className="relative">
              <HiOutlineOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                placeholder="e.g. Fresh Bites Cafe"
                className="input-field pl-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main Street"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <div className="relative">
              <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="New York"
                className="input-field pl-12"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterShop;
