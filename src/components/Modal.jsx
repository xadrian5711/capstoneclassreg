import { useState } from "react";
import { BsFillPencilFill } from "react-icons/bs";
import { BsFillXCircleFill } from "react-icons/bs";

const initialData = {
  username: "Molly55",
  email: "Mollyl@gmail.com",
  firstname: "Molly",
  lastname: "Little",
  phone: "801-372-8544",
  address: "1050 n 1735 w",
};

const ProfileField = ({
  label,
  name,
  value,
  edit,
  onChange,
  type = "text",
}) => (
  <div className="flex items-center">
    <h1 className="text-xl text-white w-28 shrink-0">{label}:</h1>
    {edit ? (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="ml-2 rounded bg-rose-900/50 p-1 text-white font-thin text-lg w-full focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    ) : (
      <p className="text-xl pl-2 text-white font-thin">{value}</p>
    )}
  </div>
);

export function Modal({ onClose }) {
  const [edit, setEdit] = useState(false);
  const [userData, setUserData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="absolute max-w-1/3 bg-rose-800 p-4 rounded-2xl shadow-lg flex gap-2 flex-col mt-2 ml-2">
      <div className="flex items-center w-full pb-2">
        <h1 className="text-2xl text-white font-mono ">Profile info</h1>
        <div className="flex gap-4 justify-end grow">
          <BsFillPencilFill
            onClick={() => setEdit(!edit)}
            className="text-white text-xl cursor-pointer hover:text-gray-200"
          />
          <BsFillXCircleFill
            onClick={onClose}
            className="text-white text-xl cursor-pointer hover:text-gray-200"
          />
        </div>
      </div>
      <ProfileField
        label="Username"
        name="username"
        value={userData.username}
        edit={edit}
        onChange={handleChange}
      />
      <ProfileField
        label="Email"
        name="email"
        value={userData.email}
        edit={edit}
        onChange={handleChange}
        type="email"
      />
      <ProfileField
        label="Firstname"
        name="firstname"
        value={userData.firstname}
        edit={edit}
        onChange={handleChange}
      />
      <ProfileField
        label="Lastname"
        name="lastname"
        value={userData.lastname}
        edit={edit}
        onChange={handleChange}
      />
      <ProfileField
        label="Phone"
        name="phone"
        value={userData.phone}
        edit={edit}
        onChange={handleChange}
        type="tel"
      />
      <ProfileField
        label="Address"
        name="address"
        value={userData.address}
        edit={edit}
        onChange={handleChange}
      />
    </div>
  );
}
