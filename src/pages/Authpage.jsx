import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Calendar, Briefcase, ArrowRight, Lock, Mail } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('hr');
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'hr') {
        if (isSignup) {
          response = await axios.post('http://localhost:8080/hr/signup', {
            email: formData.email,
            password: formData.password,
          });
          setError('HR account created! Please login.');
          setIsSignup(false);
        } else {
          response = await axios.post('http://localhost:8080/hr/login', {
            email: formData.email,
            password: formData.password
          });
          console.log('Login response:', response.data);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', response.data.role);
          localStorage.setItem('id', response.data.id);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
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
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Left Side - Brand & Info */}
          <div className="relative bg-black p-12 lg:p-16 flex flex-col justify-between min-h-[600px]">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="inline-flex items-center space-x-3 mb-12">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">HR Module</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Management System</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {mode === 'hr' ? 'Manage Your Team' : 'Employee Portal'}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                  {mode === 'hr' 
                    ? 'Streamline your HR operations with powerful tools designed for modern workforce management.' 
                    : 'Access your personal workspace, track your progress, and stay connected with your team.'}
                </p>

                {/* Features */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Secure Access</h3>
                      <p className="text-sm text-gray-400">End-to-end encrypted authentication</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Real-time Updates</h3>
                      <p className="text-sm text-gray-400">Stay synchronized across all devices</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">24/7 Support</h3>
                      <p className="text-sm text-gray-400">We're here whenever you need us</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Toggle Button */}
            <button
              onClick={() => setMode(mode === 'hr' ? 'employee' : 'hr')}
              className="relative z-10 mt-8 group flex items-center justify-between w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                {mode === 'hr' ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <Briefcase className="w-5 h-5 text-white" />
                )}
                <span className="text-white font-medium">
                  {mode === 'hr' ? 'Switch to Employee Portal' : 'Switch to HR Portal'}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Right Side - Form */}
          <div className="p-12 lg:p-16 flex items-center">
            <div className="w-full max-w-md mx-auto">
              
              {/* Form Header */}
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {mode === 'hr' ? (isSignup ? 'Create Account' : 'Welcome Back') : 'Employee Login'}
                </h3>
                <p className="text-gray-500">
                  {isSignup && mode === 'hr' 
                    ? 'Get started with your HR account' 
                    : mode === 'hr'
                    ? 'Sign in to continue to your dashboard'
                    : 'Access your employee portal'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold text-base hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-8"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignup && mode === 'hr' ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Toggle */}
              {mode === 'hr' && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-600">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignup(!isSignup)}
                      className="font-semibold text-black hover:underline transition-all"
                    >
                      {isSignup ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>
              )}

              {/* Terms */}
              <p className="mt-8 text-xs text-center text-gray-500 leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-black hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-black hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}