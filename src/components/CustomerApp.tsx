import React, { useState, useEffect } from 'react';
import CustomerLogin from './CustomerLogin';
import CustomerPortal from './CustomerPortal';

/**
 * CustomerApp - Wrapper untuk portal customer
 * Menangani: login/register, portal, logout
 */
const CustomerApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('pp_customer_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // Verify token by fetching user profile
      // For now, just restore from localStorage
      const savedCustomer = localStorage.getItem('pp_customer_data');
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('[CustomerApp] Token verification failed:', err);
      localStorage.removeItem('pp_customer_token');
      localStorage.removeItem('pp_customer_data');
    }
  };

  const handleLoginSuccess = (data: any) => {
    setCustomer(data.customer);
    localStorage.setItem('pp_customer_data', JSON.stringify(data.customer));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCustomer(null);
    localStorage.removeItem('pp_customer_token');
    localStorage.removeItem('pp_customer_data');
  };

  if (!isAuthenticated) {
    return <CustomerLogin onLoginSuccess={handleLoginSuccess} isLoading={isLoading} />;
  }

  return <CustomerPortal customer={customer} onLogout={handleLogout} />;
};

export default CustomerApp;
