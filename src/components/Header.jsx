import React from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center bg-neutral-900 p-4 px-8">
      <h1 className="text-3xl font-bold text-white">Hello</h1>
      <button
        onClick={handleLogout}
        className="text-white bg-red-600 px-4 py-2 rounded-xl hover:bg-red-700 cursor-pointer font-semibold"
      >
        Logout
      </button>
    </header>
  );
}
