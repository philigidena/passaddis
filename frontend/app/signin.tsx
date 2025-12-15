import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, useColorScheme, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { width } = useWindowDimensions();

    const [isSignUp, setIsSignUp] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = () => {
        // Handle authentication
        console.log(isSignUp ? 'Sign Up' : 'Sign In', { phone, password, name });
        router.back();
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

                <View style={[styles.content, { maxWidth: width > 500 ? 400 : '100%' }]}>
                    {/* Logo/Title */}
                    <View style={styles.titleSection}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            {isSignUp
                                ? 'Sign up to book events and shop'
                                : 'Sign in to your PassAddis account'}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {isSignUp && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                                    <Ionicons name="person-outline" size={18} color={theme.icon} />
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        placeholder="Enter your name"
                                        placeholderTextColor={theme.icon}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                                <Ionicons name="call-outline" size={18} color={theme.icon} />
                                <Text style={[styles.phonePrefix, { color: theme.text }]}>+251</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="9XXXXXXXX"
                                    placeholderTextColor={theme.icon}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                                <Ionicons name="lock-closed-outline" size={18} color={theme.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Enter password"
                                    placeholderTextColor={theme.icon}
                                    value={password}
                                    onChangeText={setPassword}
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

                        {!isSignUp && (
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary }]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or continue with</Text>
                        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                            <Ionicons name="logo-google" size={20} color={theme.text} />
                            <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                            <Ionicons name="logo-apple" size={20} color={theme.text} />
                            <Text style={[styles.socialButtonText, { color: theme.text }]}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Toggle Sign In/Up */}
                    <View style={styles.toggleSection}>
                        <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        </Text>
                        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                            <Text style={[styles.toggleLink, { color: theme.primary }]}>
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={[styles.terms, { color: theme.textSecondary }]}>
                        By continuing, you agree to our{' '}
                        <Text style={{ color: theme.primary }}>Terms of Service</Text> and{' '}
                        <Text style={{ color: theme.primary }}>Privacy Policy</Text>
                    </Text>
                </View>
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
    titleSection: {
        marginBottom: 32,
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
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
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
        marginVertical: 28,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggleSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 28,
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
