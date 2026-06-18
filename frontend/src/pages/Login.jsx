import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    // Simulate successful login/signup by storing a flag in localStorage
    localStorage.setItem("isAuthenticated", "true");
    navigate("/"); // Redirect to the protected home page
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-neutral-900">
      {isLogin ? (
        <form
          id="login-form"
          onSubmit={handleAuthSubmit}
          className="sm:max-w-lg sm:px-15 sm:h-auto sm:py-34 sm:rounded-2xl bg-rose-900 text-amber-50 flex flex-col p-10 w-full h-full pt-20"
        >
          <h2 className="text-2xl/tight font-bold text-olive-200">
            Welcome Back!
          </h2>
          <p className="text-lg mb-10 text-olive-300/90">
            Log back into to your account:
          </p>
          <input
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 focus-within:hover:bg-rose-950 outline-none"
            type="text"
            id="login-username"
            placeholder="username"
            required
          />
          <input
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 focus-within:hover:bg-rose-950 outline-none"
            type="password"
            id="login-password"
            placeholder="Password"
            required
          />
          <p id="login-error" className="text-red-400 text-sm mb-4 hidden">
            Invalid name or password. Please try again.
          </p>
          <button
            className="p-4 bg-rose-500 font rounded-2xl my-5 text-xl hover:bg-rose-700/50 hover:shadow-2xl cursor-pointer"
            type="submit"
          >
            Login
          </button>
          <p>
            Don't have an account?
            <a
              className="text-orange-500 pl-1"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(false);
              }}
            >
              Sign up
            </a>
          </p>
        </form>
      ) : (
        <form
          id="signup-form"
          onSubmit={handleAuthSubmit}
          className="sm:max-w-lg sm:px-15 sm:h-auto sm:py-34 sm:rounded-2xl bg-rose-900 text-amber-50 flex flex-col p-10 w-full h-full pt-20"
        >
          <h2 className="text-2xl/tight font-bold text-olive-300">Join Us!</h2>
          <p className="text-lg mb-10 text-olive-300/80">
            Create your finance account:
          </p>

          <input
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 focus-within:hover:bg-rose-950 outline-none"
            type="text"
            id="signup-email"
            placeholder="email"
            required
          />
          <input
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 focus-within:hover:bg-rose-950 outline-none"
            type="text"
            id="signup-username"
            placeholder="username"
            required
          />
          <input
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 focus-within:hover:bg-rose-950 outline-none"
            type="password"
            id="signup-password"
            placeholder="Password"
            required
          />
          <input
            className="bg-rose-950 p-2 pl-4 rounded-2xl my-1 border border-transparent hover:bg-rose-950/80 focus-within:border-rose-950 focus-within:bg-rose-950 focus-within:hover:bg-rose-950 outline-none"
            type="password"
            id="signup-confirm"
            placeholder="Confirm Password"
            required
          />
          <p id="signup-error" className="text-red-400 text-sm mb-4 hidden"></p>

          <button
            className="p-4 bg-rose-500 font rounded-2xl my-5 text-xl hover:bg-rose-700/50 hover:shadow-2xl cursor-pointer transition-all duration-200"
            type="submit"
          >
            Create Account
          </button>

          <p>
            Already have an account?
            <a
              className="text-amber-500 pl-1"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(true);
              }}
            >
              Login
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
