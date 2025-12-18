import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

type AuthMode = 'login' | 'register' | 'otp' | 'verify-otp';

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();
  const { login, register, sendOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const clearError = () => setError(null);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    clearError();

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    clearError();

    const result = await register(email, password, name, phone || undefined);
    setIsLoading(false);

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    clearError();

    const fullPhone = phone.startsWith('0') ? phone : `0${phone}`;
    const result = await sendOtp(fullPhone);
    setIsLoading(false);

    if (result.success) {
      setAuthMode('verify-otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    clearError();

    const fullPhone = phone.startsWith('0') ? phone : `0${phone}`;
    const result = await verifyOtp(fullPhone, otpCode);
    setIsLoading(false);

    if (result.success) {
      router.back();
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleSubmit = () => {
    switch (authMode) {
      case 'login':
        handleEmailLogin();
        break;
      case 'register':
        handleEmailRegister();
        break;
      case 'otp':
        handleSendOtp();
        break;
      case 'verify-otp':
        handleVerifyOtp();
        break;
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'otp':
        return 'Phone Login';
      case 'verify-otp':
        return 'Enter Code';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'login':
        return 'Sign in with your email and password';
      case 'register':
        return 'Create an account to get started';
      case 'otp':
        return 'We\'ll send you a verification code';
      case 'verify-otp':
        return `Enter the 6-digit code sent to ${phone}`;
    }
  };

  const getButtonText = () => {
    if (isLoading) return '';
    switch (authMode) {
      case 'login':
        return 'Sign In';
      case 'register':
        return 'Create Account';
      case 'otp':
        return 'Send Code';
      case 'verify-otp':
        return 'Verify';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={[styles.content, { maxWidth: width > 500 ? 400 : '100%' }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo/Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.text }]}>{getTitle()}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {getSubtitle()}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: `${theme.danger}15` }]}>
              <Ionicons name="alert-circle" size={18} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email/Password Login */}
            {(authMode === 'login' || authMode === 'register') && (
              <>
                {authMode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                      ]}
                    >
                      <Ionicons name="person-outline" size={18} color={theme.icon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.icon}
                        value={name}
                        onChangeText={(text) => {
                          setName(text);
                          clearError();
                        }}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                    ]}
                  >
                    <Ionicons name="mail-outline" size={18} color={theme.icon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="Enter your email"
                      placeholderTextColor={theme.icon}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        clearError();
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={theme.icon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder={authMode === 'register' ? 'Min 8 characters' : 'Enter password'}
                      placeholderTextColor={theme.icon}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        clearError();
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={theme.icon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {authMode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Phone Number{' '}
                      <Text style={{ color: theme.textSecondary, fontWeight: '400' }}>
                        (optional)
                      </Text>
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                      ]}
                    >
                      <Ionicons name="call-outline" size={18} color={theme.icon} />
                      <Text style={[styles.phonePrefix, { color: theme.text }]}>+251</Text>
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="9XXXXXXXX"
                        placeholderTextColor={theme.icon}
                        value={phone}
                        onChangeText={(text) => {
                          setPhone(text);
                          clearError();
                        }}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Phone OTP Login */}
            {authMode === 'otp' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  ]}
                >
                  <Ionicons name="call-outline" size={18} color={theme.icon} />
                  <Text style={[styles.phonePrefix, { color: theme.text }]}>+251</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="9XXXXXXXX"
                    placeholderTextColor={theme.icon}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      clearError();
                    }}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* OTP Verification */}
            {authMode === 'verify-otp' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Verification Code</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                  ]}
                >
                  <Ionicons name="keypad-outline" size={18} color={theme.icon} />
                  <TextInput
                    style={[styles.input, { color: theme.text, letterSpacing: 8, fontSize: 20 }]}
                    placeholder="000000"
                    placeholderTextColor={theme.icon}
                    value={otpCode}
                    onChangeText={(text) => {
                      setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                      clearError();
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOtpCode('');
                    handleSendOtp();
                  }}
                  style={styles.resendButton}
                >
                  <Text style={[styles.resendText, { color: theme.primary }]}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>{getButtonText()}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Auth Method Toggle */}
          {(authMode === 'login' || authMode === 'register') && (
            <>
              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
                  or
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              {/* Phone Login Option */}
              <TouchableOpacity
                style={[
                  styles.alternativeButton,
                  { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                ]}
                onPress={() => {
                  setAuthMode('otp');
                  clearError();
                }}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={theme.text} />
                <Text style={[styles.alternativeButtonText, { color: theme.text }]}>
                  Continue with Phone
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Email Login from OTP */}
          {(authMode === 'otp' || authMode === 'verify-otp') && (
            <TouchableOpacity
              style={styles.backToEmail}
              onPress={() => {
                setAuthMode('login');
                setOtpCode('');
                clearError();
              }}
            >
              <Ionicons name="arrow-back" size={16} color={theme.primary} />
              <Text style={[styles.backToEmailText, { color: theme.primary }]}>
                Back to Email Login
              </Text>
            </TouchableOpacity>
          )}

          {/* Toggle Sign In/Up */}
          {(authMode === 'login' || authMode === 'register') && (
            <View style={styles.toggleSection}>
              <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
                {authMode === 'register' ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode(authMode === 'register' ? 'login' : 'register');
                  clearError();
                }}
              >
                <Text style={[styles.toggleLink, { color: theme.primary }]}>
                  {authMode === 'register' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Terms */}
          <Text style={[styles.terms, { color: theme.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: theme.primary }}>Terms of Service</Text> and{' '}
            <Text style={{ color: theme.primary }}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  phonePrefix: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  alternativeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  backToEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  backToEmailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
