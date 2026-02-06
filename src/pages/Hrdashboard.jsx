import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, LogOut, CheckCircle, XCircle, Calendar } from 'lucide-react';

const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    outline: 'border border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'hover:bg-gray-100',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [employeesRes, leavesRes] = await Promise.all([
        axios.get(`http://localhost:8080/hr/employees`),
        axios.get('http://localhost:8080/hr/leaves')
      ]);
      
      // Handle different response formats
      const employeeData = Array.isArray(employeesRes.data) ? employeesRes.data : [];
      const leaveData = Array.isArray(leavesRes.data) ? leavesRes.data : [];
      
      setEmployees(employeeData);
      setLeaves(leaveData);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Show error to user
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('id');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/hr/delete/${employeeId}`);
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      setUpdating(true);
      await axios.put(`http://localhost:8080/hr/employee/status/${employeeId}?status=${newStatus}`);
      
      // Update local state
      setEmployees(employees.map(emp => 
        emp.id === employeeId ? { ...emp, status: newStatus } : emp
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update employee status');
    } finally {
      setUpdating(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      setUpdating(true);
      await axios.put(`http://localhost:8080/hr/leave/${action}/${leaveId}`);
      
      // Refresh leave data
      const leavesRes = await axios.get('http://localhost:8080/hr/leaves');
      setLeaves(leavesRes.data || []);
    } catch (error) {
      console.error('Error processing leave:', error);
      alert(`Failed to ${action} leave request`);
    } finally {
      setUpdating(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeForm.name || !employeeForm.email || !employeeForm.password || !employeeForm.department) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const hrId = localStorage.getItem('id');
      
      const response = await axios.post(`http://localhost:8080/hr/addEmployee/${hrId}`, {
        name: employeeForm.name,
        email: employeeForm.email,
        password: employeeForm.password,
        department: employeeForm.department
      });

      // Reset form and refresh data
      setEmployeeForm({ name: '', email: '', password: '', department: '' });
      setShowEmployeeForm(false);
      await fetchData();
      alert(response.data.message || 'Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      
      // Extract proper error message from response
      let errorMessage = 'Failed to add employee. Please try again.';
      
      if (error.response) {
        // Server responded with error
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading HR Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
                <p className="text-sm text-gray-500">Human Resources Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {leaves.filter(l => l.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leaves</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{leaves.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
              activeTab === 'employees'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
              activeTab === 'leaves'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Leave Requests ({leaves.length})
          </button>
        </div>

        {/* Employees Table */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Employee Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage employee details and status</p>
              </div>
              <Button 
                variant="default"
                onClick={() => setShowEmployeeForm(true)}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Add Employee</span>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{employee.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-gray-600">
                              {(employee.name || employee.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{employee.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default">
                          {employee.department || 'Not Assigned'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={employee.status || 'AVAILABLE'}
                          onChange={(e) => handleStatusChange(employee.id, e.target.value)}
                          disabled={updating}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="NOT_AVAILABLE">Not Available</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          variant="danger"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leaves Table */}
        {activeTab === 'leaves' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Leave Requests</h2>
              <p className="text-sm text-gray-500 mt-1">Review and manage employee leave requests</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {leave.employee?.name || leave.employee?.email || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{leave.employee?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {leave.toDate ? new Date(leave.toDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-600 truncate">{leave.reason || 'No reason provided'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            leave.status === 'APPROVED' ? 'success' : 
                            leave.status === 'PENDING' ? 'warning' : 'danger'
                          }
                        >
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {leave.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="success" 
                              size="sm"
                              disabled={updating}
                              onClick={() => handleLeaveAction(leave.id, 'approve')}
                              className="mr-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              disabled={updating}
                              onClick={() => handleLeaveAction(leave.id, 'reject')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {leave.status !== 'PENDING' && (
                          <span className="text-gray-400 text-sm">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No leave requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Employee Creation Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the employee details</p>
              </div>
              <button
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEmployeeForm({ name: '', email: '', password: '', department: '' });
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                disabled={submitting}
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters recommended</p>
              </div>

              {/* Department Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  required
                  value={employeeForm.department}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEmployeeForm({ name: '', email: '', password: '', department: '' });
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Add Employee
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}