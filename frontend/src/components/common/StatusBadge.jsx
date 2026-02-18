const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'badge-yellow',
    confirmed: 'badge-blue',
    ready: 'badge-green',
    completed: 'badge-green',
    cancelled: 'badge-red',
    approved: 'badge-green',
    rejected: 'badge-red',
    paid: 'badge-green',
    active: 'badge-green',
    inactive: 'badge-gray',
  };

  return (
    <span className={styles[status] || 'badge-gray'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
