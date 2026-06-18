import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal.jsx";

export function Header() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="relative">
      <header className="flex justify-between items-center bg-neutral-900 p-4">
        <h1
          onClick={() => setShowModal(!showModal)}
          className="text-2xl font-bold text-white cursor-pointer select-none bg-neutral-800 px-6 py-2 rounded-xl hover:bg-neutral-700"
        >
          Molly Little
        </h1>
        <button
          onClick={handleLogout}
          className="text-white bg-rose-800 px-4 py-2 rounded-xl hover:bg-rose-700 cursor-pointer font-semibold"
        >
          Logout
        </button>
      </header>
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
}
