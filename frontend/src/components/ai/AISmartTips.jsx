import { HiOutlineLightBulb } from 'react-icons/hi';

const AISmartTips = ({ tips }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineLightBulb className="w-5 h-5 text-accent-500" />
        <h3 className="text-base font-semibold text-gray-900">Smart Tips</h3>
      </div>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-accent-50/50 rounded-xl">
            <span className="flex-shrink-0 w-6 h-6 bg-accent-100 text-accent-700 rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISmartTips;
