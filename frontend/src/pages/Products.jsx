import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { CartContext } from "../context.js/CartContext";

function Products() {
    const [products, setProducts] = useState([]);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products");
                setProducts(res.data);
            } catch (err) {
                console.error("Error loading products:", err);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
                <div
                    key={p.id}
                    className="border rounded-lg shadow hover:shadow-xl hover:-translate-y-1 transition p-4"
                >
                    <img
                        src="https://via.placeholder.com/150"
                        alt=""
                        className="w-full mb-3"
                    />

                    <h3 className="font-bold text-lg">{p.name}</h3>

                    <p className="text-red-500 font-semibold">{p.price} VND</p>

                    <button
                        onClick={() => addToCart(p)}
                        className="bg-blue-500 hover:bg-blue-600 transition text-white w-full mt-3 py-2 rounded"
                    >
                        Add to cart
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Products;