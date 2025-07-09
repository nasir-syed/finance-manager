import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Auth = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { loginUser, signUpNewUser } = userAuth();
    const navigate = useNavigate();

    const validEmailDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"];

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        resetForm();
    };

    const handleAuthError = (error) => {
        if (error?.message) {
            const errorMessage = error.message.toLowerCase();
            
            if (errorMessage.includes('user already registered')) {
                return 'An account with this email already exists. Please try logging in instead.';
            }
            
            if (errorMessage.includes('invalid login credentials') || 
                errorMessage.includes('email not confirmed') ||
                errorMessage.includes('invalid credentials')) {
                return 'Invalid email or password, please check your credentials and try again.';
            }
            
            if (errorMessage.includes('email not found') || 
                errorMessage.includes('user not found')) {
                return 'No account found with this email, please check your email or sign up.';
            }
            
            if (errorMessage.includes('password')) {
                return 'Incorrect password, please try again.';
            }
            
            if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
                return 'Please enter a valid email address.';
            }
            
            if (errorMessage.includes('weak password') || 
                errorMessage.includes('password should be at least')) {
                return 'Password is too weak, please use at least 6 characters.';
            }
            
            if (errorMessage.includes('rate limit') || 
                errorMessage.includes('too many requests')) {
                return 'Too many attempts, please wait a moment before trying again.';
            }
            
            if (errorMessage.includes('network') || 
                errorMessage.includes('connection')) {
                return 'Network error, please check your connection and try again.';
            }
            
            return error.message;
        }
        
        return 'An unexpected error occurred. Please try again.';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser(email, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(handleAuthError(result.error || { message: 'Login failed' }));
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(handleAuthError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const emailDomain = email.split("@")[1];

        if (!validEmailDomains.includes(emailDomain)) {
            setError("Please use a valid email address (gmail, outlook, yahoo, etc).");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const result = await signUpNewUser(email, password);
            if (result.success) {
                navigate("/dashboard");
            } else {
                setError(handleAuthError(result.error || { message: 'Sign up failed' }));
            }
        } catch (error) {
            console.error('Sign up error:', error);
            setError(handleAuthError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-10">
            <div className="flex flex-col justify-start sm:fixed sm:top-3">
                <h1 className="text-6xl font-bold text-[#282828] text-center">
                    fin-man
                </h1>
            </div>

            <div className="w-full max-w-sm mt-18">
                <div className="bg-[#282828] rounded-2xl p-8 border border-gray-700">
                    <div className="flex justify-center mb-4">
                        <div className="flex bg-transparent rounded-lg p-1">
                            <button
                                onClick={() => handleTabSwitch('login')}
                                className={`px-4 py-2 rounded-bl-md rounded-tl-md text-sm font-medium transition-colors duration-200 ${activeTab === 'login'
                                        ? 'bg-[#f8f9fa] text-gray-900'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => handleTabSwitch('signup')}
                                className={`px-4 py-2 rounded-tr-md rounded-br-md text-sm font-medium transition-colors duration-200 ${activeTab === 'signup'
                                        ? 'bg-[#f8f9fa] text-gray-900'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white mb-2">
                            {activeTab === 'login' ? 'Login' : 'Sign Up'}
                        </h2>
                        <p className="text-gray-400">
                            {activeTab === 'login'
                                ? 'Enter the details below to login to your account.'
                                : 'Enter the details below to create your account.'
                            }
                        </p>
                    </div>

                    <form
                        className="space-y-4"
                        onSubmit={activeTab === 'login' ? handleLogin : handleSignUp}
                    >
                        <div>
                            <label htmlFor="email" className="block text-md font-medium text-white mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-md font-medium text-white mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    required
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 cursor-pointer"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </span>
                            </div>
                        </div>

                        {activeTab === 'signup' && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-md font-medium text-white mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        required
                                    />
                                    <span
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                                <p className="text-red-400 text-sm">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full mt-4 bg-[#f8f9fa] hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading
                                ? (activeTab === 'login' ? 'Logging in...' : 'Signing up...')
                                : (activeTab === 'login' ? 'Login' : 'Sign Up')
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;