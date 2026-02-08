import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Briefcase, ArrowRight, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('hr');
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (mode === 'hr') {
        if (isSignup) {
          await axios.post('http://localhost:8080/hr/signup', {
            email: formData.email,
            password: formData.password,
          });

          toast.success('HR account created! Please login.');
          setIsSignup(false);

        } else {
          response = await axios.post('http://localhost:8080/hr/login', {
            email: formData.email,
            password: formData.password
          });

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('id', response.data.id);

          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

          toast.success("Login successful!");
          navigate('/dashboard');
        }

      } else {
        response = await axios.post('http://localhost:8080/employee/login', {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('id', response.data.id);

        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        toast.success("Login successful!");
        navigate('/dashboard');
      }

    } catch (err) {
      toast.error(err.response?.data || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Left Side */}
          <div className="relative bg-black p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[400px] lg:min-h-[550px]">
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 mb-6 sm:mb-8">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">HR Module</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Management System</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {mode === 'hr' ? 'Manage Your Team' : 'Employee Portal'}
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-md">
                  {mode === 'hr' 
                    ? 'Streamline your HR operations with powerful tools designed for modern workforce management.' 
                    : 'Access your personal workspace, track your progress, and stay connected with your team.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMode(mode === 'hr' ? 'employee' : 'hr')}
              className="cursor-pointer mt-6 flex items-center justify-between w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <div className="flex items-center space-x-2">
                {mode === 'hr' ? (
                  <Users className="w-4 h-4 text-white" />
                ) : (
                  <Briefcase className="w-4 h-4 text-white" />
                )}
                <span className="text-sm text-white font-medium">
                  {mode === 'hr' ? 'Switch to Employee Portal' : 'Switch to HR Portal'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Right Side */}
          <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex items-center">
            <div className="w-full max-w-md mx-auto">
              
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                  {mode === 'hr' ? (isSignup ? 'Create Account' : 'Welcome Back') : 'Employee Login'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isSignup && mode === 'hr' 
                    ? 'Get started with your HR account' 
                    : mode === 'hr'
                    ? 'Sign in to continue to your dashboard'
                    : 'Access your employee portal'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black text-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer bg-black text-white py-3 rounded-lg font-semibold text-sm hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-6"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isSignup && mode === 'hr' ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Signup Toggle */}
              {mode === 'hr' && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => setIsSignup(!isSignup)}
                    className="font-semibold cursor-pointer text-black hover:underline"
                  >
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
