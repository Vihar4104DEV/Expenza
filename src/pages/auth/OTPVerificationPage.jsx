import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useToastContext } from '../../components/shared/ToastProvider';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();
  
  const email = location.state?.email || 'user@example.com';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);

    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      
      // Mock verification (accept any 6-digit OTP for demo)
      if (otpValue.length === 6) {
        // Get pending user data from sessionStorage
        const pendingUserData = sessionStorage.getItem('pendingUserData');
        
        if (pendingUserData) {
          const userData = JSON.parse(pendingUserData);
          
          // Save to localStorage after successful verification
          localStorage.setItem('userToken', 'mock-token-' + Date.now());
          localStorage.setItem('userRole', 'employee');
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Clear pending data
          sessionStorage.removeItem('pendingUserData');
        }
        
        toast.success('Email verified successfully!');
        // Navigate to employee dashboard
        setTimeout(() => {
          navigate('/employee-dashboard');
        }, 1000);
      } else {
        toast.error('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsResending(true);

    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setTimer(60);
      toast.success('OTP sent successfully!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icon name="Mail" size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-blue-600 font-medium">{email}</p>
        </div>

        {/* OTP Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* OTP Inputs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            variant="default"
            className="w-full mb-4"
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
            loading={isVerifying}
            iconName={isVerifying ? 'Loader2' : 'Check'}
            iconPosition="left"
            iconClassName={isVerifying ? 'animate-spin' : ''}
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in <span className="font-semibold text-blue-600">{timer}s</span>
              </p>
            ) : (
              <Button
                variant="link"
                onClick={handleResend}
                disabled={isResending}
                loading={isResending}
                className="text-blue-600 hover:text-blue-700"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Check your spam folder if you don't see the email
          </p>
        </div>

        {/* Back to Login */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            iconName="ArrowLeft"
            iconPosition="left"
            className="text-gray-600"
          >
            Back to Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerificationPage;
