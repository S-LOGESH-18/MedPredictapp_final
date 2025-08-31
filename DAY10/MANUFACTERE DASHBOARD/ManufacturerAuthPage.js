import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Eye, 
  EyeOff, 
  Building2, 
  ArrowLeft,
  Heart,
  Loader2,
  Key
} from 'lucide-react';
import { firebaseDB } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const ManufacturerAuthPage = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    manufacturerId: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/manufacturer-dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For manufacturer login, we'll use the manufacturer ID as email
      // In a real application, you'd validate this against your manufacturer database
      const manufacturerEmail = `${formData.manufacturerId}@manufacturer.medpredict.com`;
      
      const result = await signIn(manufacturerEmail, formData.password);
      if (result.success) {
        // Check if this is a manufacturer account
        try {
          const manufacturerDoc = await firebaseDB.getDocument('manufacturers', result.user.uid);
          if (manufacturerDoc) {
            // Update user role to manufacturer
            await firebaseDB.updateDocument('users', result.user.uid, {
              role: 'manufacturer'
            });
            
            toast.success(`Welcome back, Manufacturer ${formData.manufacturerId}!`, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            
            console.log("Manufacturer login success:", formData.manufacturerId);
            navigate("/manufacturer-dashboard");
          } else {
            // Create manufacturer profile if it doesn't exist
            await firebaseDB.addDocument('manufacturers', {
              uid: result.user.uid,
              manufacturerId: formData.manufacturerId,
              email: result.user.email,
              createdAt: new Date().toISOString(),
              status: 'active'
            });
            
            // Update user role
            await firebaseDB.updateDocument('users', result.user.uid, {
              role: 'manufacturer'
            });
            
            toast.success(`Manufacturer account created! Welcome, ${formData.manufacturerId}!`, {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            
            navigate("/manufacturer-dashboard");
          }
        } catch (profileError) {
          console.error("Error handling manufacturer profile:", profileError);
          toast.warning("Login successful but profile setup incomplete. You can update it later.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          navigate("/manufacturer-dashboard");
        }
      } else {
        toast.error(result.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Manufacturer auth error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUserAuth = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBackToUserAuth}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-4 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to User Login</span>
          </button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">MedPredict</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manufacturer Login
          </h1>
          <p className="text-gray-600">
            Access your manufacturing dashboard and manage device production
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer ID
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="manufacturerId"
                  value={formData.manufacturerId}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Enter your manufacturer ID"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>Access Manufacturing Dashboard</span>
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Manufacturer Access
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Use your assigned manufacturer ID and password to access the manufacturing dashboard. 
                  Contact your administrator if you need assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Need a user account?{' '}
              <button
                onClick={handleBackToUserAuth}
                className="text-primary-600 hover:text-primary-700 font-medium"
                disabled={loading}
              >
                Switch to User Login
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerAuthPage;
