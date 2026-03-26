import { useEffect, useState } from "react";
import api from "../services/api";

function Admin() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
    });
    // useEffect(() => {
    //     const fetchStats = async () => {
    //         try {
    //             const res = await api.get("/dashboard");
    //             setStats(res.data);
    //         } catch (err) {
    //             console.error("Dashboard error:", err);
    //         }
    //     };

    //     fetchStats();
    // }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/";
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>

            <div className="flex gap-4">
                <div className="p-4 bg-white shadow rounded w-40">
                    <p className="text-gray-500">Orders</p>
                    <h3 className="text-lg font-bold">{stats.totalOrders}</h3>
                </div>

                <div className="p-4 bg-white shadow rounded w-40">
                    <p className="text-gray-500">Revenue</p>
                    <h3 className="text-lg font-bold">{stats.revenue} VND</h3>
                </div>
            </div>
        </div>
    );
}

export default Admin;