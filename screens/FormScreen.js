import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';

// 📌 IMPORTANT: CONFIG FILE IMPORT //
import { BASE_URLS } from "../config/apiConfig";

export default function FormScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Dropdown states
    const [env, setEnv] = useState("dev");
    const [showDropdown, setShowDropdown] = useState(false);

    // Base URL from config
    const baseURL = BASE_URLS[env];

    // ================== LOGIN FUNCTION ================== //
    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
                return;
            }

            Alert.alert('Login Success', `Welcome ${data.data?.name || 'User'}`);

            navigation.replace('EmployeeScreen', {
                userId: data.data?.id,
                env: env,                    //  IMPORTANT for next screen APIs
            });

        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Network error. Try again!');
            console.error(error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.outer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.container}>

                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.form}>

                    {/* EMAIL */}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* PASSWORD */}
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {/* LOGIN BUTTON */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    {/* ================== DROPDOWN ================== */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowDropdown(!showDropdown)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {env === "dev" ? "Development" : "Production"}
                            </Text>
                        </TouchableOpacity>

                        {showDropdown && (
                            <View style={styles.dropdownList}>

                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setEnv("dev");
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>Development</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setEnv("prod");
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>Production</Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>

                </View>
            </View>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    outer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 28,
    },
    form: {
        width: '100%',
        maxWidth: 420,
    },

    // ============ DROPDOWN STYLES ============    
    dropdownContainer: {
        width: "100%",
        maxWidth: 420,
        marginTop: 14,
        position: "relative",
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
    },
    dropdownButtonText: {
        fontSize: 16,
        color: "#333",
    },
    dropdownList: {
        position: "absolute",
        top: 55,
        width: "100%",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        zIndex: 10,
        elevation: 3,
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    dropdownItemText: {
        fontSize: 16,
        color: "#333",
    },

    // ============ INPUTS & BUTTONS ============    
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 14,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#E65D36',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
