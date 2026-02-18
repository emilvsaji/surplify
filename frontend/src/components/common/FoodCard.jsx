import { HiOutlineShoppingBag, HiOutlineClock, HiOutlineLocationMarker, HiOutlineStar } from 'react-icons/hi';

const FoodCard = ({ food, onAddToCart, showCartBtn = true }) => {
  const discount = Math.round(
    ((food.originalPrice - food.discountedPrice) / food.originalPrice) * 100
  );

  return (
    <div className="card overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {food.imageURL ? (
          <img
            src={food.imageURL}
            alt={food.foodName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
            <HiOutlineShoppingBag className="w-12 h-12 text-primary-300" />
          </div>
        )}
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              {discount}% OFF
            </span>
          </div>
        )}
        {/* Quantity Badge */}
        {food.quantityAvailable <= 3 && food.quantityAvailable > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              Only {food.quantityAvailable} left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Shop info */}
        {food.shop && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <HiOutlineLocationMarker className="w-3.5 h-3.5" />
            <span className="truncate">{food.shop.shopName}</span>
          </div>
        )}

        {/* Food name */}
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
          {food.foodName}
        </h3>

        {food.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{food.description}</p>
        )}

        {/* Pickup Time */}
        {food.pickupStartTime && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <HiOutlineClock className="w-3.5 h-3.5" />
            <span>
              Pickup: {food.pickupStartTime} – {food.pickupEndTime}
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-primary-700">₹{food.discountedPrice?.toFixed(2)}</span>
            {food.originalPrice > food.discountedPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">₹{food.originalPrice?.toFixed(2)}</span>
            )}
          </div>
          {showCartBtn && food.quantityAvailable > 0 && onAddToCart && (
            <button
              onClick={() => onAddToCart(food)}
              className="btn-primary btn-sm text-xs"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
