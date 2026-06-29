import { useState, useEffect } from "react";
import { BsFillPencilFill, BsFillXCircleFill } from "react-icons/bs";

export function Modal({ onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(""); // <-- ADDED: Track user ID for DB queries
  const [errorMsg, setErrorMsg] = useState(""); // State for error messages

  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
  });

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    const storedUserString = localStorage.getItem("user");

    if (storedUserString && storedUserString !== "undefined") {
      try {
        const storedUser = JSON.parse(storedUserString);

        setUserId(storedUser.id || "");
        setUserData({
          username: storedUser.username || "",
          name: storedUser.name || "",
          email: storedUser.email || "",
          phone: storedUser.phoneNumber || "",
        });

        if (storedUser.address) {
          setAddressData({
            street: storedUser.address.street || "",
            city: storedUser.address.city || "",
            state: storedUser.address.state || "",
            zipCode: storedUser.address.zipCode || "",
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [isEditing]); // Reruns when isEditing changes to get fresh data for the form

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const getFormattedAddress = () => {
    const { street, city, state, zipCode } = addressData;
    if (!street && !city) return "Add";
    return `${street}, ${city}, ${state} ${zipCode}`.trim();
  };

  // FIXED: Turned into an async function that communicates with MongoDB
  const handleSaveChanges = async () => {
    setErrorMsg("");

    const payload = {
      // userId parameter has been safely removed from client-side visibility!
      username: userData.username,
      name: userData.name,
      email: userData.email,
      phone: userData.phone, // This should be phoneNumber to match the backend schema
      address: {
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
      },
    };

    try {
      const response = await fetch("http://localhost:3002/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- FIXED: Automatically forwards login cookie back to system
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Dispatch a custom event to notify other components (like the Header)
        window.dispatchEvent(
          new CustomEvent("userProfileUpdated", { detail: data.user }),
        );
        setIsEditing(false);
      } else {
        setErrorMsg(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMsg("Could not connect to the server.");
    }
  };

  return (
    <>
      {/* SIDE VIEW CARD */}
      <div className="absolute w-96 bg-rose-900 p-4 rounded-2xl shadow-lg flex gap-2 flex-col mt-2 ml-2 z-40">
        <div className="flex items-center w-full pb-2 border-b border-rose-700">
          <h1 className="text-2xl text-white font-mono">Profile info</h1>
          <div className="flex gap-4 justify-end grow">
            <BsFillPencilFill
              onClick={() => setIsEditing(true)}
              className="text-white text-xl cursor-pointer hover:text-rose-300 transition-colors"
            />
            <BsFillXCircleFill
              onClick={onClose}
              className="text-white text-xl cursor-pointer hover:text-gray-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-2 text-white">
          <p className="text-lg font-thin">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Name:
            </span>{" "}
            {userData.name || "Add"}
          </p>
          <p className="text-lg font-thin">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Email:
            </span>{" "}
            {userData.email || "Add"}
          </p>
          <p className="text-lg font-thin">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Phone:
            </span>{" "}
            {userData.phone || "Add"}
          </p>
          <p className="text-lg font-thin truncate">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Address:
            </span>{" "}
            {getFormattedAddress()}
          </p>
        </div>
      </div>

      {/* CENTERED EDIT MODAL POP-UP OVERLAY */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-rose-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-rose-800 transition-colors max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white flex justify-between items-center">
              <span>Edit Profile Dashboard</span>
              <BsFillXCircleFill
                onClick={() => setIsEditing(false)}
                className="text-rose-300 text-2xl cursor-pointer hover:text-white transition-colors"
              />
            </h2>

            {/* Display Error Message */}
            {errorMsg && (
              <p className="text-red-300 bg-red-950/50 p-3 rounded-xl text-center font-semibold">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSaveChanges} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-rose-300 border-b border-rose-800 pb-2">
                    Basic Info
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-rose-200">
                      Username
                    </label>
                    <input
                      name="username"
                      value={userData.username}
                      onChange={handleUserChange}
                      className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-rose-200">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={userData.name}
                      onChange={handleUserChange}
                      className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-rose-200">
                      Email Address
                    </label>
                    <input
                      name="email"
                      value={userData.email}
                      onChange={handleUserChange}
                      className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-rose-200">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      value={userData.phone}
                      onChange={handleUserChange}
                      className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                      type="tel"
                    />
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-rose-300 border-b border-rose-800 pb-2">
                    Address
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-rose-200">
                      Street
                    </label>
                    <input
                      name="street"
                      value={addressData.street}
                      onChange={handleAddressChange}
                      className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                      type="text"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-rose-200">
                        City
                      </label>
                      <input
                        name="city"
                        value={addressData.city}
                        onChange={handleAddressChange}
                        className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-rose-200">
                        State
                      </label>
                      <input
                        name="state"
                        value={addressData.state}
                        onChange={handleAddressChange}
                        className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                        type="text"
                        placeholder="UT"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-rose-200">
                      Zip Code
                    </label>
                    <input
                      name="zipCode"
                      value={addressData.zipCode}
                      onChange={handleAddressChange}
                      className="w-full bg-rose-950/60 border border-rose-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-rose-400 transition-all outline-none"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-rose-800">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 font-bold transition-colors shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-rose-800 text-rose-200 hover:bg-rose-700 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
