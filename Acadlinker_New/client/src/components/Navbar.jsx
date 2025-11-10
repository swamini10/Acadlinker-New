import React from "react";
import { Link } from "react-router-dom";
import { Home, Bell, User, LogOut, Users, PlusCircle, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";

const Navbar = ({ unreadNotifications = 0 }) => {
  const { logout, currentUser } = useAuth();

  if (!currentUser) return null;

  return (
   <nav className="bg-gray-900 text-white px-4 h-16 flex items-center justify-between shadow-md mb-1">
      {/* Brand */}
      <div className="flex items-center space-x-2 text-xl font-bold text-white">
        <Link to="/" className="text-2xl">Acadlinker</Link>
      </div>

    {/* 2. Add the SearchBar component */}
      <SearchBar />

      {/* Links */}
      <ul className="flex items-center space-x-4">
        <li>
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li>
          <Link to={`/profile/${currentUser.id}`} className="hover:text-gray-300">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/friends" className="hover:text-gray-300">
            Friends
          </Link>
        </li>
        <li>
          <Link to="/groups" className="hover:text-gray-300">
            Groups
          </Link>
        </li>
        <li>
          <Link to="/create-post" className="hover:text-gray-300">
            Chat
          </Link>
        </li>
        <li className="relative">
          <Link to="/notifications" className="hover:text-gray-300 flex items-center">
            <Bell className="w-5 h-5 mr-1" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-xs w-4 h-4 flex items-center justify-center rounded-full text-white">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </li>
        <li>
          <button
            onClick={logout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
