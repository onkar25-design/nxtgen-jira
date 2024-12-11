import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import './SignupPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [designation, setDesignation] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasSymbol: false,
    hasCapital: false
  });

  // Add password validation effect
  useEffect(() => {
    setValidations({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasCapital: /[A-Z]/.test(password)
    });
  }, [password]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // Check if all password validations pass
    if (!Object.values(validations).every(Boolean)) {
      toast.error('Please meet all password requirements');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    // Capitalize first letters
    const capitalizedFirstName = capitalizeFirstLetter(firstName);
    const capitalizedLastName = capitalizeFirstLetter(lastName);
    const capitalizedDesignation = capitalizeFirstLetter(designation);
    const capitalizedStreet = capitalizeFirstLetter(street);
    const capitalizedCity = capitalizeFirstLetter(city);
    const capitalizedState = capitalizeFirstLetter(state);
    const capitalizedCountry = capitalizeFirstLetter(country);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Insert user data with initial pending status
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            first_name: capitalizedFirstName,
            last_name: capitalizedLastName,
            name: `${capitalizedFirstName} ${capitalizedLastName}`,
            email,
            phone,
            designation: capitalizedDesignation,
            address: {
              street: capitalizedStreet,
              city: capitalizedCity,
              state: capitalizedState,
              country: capitalizedCountry,
              zipcode,
            },
            role: 'staff',
            status: 'Pending',
          },
        ]);

      if (insertError) throw insertError;
      
      // Immediately sign out the user after successful signup
      await supabase.auth.signOut();
      
      // Show success message
      toast.success('Sign up successful! Please wait for admin approval before logging in.');

      // Clear the form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setCountry('');
      setZipcode('');
      setDesignation('');

    } catch (error) {
      console.error('Sign-up error:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="logo-container">
          <h1 className="logo-text">
            <span className="logo-nxt">Nxt</span>
            <span className="logo-gen">Gen</span>
          </h1>
        </div>

        <div className="signup-divider"></div>

        <div className="signup-header">
          <h2 className="signup-title">Create Your Account</h2>
          <p className="signup-description">
            Please fill in your information to create a new account
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSignUp}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={password ? 'password-input-filled' : ''}
            />
            
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="street">Street</label>
              <input
                type="text"
                id="street"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipcode">Zip Code</label>
              <input
                type="text"
                id="zipcode"
                required
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="sign-up-button"
            disabled={!Object.values(validations).every(Boolean)}
          >
            Sign Up
          </button>

          <Link to="/login" className="back-to-login">
            Back to Login
          </Link>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignupPage;