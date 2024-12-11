import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import './LoginPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = ({ setUserName, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkUserExists = async (email) => {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    return { exists: !!data, error };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        // First check if user exists and get their status
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('status')
            .eq('email', email)
            .single();

        if (userError) {
            toast.error('The email address you entered is not registered. Please sign up.');
            return;
        }

        // Check status before attempting login
        switch (userData.status?.toLowerCase()) {
            case 'pending':
                toast.warning('Your account is pending approval. Please contact an administrator.');
                return;
            case 'inactive':
                toast.error('Your account has been deactivated. Please contact an administrator.');
                return;
            case 'active':
                // Proceed with login only if status is active
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    toast.error('The password you entered is incorrect. Please try again.');
                    return;
                }

                // Fetch full user details
                const { data: fullUserData, error: fullUserError } = await supabase
                    .from('users')
                    .select('first_name, last_name, role')
                    .eq('id', data.user.id)
                    .single();

                if (fullUserError) throw fullUserError;

                const fullName = `${fullUserData.first_name} ${fullUserData.last_name}`;
                setUserName(fullName);
                setUserRole(fullUserData.role);
                localStorage.setItem('userName', fullName);
                localStorage.setItem('userRole', fullUserData.role);
                navigate('/dashboard');
                break;
            default:
                toast.error('Account status unknown. Please contact an administrator.');
                return;
        }
    } catch (error) {
        setError(error.message);
        toast.error(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <h1 className="logo-text">
            <span className="logo-nxt">Nxt</span>
            <span className="logo-gen">Gen</span>
          </h1>
        </div>

        <div className="login-divider"></div>

        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-description">
            Please sign in with your registered email and password to access your account
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              required
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="sign-in-button">
            Sign In
          </button>

          <div className="links-container">
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
            <Link to="/signup" className="auth-link">
              Create an Account
            </Link>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;