import { Link } from "react-router-dom";
import { Briefcase, Home, LogOut } from "lucide-react";

function Navbar() {
    return (
        <div className="flex justify-between items-center p-4 bg-blue-600 text-white shadow-md">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:opacity-90">
                <Briefcase className="w-6 h-6" />
                ProjectFlow
            </Link>

            <div className="flex gap-6">
                <Link to="/" className="flex items-center gap-2 hover:text-blue-100">
                    <Home className="w-5 h-5" />
                    Home
                </Link>
                <Link to="/projects" className="flex items-center gap-2 hover:text-blue-100">
                    <Briefcase className="w-5 h-5" />
                    Projects
                </Link>
                <Link to="/tasks" className="flex items-center gap-2 hover:text-blue-100">
                    Tasks
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-100">
                    Dashboard
                </Link>
                <Link to="/settings" className="flex items-center gap-2 hover:text-blue-100">
                    Settings
                </Link>
                <button className="flex items-center gap-2 hover:text-blue-100">
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;