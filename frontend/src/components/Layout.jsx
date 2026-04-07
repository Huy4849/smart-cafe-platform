import { Outlet, Link } from 'react-router-dom';
import { Home, Coffee, Users, ShoppingCart, LogOut } from 'lucide-react';
import useStore from '../store/useStore';

export default function Layout() {
  const { logout, user } = useStore();

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="h-full px-3 py-4 flex flex-col">
          <div className="flex items-center px-2 mb-8">
            <Coffee className="w-8 h-8 text-primary" />
            <span className="ml-2 text-xl font-bold">Smart Cafe CRM</span>
          </div>
          
          <nav className="space-y-1 flex-1">
            <Link to="/dashboard" className="flex items-center px-2 py-2 text-gray-900 rounded-lg hover:bg-gray-100">
              <Home className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            <Link to="/pos" className="flex items-center px-2 py-2 text-gray-900 rounded-lg hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 mr-3" /> Point of Sale (POS)
            </Link>
            <Link to="/customers" className="flex items-center px-2 py-2 text-gray-900 rounded-lg hover:bg-gray-100">
              <Users className="w-5 h-5 mr-3" /> Customers
            </Link>
          </nav>

          <div className="mt-auto border-t pt-4">
            <div className="px-2 mb-2 text-sm font-medium text-gray-500">
              Logged in as: {user?.name || 'Admin'}
            </div>
            <button 
              onClick={logout}
              className="flex items-center w-full px-2 py-2 text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
