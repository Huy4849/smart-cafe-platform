import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import { Toaster } from 'react-hot-toast';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Customers from "./pages/Customers";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Projects from "./pages/Projects";
import Login from "./pages/login";
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

        {/* Cấu trúc Layout SmartCRM với bảo mật đăng nhập */}
        <Route element={<ProtectedRoute />}>
          {/* Trang chọn ứng dụng (Home) không dùng sidebar */}
          <Route path="/" element={<Home />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/thuong-vu" element={<Navigate to="/pipeline" replace />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
