import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";

// Login và placeholder componens
const Login = () => <div className="p-10"><h1>Login Page (Will setup later)</h1><a href="/dashboard" className="text-blue-500 underline">Go Dashboard</a></div>;
const POS = () => <div className="p-10"><h1>POS Page (Point of Sale)</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* CRM Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/pos" element={<POS />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;