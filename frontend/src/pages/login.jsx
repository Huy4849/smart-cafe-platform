import { useState } from "react";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        const res = await api.post("/auth/login", {
            email,
            password,
        });

        localStorage.setItem("token", res.data.token);
        alert("Login success");
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col gap-3 p-6 border rounded w-80 shadow">
                <h2 className="text-xl font-bold text-center">Login</h2>

                <input
                    className="border p-2"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="border p-2"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

export default Login;