const StatCard = ({ icon: Icon, label, value, trend, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
  };

  const bgColors = {
    primary: 'bg-primary-50',
    accent: 'bg-accent-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    red: 'bg-red-50',
    green: 'bg-green-50',
  };

  const iconColors = {
    primary: 'text-primary-600',
    accent: 'text-accent-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    green: 'text-green-600',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`} from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${bgColors[color]} p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColors[color]}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
