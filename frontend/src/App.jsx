import { Routes, Route } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineShoppingBag,
  HiOutlinePlusCircle,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineCog,
} from 'react-icons/hi';

import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public
import Home from './pages/public/Home';
import BrowseFood from './pages/public/BrowseFood';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// User
import UserDashboard from './pages/user/UserDashboard';
import MyOrders from './pages/user/MyOrders';
import Cart from './pages/user/Cart';

// Shop Owner
import RegisterShop from './pages/shop/RegisterShop';
import ManageFood from './pages/shop/ManageFood';
import ShopOrders from './pages/shop/ShopOrders';
import ShopAnalytics from './pages/shop/ShopAnalytics';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ShopManagement from './pages/admin/ShopManagement';
import OrderOverview from './pages/admin/OrderOverview';

// Sidebar nav configs
const userLinks = [
  { path: '/dashboard', label: 'Available Food', icon: HiOutlineHome, exact: true },
  { path: '/my-orders', label: 'My Orders', icon: HiOutlineClipboardList },
  { path: '/cart', label: 'Cart', icon: HiOutlineShoppingBag },
];

const shopLinks = [
  { path: '/shop', label: 'Dashboard', icon: HiOutlineChartBar, exact: true },
  { path: '/shop/foods', label: 'Manage Food', icon: HiOutlinePlusCircle },
  { path: '/shop/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { path: '/shop/register', label: 'My Shop', icon: HiOutlineOfficeBuilding },
];

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: HiOutlineChartBar, exact: true },
  { path: '/admin/users', label: 'Users', icon: HiOutlineUserGroup },
  { path: '/admin/shops', label: 'Shops', icon: HiOutlineOfficeBuilding },
  { path: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
];

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Home /><Footer /></>} />
            <Route path="/browse" element={<><BrowseFood /><Footer /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route
              element={
                <ProtectedRoute roles={['user']}>
                  <DashboardLayout links={userLinks} />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>
            <Route
              path="/cart"
              element={
                <ProtectedRoute roles={['user']}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            {/* Shop Owner Routes */}
            <Route
              element={
                <ProtectedRoute roles={['shopowner']}>
                  <DashboardLayout links={shopLinks} />
                </ProtectedRoute>
              }
            >
              <Route path="/shop" element={<ShopAnalytics />} />
              <Route path="/shop/foods" element={<ManageFood />} />
              <Route path="/shop/orders" element={<ShopOrders />} />
              <Route path="/shop/register" element={<RegisterShop />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout links={adminLinks} />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/shops" element={<ShopManagement />} />
              <Route path="/admin/orders" element={<OrderOverview />} />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center">
                    <h1 className="text-6xl font-display font-bold text-gray-200">404</h1>
                    <p className="text-gray-500 mt-2">Page not found</p>
                    <a href="/" className="btn-primary btn-sm mt-4 inline-block">
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </CartProvider>
  );
}

export default App;
