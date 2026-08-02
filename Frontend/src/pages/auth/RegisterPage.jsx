import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser, clearError, logoutImmediate } from "../../store/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  User,
  Mail,
  Lock,
  Phone,
  Plane,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import toast from "react-hot-toast";

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { error, isLoading, isAuthenticated } = useAuth();

  //react hook form
  const {
    register, //this connects the input field to the react hook form
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const passwordValue = watch("password", "");  //it observere the field live

  //clearing previous auth errors if any
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(resultAction)) {
      toast.success("Registration successful! Welcome aboard.");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(resultAction.payload || "Registration failed");
    }
  };

  // check for password strength
  const getPasswordStrength = () => {
    if (!passwordValue) return null;
    let strength = 0;
    if (passwordValue.length >= 6) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/[0-9]/.test(passwordValue)) strength++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;

    if (strength <= 1) return { label: "Weak", color: "bg-red-500" };
    if (strength === 2 || strength === 3)
      return { label: "Fair", color: "bg-amber-500" };
    return { label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-50 dark:bg-primary-950/50 rounded-2xl text-primary-600 dark:text-primary-400 mb-4">
            <Plane className="h-8 w-8 animate-float" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join AeroRana to start booking executive flights
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Registration Notice</p>
              <p className="text-xs mt-0.5 text-red-200">{typeof error === 'string' ? error : error?.message || 'Registration failed'}</p>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Your name"
              icon={User}
              error={errors.firstName?.message}
              {...register("firstName", { required: "First name is required" })}
            />
            <Input
              label="Last Name"
              placeholder="Your surname"
              icon={User}
              error={errors.lastName?.message}
              {...register("lastName", { required: "Last name is required" })}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="1234567890"
            icon={Phone}
            error={errors.phone?.message}
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9+() -]{8,15}$/,
                message: "Invalid phone number format",
              },
            })}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="text-slate-400 transition-colors hover:text-primary-500 dark:hover:text-primary-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          {strength && (
            <div className="mt-1">
              <div className="flex justify-between items-center text-xs mb-1 text-slate-500 dark:text-slate-400">
                <span>Password strength:</span>
                <span className="font-semibold">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{
                    width:
                      strength.label === "Weak"
                        ? "33%"
                        : strength.label === "Fair"
                          ? "66%"
                          : "100%",
                  }}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full justify-center mt-6 cursor-pointer"
            isLoading={isLoading}
          >
            Register Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};


 
// FLOW ->

// RegisterPage
//    ↓
// dispatch(registerUser(data))
//    ↓
// authSlice thunk
//    ↓
// authService.register(data)
//    ↓
// Axios API request
//    ↓
// Backend registration controller
//    ↓
// Redux state updates