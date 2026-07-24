import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRequestPasswordOtpMutation, useVerifyPasswordResetMutation } from '../store/apiSlice';

const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type RequestOtpForm = z.infer<typeof requestOtpSchema>;

const verifyResetSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
type VerifyResetForm = z.infer<typeof verifyResetSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [requestOtp, { isLoading: isRequesting }] = useRequestPasswordOtpMutation();
  const [verifyReset, { isLoading: isVerifying }] = useVerifyPasswordResetMutation();

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<RequestOtpForm>({
    resolver: zodResolver(requestOtpSchema),
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
  } = useForm<VerifyResetForm>({
    resolver: zodResolver(verifyResetSchema),
  });

  const onStep1Submit = async (data: RequestOtpForm) => {
    try {
      setErrorMsg('');
      await requestOtp(data).unwrap();
      setEmail(data.email);
      setSuccessMsg("If the email exists, an OTP has been sent.");
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to request OTP. Please try again.');
    }
  };

  const onStep2Submit = async (data: VerifyResetForm) => {
    try {
      setErrorMsg('');
      await verifyReset({ email, otp: data.otp, newPassword: data.newPassword }).unwrap();
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to reset password. Check your OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a192f] to-[#0f3a4a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-4 backdrop-blur-sm border border-white/20">
          <BookOpen className="h-12 w-12 text-[#bef264]" />
        </div>
        <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-tight">
          Password Recovery
        </h2>
        <p className="mt-3 text-center text-lg text-gray-300 font-medium">
          {step === 1 ? "Enter your admin email to receive an OTP" : "Enter the OTP and your new password"}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-md py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/10">
          
          {errorMsg && (
            <div className="bg-red-500/20 text-red-200 text-sm p-4 rounded-2xl border border-red-500/30 text-center font-medium mb-6">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/20 text-green-200 text-sm p-4 rounded-2xl border border-green-500/30 text-center font-medium mb-6">
              {successMsg}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmitStep1(onStep1Submit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-200">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    {...registerStep1('email')}
                    className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent sm:text-base transition-all"
                    placeholder="admin@dreamtales.com"
                  />
                  {errorsStep1.email && (
                    <p className="mt-2 text-sm text-red-400 font-medium">
                      {errorsStep1.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-lg text-base font-extrabold text-[#0a192f] bg-[#bef264] hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#bef264]/30 disabled:opacity-70 transition-all hover:-translate-y-0.5"
                >
                  {isRequesting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Recovery OTP'}
                </button>
                <div className="text-center">
                  <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-[#bef264] inline-flex items-center transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmitStep2(onStep2Submit)}>
              <div>
                <label htmlFor="otp" className="block text-sm font-bold text-gray-200">
                  6-Digit OTP
                </label>
                <div className="mt-2">
                  <input
                    id="otp"
                    type="text"
                    {...registerStep2('otp')}
                    className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent sm:text-base transition-all tracking-widest text-center text-xl"
                    placeholder="------"
                  />
                  {errorsStep2.otp && (
                    <p className="mt-2 text-sm text-red-400 font-medium">
                      {errorsStep2.otp.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-gray-200">
                  New Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...registerStep2('newPassword')}
                    className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent sm:text-base transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-[#bef264] focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errorsStep2.newPassword && (
                    <p className="mt-2 text-sm text-red-400 font-medium">
                      {errorsStep2.newPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-200">
                  Confirm New Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...registerStep2('confirmPassword')}
                    className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#bef264] focus:border-transparent sm:text-base transition-all"
                    placeholder="••••••••"
                  />
                  {errorsStep2.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400 font-medium">
                      {errorsStep2.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-lg text-base font-extrabold text-[#0a192f] bg-[#bef264] hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[#bef264]/30 disabled:opacity-70 transition-all hover:-translate-y-0.5"
                >
                  {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
