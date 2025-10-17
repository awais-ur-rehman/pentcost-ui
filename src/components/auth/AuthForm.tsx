import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  preferredLanguage: z.string().min(1, 'Please select a language'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const { availableLanguages } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLogin = mode === 'login';
  const schema = isLogin ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    try {
      if (isLogin) {
        await login(data as LoginFormData);
        navigate('/dashboard');
      } else {
        await signup(data as SignupFormData);
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by the auth context with toast notifications
      console.error('Authentication error:', err);
    }
  };

  const handleToggleMode = () => {
    reset();
    onToggleMode();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" text={isLogin ? 'Signing in...' : 'Creating account...'} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {!isLogin && (
        <Input
          label="Full Name"
          {...register('name')}
            error={(errors as any).name?.message}
          placeholder="Enter your full name"
        />
      )}

      <Input
        label="Email Address"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="Enter your email"
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={errors.password?.message}
          placeholder="Enter your password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          }
        />
      </div>

      {!isLogin && (
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={(errors as any).confirmPassword?.message}
            placeholder="Confirm your password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            }
          />
        </div>
      )}

      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Preferred Language
          </label>
          <select
            {...register('preferredLanguage')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a language</option>
            {availableLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name} ({language.nativeName})
              </option>
            ))}
          </select>
          {(errors as any).preferredLanguage && (
            <p className="mt-1 text-sm text-red-600">{(errors as any).preferredLanguage.message}</p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={loading}
      >
        {isLogin ? 'Sign In' : 'Create Account'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-secondary-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            type="button"
            onClick={handleToggleMode}
            className="ml-1 font-medium text-primary-600 hover:text-primary-500"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </form>
  );
}
