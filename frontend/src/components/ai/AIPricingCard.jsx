import {
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineX,
} from 'react-icons/hi';

const demandColors = {
  high: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-red-100 text-red-700 border-red-200',
};

const AIPricingCard = ({ recommendedPrice, discountPercent, demandLevel, reason, onApply, onDismiss }) => {
  const demandClass = demandColors[demandLevel] || demandColors.medium;

  return (
    <div className="card border-primary-200 bg-primary-50/40 p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="w-5 h-5 text-primary-600" />
          <h4 className="font-semibold text-gray-900 text-sm">AI Price Suggestion</h4>
        </div>
        <button onClick={onDismiss} className="p-1 rounded-lg hover:bg-gray-100">
          <HiOutlineX className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Recommended</p>
          <p className="text-lg font-bold text-primary-700">₹{recommendedPrice}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Discount</p>
          <p className="text-lg font-bold text-accent-600">{discountPercent}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Demand</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${demandClass}`}>
            {demandLevel === 'low' ? (
              <HiOutlineTrendingDown className="w-3 h-3" />
            ) : (
              <HiOutlineTrendingUp className="w-3 h-3" />
            )}
            {demandLevel.charAt(0).toUpperCase() + demandLevel.slice(1)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{reason}</p>

      <div className="flex gap-2">
        <button onClick={onApply} className="btn-primary btn-sm flex-1 gap-1">
          <HiOutlineSparkles className="w-3.5 h-3.5" />
          Apply Price
        </button>
        <button onClick={onDismiss} className="btn-secondary btn-sm flex-1">
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default AIPricingCard;
