import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, LogOut, Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled, type = 'button', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    outline: 'border border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'hover:bg-gray-100'
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <button
      type={type}
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

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const employeeId = localStorage.getItem('id');
      
      // Fetch employee details and leave history
      const employeedata = await axios.get(`http://localhost:8080/employee/${employeeId}`);
      setEmployee(employeedata.data);
      const historyRes = await axios.get(`http://localhost:8080/employee/leave/history/${employeeId}`);
      setLeaveHistory(historyRes.data || []);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const employeeId = localStorage.getItem('id');
      
      await axios.post(`http://localhost:8080/employee/leave/${employeeId}`, {
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason
      });

      // Reset form and refresh data
      setLeaveForm({ fromDate: '', toDate: '', reason: '' });
      setShowLeaveForm(false);
      await fetchEmployeeData();
      toast.success('Leave request submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit leave request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingLeaves = leaveHistory.filter(l => l.status === 'PENDING').length;
  const approvedLeaves = leaveHistory.filter(l => l.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
                <p className="text-sm text-gray-500">Welcome back, {employee?.Name || 'Employee'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex cursor-pointer items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{leaveHistory.length}</p>
              </div>
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingLeaves}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{approvedLeaves}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee Details */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">My Details</h2>
              
                <h3 className="text-xl font-semibold text-gray-900">{employee.Name}</h3>
                <p className="text-sm text-gray-500">{employee.Email}</p>

              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{employee.Id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{employee.Email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{employee.Department}</p>
                </div>
              </div>

              <Button 
                variant="default" 
                className="w-full mt-6 cursor-pointer"
                onClick={() => setShowLeaveForm(!showLeaveForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showLeaveForm ? 'Cancel Request' : 'Request Leave'}
              </Button>
            </Card>
          </div>

          {/* Leave Form and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Leave Request Form */}
            {showLeaveForm && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">New Leave Request</h2>
                
                <form onSubmit={handleLeaveSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={leaveForm.fromDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent "
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        required
                        value={leaveForm.toDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      placeholder="Please provide a reason for your leave request..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="default" 
                    className="w-full cursor-pointer"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4  border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Submit Leave Request
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            )}

            {/* Leave History */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
                <p className="text-sm text-gray-500 mt-1">Track all your leave requests</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaveHistory.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                            {leave.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {leave.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                            {leave.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                            {leave.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {leaveHistory.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No leave requests yet</p>
                          <p className="text-sm text-gray-400 mt-1">Click "Request Leave" to submit your first request</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}