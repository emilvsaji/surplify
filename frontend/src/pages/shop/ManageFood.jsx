import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineSparkles,
} from 'react-icons/hi';
import AIPricingCard from '../../components/ai/AIPricingCard';

const ManageFood = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shopInfo, setShopInfo] = useState({ missing: false, approvalStatus: null, isBlocked: false });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const emptyForm = {
    foodName: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    quantityAvailable: '',
    pickupStartTime: '',
    pickupEndTime: '',
    imageURL: '',
    category: 'other',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchShopInfo(), fetchFoods()]);
    setLoading(false);
  };

  const fetchFoods = async () => {
    try {
      const res = await api.get('/shop/foods');
      setFoods(res.data.foods || []);
      if (res.data.shopMissing) {
        setShopInfo((prev) => ({ ...prev, missing: true }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to load food items');
    }
  };

  const fetchShopInfo = async () => {
    try {
      const res = await api.get('/shop/my-shop');
      setShopInfo({
        missing: false,
        approvalStatus: res.data.shop?.approvalStatus || null,
        isBlocked: Boolean(res.data.shop?.isBlocked),
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setShopInfo({ missing: true, approvalStatus: null, isBlocked: false });
      } else {
        toast.error(err.response?.data?.message || 'Could not fetch shop details');
      }
    }
  };

  const openAdd = () => {
    if (shopInfo.missing) {
      toast.error('Register your shop before adding items');
      return;
    }
    if (shopInfo.approvalStatus && shopInfo.approvalStatus !== 'approved') {
      toast.error('Your shop is not approved yet');
      return;
    }
    if (shopInfo.isBlocked) {
      toast.error('Your shop is blocked');
      return;
    }
    setEditingFood(null);
    setForm(emptyForm);
    setAiResult(null);
    setShowModal(true);
  };

  const openEdit = (food) => {
    setEditingFood(food);
    setForm({
      foodName: food.foodName,
      description: food.description || '',
      originalPrice: food.originalPrice,
      discountedPrice: food.discountedPrice,
      quantityAvailable: food.quantityAvailable,
      pickupStartTime: food.pickupStartTime || '',
      pickupEndTime: food.pickupEndTime || '',
      imageURL: food.imageURL || '',
      category: food.category || 'other',
    });
    setAiResult(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (shopInfo.missing) {
        toast.error('Please register your shop before adding items');
        return;
      }
      if (shopInfo.isBlocked) {
        toast.error('Your shop is blocked');
        return;
      }
      if (shopInfo.approvalStatus && shopInfo.approvalStatus !== 'approved') {
        toast.error('Your shop is not approved yet');
        return;
      }

      if (editingFood) {
        await api.put(`/shop/food/${editingFood._id}`, form);
        toast.success('Food item updated');
      } else {
        await api.post('/shop/food/add', form);
        toast.success('Food item added');
      }
      setShowModal(false);
      fetchFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await api.delete(`/shop/food/${id}`);
      toast.success('Food item deleted');
      fetchFoods();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (food) => {
    try {
      await api.put(`/shop/food/${food._id}`, { isActive: !food.isActive });
      toast.success(food.isActive ? 'Item deactivated' : 'Item activated');
      fetchFoods();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleAiSuggest = async () => {
    if (!form.foodName || !form.originalPrice || !form.quantityAvailable) {
      toast.error('Fill in food name, original price and quantity first');
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await api.post('/shop/ai/recommend-price', {
        foodName: form.foodName,
        originalPrice: parseFloat(form.originalPrice),
        quantityAvailable: parseInt(form.quantityAvailable),
        expiryTime: form.pickupEndTime || '',
        category: form.category,
      });
      setAiResult(res.data.data || res.data);
      toast.success('AI recommendation ready');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI pricing failed');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiPrice = () => {
    if (aiResult?.recommendedPrice) {
      setForm((prev) => ({ ...prev, discountedPrice: String(aiResult.recommendedPrice) }));
      setAiResult(null);
      toast.success('AI price applied');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (shopInfo.missing) {
    return (
      <div className="card p-10 text-center">
        <h1 className="section-title mb-2">No shop found</h1>
        <p className="section-subtitle mb-6">Register your shop to add and manage food items.</p>
        <a href="/shop/register" className="btn-primary">Go to Shop Registration</a>
      </div>
    );
  }

  const shopRestricted = shopInfo.isBlocked || (shopInfo.approvalStatus && shopInfo.approvalStatus !== 'approved');
  const restrictionMessage = shopInfo.isBlocked
    ? 'Your shop is blocked. Contact support to resolve this.'
    : shopInfo.approvalStatus && shopInfo.approvalStatus !== 'approved'
      ? 'Your shop is pending approval. You can view items but cannot add new ones yet.'
      : '';

  return (
    <div>
      {shopRestricted && (
        <div className="card bg-amber-50 border border-amber-200 text-amber-800 mb-4">
          {restrictionMessage}
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Manage Food Items</h1>
          <p className="section-subtitle">{foods.length} item{foods.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button onClick={openAdd} disabled={shopRestricted} className={`btn-primary gap-2 ${shopRestricted ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <HiOutlinePlusCircle className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {foods.length === 0 ? (
        <div className="card p-12 text-center">
          <HiOutlinePhotograph className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-1">No food items yet</h3>
          <p className="text-sm text-gray-500 mb-4">Start by adding your first surplus food item.</p>
          <button onClick={openAdd} disabled={shopRestricted} className={`btn-primary btn-sm gap-1 ${shopRestricted ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <HiOutlinePlusCircle className="w-4 h-4" />
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {foods.map((food) => (
            <div key={food._id} className="card overflow-hidden">
              <div className="h-36 bg-gray-100 relative">
                {food.imageURL ? (
                  <img src={food.imageURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                    <HiOutlinePhotograph className="w-10 h-10 text-primary-200" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${food.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {food.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{food.foodName}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-primary-700">₹{food.discountedPrice?.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through">₹{food.originalPrice?.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Stock: {food.quantityAvailable}</p>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(food)} className="btn-ghost btn-sm text-xs flex-1 gap-1">
                    <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => toggleActive(food)} className="btn-ghost btn-sm text-xs flex-1">
                    {food.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(food._id)} className="btn-ghost btn-sm text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingFood ? 'Edit Food Item' : 'Add Food Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Name *</label>
                <input
                  type="text" required value={form.foodName}
                  onChange={(e) => setForm({ ...form, foodName: e.target.value })}
                  className="input-field" placeholder="e.g. Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field" rows={2} placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price *</label>
                  <input
                    type="number" step="0.01" required value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="input-field" placeholder="10.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price *</label>
                  <input
                    type="number" step="0.01" required value={form.discountedPrice}
                    onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                    className="input-field" placeholder="5.00"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={aiLoading}
                className="btn-accent btn-sm gap-1.5 w-full"
              >
                <HiOutlineSparkles className="w-4 h-4" />
                {aiLoading ? 'Getting AI Suggestion...' : 'AI Suggest Price'}
              </button>

              {aiResult && (
                <AIPricingCard
                  recommendedPrice={aiResult.recommendedPrice}
                  discountPercent={aiResult.discountPercent}
                  demandLevel={aiResult.demandLevel}
                  reason={aiResult.reason}
                  onApply={applyAiPrice}
                  onDismiss={() => setAiResult(null)}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
                <input
                  type="number" required value={form.quantityAvailable}
                  onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
                  className="input-field" placeholder="10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Start</label>
                  <input
                    type="time" value={form.pickupStartTime}
                    onChange={(e) => setForm({ ...form, pickupStartTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup End</label>
                  <input
                    type="time" value={form.pickupEndTime}
                    onChange={(e) => setForm({ ...form, pickupEndTime: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url" value={form.imageURL}
                  onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
                  className="input-field" placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  <option value="meals">Meals</option>
                  <option value="bakery">Bakery</option>
                  <option value="drinks">Drinks</option>
                  <option value="desserts">Desserts</option>
                  <option value="snacks">Snacks</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Saving...' : editingFood ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFood;
