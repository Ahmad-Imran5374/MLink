import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import SignUp from "./pages/SignUp";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

function App() {
  const { authUser, isCheckingAuth, checkAuth,onlineUsers } = useAuthStore();
  const location = useLocation();
  const isHome = location.pathname==="/" || location.pathname==="/settings" || location.pathname==="/profile"
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // console.log(onlineUsers); 

  const{theme}=useThemeStore();

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <Loader className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="min-h-screen bg-base-200">
      <Navbar />

      <main className={isHome ? "" :"lg:mt-15"}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={<SettingPage />} />
          <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
