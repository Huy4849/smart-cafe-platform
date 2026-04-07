import { Link } from "react-router-dom";

function Navbar() {
    return (
        <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Smart Cafe</h1>

            <div className="flex gap-4">
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/admin">Admin</Link>
            </div>
        </div>
    );
}

export default Navbar;