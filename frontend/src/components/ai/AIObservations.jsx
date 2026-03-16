import { HiOutlineEye } from 'react-icons/hi';

const AIObservations = ({ observations }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineEye className="w-5 h-5 text-blue-500" />
        <h3 className="text-base font-semibold text-gray-900">Observations</h3>
      </div>
      <div className="space-y-3">
        {observations.map((observation, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl">
            <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
            <p className="text-sm text-gray-700 leading-relaxed">{observation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIObservations;
