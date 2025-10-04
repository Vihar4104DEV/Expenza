import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import LoginModal from './auth/LoginModal';
import SignupModal from './auth/SignupModal';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const features = [
    {
      icon: 'Workflow',
      title: 'Smart Approval Workflows',
      description: 'Sequential and conditional approval rules tailored to your organization',
      color: 'text-blue-600'
    },
    {
      icon: 'Camera',
      title: 'OCR Receipt Scanning',
      description: 'Auto-extract expense details from receipts with AI-powered technology',
      color: 'text-green-600'
    },
    {
      icon: 'DollarSign',
      title: 'Multi-Currency Support',
      description: 'Handle expenses in any currency with real-time conversion rates',
      color: 'text-indigo-600'
    }
  ];

  const handleGetStarted = () => {
    setShowSignupModal(true);
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="Receipt" size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Expenza</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </Button>
              <Button
                variant="default"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Streamline Your{' '}
                <span className="text-blue-600">Expense Approvals</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Multi-level approvals, OCR receipt scanning, and conditional workflows in one platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleGetStarted}
                  iconName="ArrowRight"
                  iconPosition="right"
                  className="text-lg px-8 py-6"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLearnMore}
                  className="text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                  <span>Free 14-day trial</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                {/* Approval Flow Illustration */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Icon name="User" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Employee</div>
                      <div className="text-xs text-gray-600">Submit Expense</div>
                    </div>
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                  
                  <div className="flex justify-center">
                    <Icon name="ArrowDown" size={24} className="text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                      <Icon name="UserCheck" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Manager</div>
                      <div className="text-xs text-gray-600">Review & Approve</div>
                    </div>
                    <Icon name="Clock" size={20} className="text-yellow-600" />
                  </div>

                  <div className="flex justify-center">
                    <Icon name="ArrowDown" size={24} className="text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Icon name="CheckCircle2" size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Finance</div>
                      <div className="text-xs text-gray-600">Final Approval</div>
                    </div>
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3"
              >
                <Icon name="Zap" size={24} className="text-yellow-500" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3"
              >
                <Icon name="TrendingUp" size={24} className="text-green-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage expenses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to simplify expense management for teams of all sizes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-6`}>
                  <Icon name={feature.icon} size={28} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to streamline your expense management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of companies already using Expenza
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleGetStarted}
              iconName="ArrowRight"
              iconPosition="right"
              className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Free Trial
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Icon name="Receipt" size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">Expenza</span>
              </div>
              <p className="text-sm">
                Streamline your expense approvals with intelligent workflows
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Expenza. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default LandingPage;
