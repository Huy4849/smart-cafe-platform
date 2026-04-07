import { useContext } from "react";
import { CartContext } from "../context.js/CartContext";
import api from "../services/api";

function Cart() {
    const { cart, removeItem } = useContext(CartContext);

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const checkout = async () => {
        const items = cart.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
        }));

        await api.post("/orders", { items });

        alert("Order success");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Cart</h2>

            {cart.map((item) => (
                <div
                    key={item.id}
                    className="flex justify-between border p-3 mb-2"
                >
                    <span>
                        {item.name} x {item.quantity}
                    </span>

                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500"
                    >
                        Remove
                    </button>
                </div>
            ))}

            <h3 className="mt-4 font-bold">Total: {total} VND</h3>

            <button
                onClick={checkout}
                className="bg-green-500 text-white px-4 py-2 mt-4"
            >
                Checkout
            </button>
        </div>
    );
}

export default Cart;