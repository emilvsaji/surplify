import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import {
  HiOutlineOfficeBuilding,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineBan,
  HiOutlineXCircle,
  HiOutlineLocationMarker,
} from 'react-icons/hi';

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchShops();
  }, [statusFilter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/shops', { params });
      setShops(res.data.shops);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const approveShop = async (shopId, status) => {
    try {
      await api.put(`/admin/approve-shop/${shopId}`, { status });
      toast.success(`Shop ${status}`);
      fetchShops();
    } catch {
      toast.error('Action failed');
    }
  };

  const toggleBlockShop = async (shopId, isBlocked) => {
    try {
      await api.put(`/admin/block-shop/${shopId}`, { isBlocked: !isBlocked });
      toast.success(isBlocked ? 'Shop unblocked' : 'Shop blocked');
      fetchShops();
    } catch {
      toast.error('Action failed');
    }
  };

  const filteredShops = shops.filter(
    (s) =>
      s.shopName?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Shop Management</h1>
        <p className="section-subtitle">Approve, manage, and monitor shops</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or city..."
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2.5 text-sm sm:w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredShops.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlineOfficeBuilding className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">No shops found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredShops.map((shop) => (
            <div key={shop._id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                    {shop.address}, {shop.city}
                  </p>
                </div>
                <StatusBadge status={shop.approvalStatus} />
              </div>

              {shop.owner && (
                <div className="p-3 bg-gray-50 rounded-lg mb-4 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-700">Owner:</span> {shop.owner.name}
                  </p>
                  <p className="text-gray-500">{shop.owner.email}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                {shop.isBlocked && <span className="badge-red">Blocked</span>}
                <span className="badge-gray">
                  Rating: {shop.avgRating || 'N/A'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                {shop.approvalStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => approveShop(shop._id, 'approved')}
                      className="btn-primary btn-sm text-xs gap-1 flex-1"
                    >
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => approveShop(shop._id, 'rejected')}
                      className="btn-danger btn-sm text-xs gap-1 flex-1"
                    >
                      <HiOutlineXCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {shop.approvalStatus === 'approved' && (
                  <button
                    onClick={() => toggleBlockShop(shop._id, shop.isBlocked)}
                    className={`btn-sm text-xs gap-1 flex-1 ${shop.isBlocked ? 'btn-primary' : 'btn-danger'}`}
                  >
                    {shop.isBlocked ? (
                      <><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Unblock</>
                    ) : (
                      <><HiOutlineBan className="w-3.5 h-3.5" /> Block</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
