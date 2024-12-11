import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ResetPasswordPage.css';


const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasSymbol: false,
    hasCapital: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecoveryToken = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('URL:', window.location.href);

      if (!session?.user?.email) {
        console.log('No valid session found');
        toast.error('Invalid or expired reset link. Please try again.');
        setTimeout(() => navigate('/forgot-password'), 3000);
      }
    };

    checkRecoveryToken();
  }, [navigate]);

  // Check password requirements as user types
  useEffect(() => {
    setValidations({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasCapital: /[A-Z]/.test(password)
    });
  }, [password]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Check if all validations pass
    if (!Object.values(validations).every(Boolean)) {
      toast.error('Please meet all password requirements');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      await supabase.auth.signOut();
      
      toast.success('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Error resetting password:', error.message);
      toast.error(error.message || 'Error resetting password');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <div className="reset-password-company-logo">
          <h1 className="reset-password-logo-text">
            <span className="reset-password-logo-nxt">Nxt</span>
            <span className="reset-password-logo-gen">Gen</span>
          </h1>
        </div>

        <div className="reset-password-divider"></div>

        <div className="reset-password-header">
          <h2 className="reset-password-title">Set New Password</h2>
          <p className="reset-password-description">
            Please create a strong password that meets all the requirements below
          </p>
        </div>

        <form className="reset-password-form" onSubmit={handleResetPassword}>
          <div className="reset-password-form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              required
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={password ? 'password-input-filled' : ''}
            />
            
            {/* Password requirements indicator */}
            <div className="password-requirements">
              <p className="requirements-title">Password must contain:</p>
              <div className="requirements-grid">
                <ul>
                  <li className={validations.minLength ? 'valid' : 'invalid'}>
                    <span className="requirement-icon">{validations.minLength ? '✓' : '○'}</span>
                    At least 8 characters
                  </li>
                  <li className={validations.hasCapital ? 'valid' : 'invalid'}>
                    <span className="requirement-icon">{validations.hasCapital ? '✓' : '○'}</span>
                    One capital letter
                  </li>
                </ul>
                <ul>
                  <li className={validations.hasNumber ? 'valid' : 'invalid'}>
                    <span className="requirement-icon">{validations.hasNumber ? '✓' : '○'}</span>
                    One number
                  </li>
                  <li className={validations.hasSymbol ? 'valid' : 'invalid'}>
                    <span className="requirement-icon">{validations.hasSymbol ? '✓' : '○'}</span>
                    One special character
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            className="reset-password-button"
            disabled={!Object.values(validations).every(Boolean)}
          >
            Set New Password
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPasswordPage;
