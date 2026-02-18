import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = ({ links }) => {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <DashboardSidebar links={links} />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
