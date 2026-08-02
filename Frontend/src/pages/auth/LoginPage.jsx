import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser, clearError, logoutImmediate } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Plane, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isLoading, isAuthenticated, user } = useAuth();
  
  const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/dashboard');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  useEffect(() => {
    // Clear any leftover auth errors when visiting login
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success(`Welcome back, ${resultAction.payload.user.firstName}!`);
      const userRole = resultAction.payload?.user?.role;
      const targetPath = from === '/' ? (userRole === 'admin' ? '/admin' : '/dashboard') : from;
      navigate(targetPath, { replace: true });
    } else {
      toast.error(resultAction.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center overflow-hidden p-3 bg-primary-50 dark:bg-primary-950/50 rounded-2xl text-primary-600 dark:text-primary-400 mb-4">
            <Plane className="h-8 w-8 animate-float" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your flight reservations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">Sign-in Notice</p>
              <p className="text-xs mt-0.5 text-red-200">{typeof error === 'string' ? error : error?.message || 'Invalid email or password'}</p>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-900 dark:border-slate-800"
              />
              Remember me
            </label>
            <span className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <Button
            type="submit"
            className="w-full justify-center"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            Register for free
          </Link>
        </p>
      </Card>
    </div>
  );
};


//FLOW FOR LOGIN PAGE

// User fills Login form
//    ↓
// LoginPage calls dispatch(loginUser({ email, password }))
//    ↓
// Redux dispatches auth/login/pending
//    ↓
// state.isLoading = true
//    ↓
// authService.login(credentials) sends POST request to backend
//    ↓
// Backend validates email and password
//    ↓
// Success:
//   backend sends user + accessToken
//   token and user saved in localStorage
//   thunk returns data.data
//   Redux dispatches auth/login/fulfilled
//   Redux stores user and token
//   UI updates / redirects

// Failure:
//   backend sends error
//   rejectWithValue returns clean error message
//   Redux dispatches auth/login/rejected
//   Redux stores error
//   Login page displays error

