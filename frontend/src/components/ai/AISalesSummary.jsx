import { HiOutlineDocumentReport } from 'react-icons/hi';

const AISalesSummary = ({ summary }) => {
  return (
    <div className="card p-6 border-primary-200 bg-primary-50/30">
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineDocumentReport className="w-5 h-5 text-primary-600" />
        <h3 className="text-base font-semibold text-gray-900">Sales Report</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );
};

export default AISalesSummary;
