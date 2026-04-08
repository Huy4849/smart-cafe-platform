import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import { Toaster } from 'react-hot-toast';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import Reporting from "./pages/Reporting";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import useStore from "./store/useStore";

// Protect Route wrapper
const ProtectedRoute = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* CRM Layout with Protection */}
        <Route element={<ProtectedRoute />}>
          {/* Main App Switcher (Home) has no sidebar layout */}
          <Route path="/" element={<Home />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reporting" element={<Reporting />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;