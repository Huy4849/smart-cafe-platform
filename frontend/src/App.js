import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context.js/CartContext";

import Login from "./pages/login";
import Products from "./pages/Products";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";

import Navbar from "./components/Navbar";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;