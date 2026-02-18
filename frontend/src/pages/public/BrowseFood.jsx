import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineAdjustments } from 'react-icons/hi';
import api from '../../services/api';
import FoodCard from '../../components/common/FoodCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const BrowseFood = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (city) params.city = city;
      const res = await api.get('/foods', { params });
      setFoods(res.data.foods);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFoods();
  };

  const handleAddToCart = (food) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    if (user.role !== 'user') {
      toast.error('Only customers can place orders');
      return;
    }
    addToCart(food, food.shop?._id);
    toast.success(`${food.foodName} added to cart`);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Browse Surplus Food</h1>
        <p className="section-subtitle">
          Discover great deals on quality food from local restaurants and cafes.
        </p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for food..."
              className="input-field pl-12"
            />
          </div>
          <div className="relative sm:w-48">
            <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="input-field pl-12"
            />
          </div>
          <button type="submit" className="btn-primary">
            <HiOutlineSearch className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Finding delicious deals..." />
      ) : foods.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineSearch className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No food items found</h3>
          <p className="text-gray-500">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{foods.length} items available</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary btn-sm"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseFood;
