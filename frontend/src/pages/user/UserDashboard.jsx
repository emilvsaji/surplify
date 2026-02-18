import { useState, useEffect } from 'react';
import api from '../../services/api';
import FoodCard from '../../components/common/FoodCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { HiOutlineShoppingBag, HiOutlineSearch } from 'react-icons/hi';

const UserDashboard = () => {
  const { addToCart } = useCart();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await api.get('/foods', { params: { limit: 12 } });
      setFoods(res.data.foods);
    } catch {
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(
    (f) =>
      f.foodName.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (food) => {
    addToCart(food, food.shop?._id);
    toast.success(`${food.foodName} added to cart`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Available Food</h1>
          <p className="section-subtitle">Fresh surplus deals near you</p>
        </div>
        <div className="relative sm:w-72">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900">No food available</h3>
          <p className="text-sm text-gray-500 mt-1">Check back later for fresh deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
