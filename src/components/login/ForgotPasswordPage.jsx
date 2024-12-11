import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import './ForgotPasswordPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
        // Check if the email is registered
        const { data, error: fetchError } = await supabase
            .from('users')
            .select('email, status')
            .eq('email', email)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                toast.error('This email is not registered. Please check and try again.');
                return;
            }
            throw fetchError;
        }

        if (!data || data.status !== 'active') {
            toast.error('This email is not registered or not active. Please check and try again.');
            return;
        }

        // Use window.location.origin to get the base URL of your application
        const resetUrl = `${window.location.origin}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: resetUrl,
        });

        if (error) throw error;

        toast.success('Password reset email sent. Please check your inbox.');
        setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
    } catch (error) {
        console.error('Reset password error:', error);
        toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-logo-container">
          <h1 className="forgot-password-logo-text">
            <span className="forgot-password-logo-nxt">Nxt</span>
            <span className="forgot-password-logo-gen">Gen</span>
          </h1>
        </div>

        <div className="forgot-password-divider"></div>

        <div className="forgot-password-header">
          <h2 className="forgot-password-title">Reset Your Password</h2>
        </div>

        <form className="forgot-password-form" onSubmit={handleResetPassword}>
          <div className="forgot-password-form-group">
            <label htmlFor="email">Registered Email Address</label>
            <input
              type="email"
              id="email"
              required
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <small className="forgot-password-helper-text">
              Please ensure this is the email address you used during registration.
            </small>
          </div>

          <button type="submit" className="forgot-password-button">
            Reset Password
          </button>

          <div className="forgot-password-links-container">
            <Link to="/login" className="forgot-password-auth-link">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPasswordPage;
