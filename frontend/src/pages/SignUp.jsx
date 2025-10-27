import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen mt-10 bg-base-100 flex flex-col lg:grid lg:grid-cols-2">
      {/* Form – left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3">
              <MessageSquare className="size-10 text-primary" />
              <h1 className="text-3xl font-extrabold text-primary">MLink</h1>
              <h2 className="text-2xl font-bold mt-2">Create Account</h2>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <User className="size-5 text-gray-500 absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full pl-10 placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="size-5 text-gray-500 absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered placeholder:text-gray-500 w-full pl-10 focus:outline-none focus:ring-0"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="size-5 text-gray-500 absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input placeholder:text-gray-500 input-bordered w-full pl-10 pr-12 focus:outline-none focus:ring-0"
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

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium">
                Sign in
              </Link>
            </p>

            <p className="text-sm lg:hidden text-base-content/40 mt-6">
              Developed by{" "}
              <strong className="text-base-content/90 italic">
                Ahmad Imran
              </strong>{" "}
            </p>
          </div>
        </div>
      </div>

      {/* Branding – right side */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary/5 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* <MessageSquare className="size-10 text-primary" />
        <h1 className="text-5xl font-extrabold text-primary">MLink</h1> */}
          <AuthImagePattern
            title="Join our community"
            subtitle="Connect, chat and collaborate instantly. Your community starts here."
          />
          <p className="text-sm text-base-content/40">
            Developed by{" "}
            <strong className="text-base-content/90 italic">Ahmad Imran</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
