import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen mt-10 bg-base-100 flex flex-col lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3">
              <MessageSquare className="size-10 text-primary" />
              <h1 className="text-3xl font-extrabold text-primary">
                MLink
              </h1>
              <h2 className="text-2xl font-bold mt-2">Welcome Back</h2>
              <p className="text-base-content/60">
                Sign in to your account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="size-5 text-gray-500 absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full pl-10 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="size-5 text-gray-500 absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered placeholder:text-gray-500  w-full pl-10 pr-12 focus:outline-none focus:ring-0"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-base-content/60">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="link link-primary font-medium"
              >
                Create account
              </Link>
            </p>

            {/* Optional credit – only shows on small screens, same as sign‑up */}
            <p className="text-sm lg:hidden text-base-content/40 mt-6">
              Developed by <strong className="italic text-base-content/70">Ahmad Imran</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ----------- RIGHT – BRANDING / IMAGE ----------- */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary/5 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AuthImagePattern
            title="Welcome back!"
            subtitle="Sign in to continue your conversations and catch up with your messages."
          />
          <p className="text-sm text-base-content/40">
          Developed by <strong className="italic text-base-content/70">Ahmad Imran</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
