import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { login } from './api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';

GoogleSignin.configure({
    webClientId: '28796596857-tatpkvtr1lvt042l6ecdpumg1godoa30.apps.googleusercontent.com',  // Your Google Client ID
  });
  

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateInputs = () => {
        let isValid = true;

        // Reset errors
        setEmailError('');
        setPasswordError('');

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError('Enter a valid email address.');
            isValid = false;
        }

        // Validate password
        if (!password) {
            setPasswordError('Password is required.');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;

        try {
            const response = await login(email, password);
            Alert.alert('Success', response.message);
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please check your credentials.');
        }
    };


    const handleGoogleSignIn = async () => {
        try {
            const { idToken } = await GoogleSignin.signIn();
            const response = await axios.post('http://10.0.2.2:3000/google-login', { tokenId: idToken });
            Alert.alert('Success', response.message);
        } catch (error) {
          Alert.alert('Error','Sign-In Failed');
    };
};

   

    return (
        <View style={styles.container}>
            <Text>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text>Password</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

             <TouchableOpacity onPress={() => navigation.navigate('LoginWithPhone')}>
                                <Text style={styles.forgotPasswordText}>Login with Phone Number</Text>
                            </TouchableOpacity>
            
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
            
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.forgotPasswordText}>New User! Signup</Text>
                            </TouchableOpacity>
            
            
                            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                      <Text style={styles.buttonText}>Login</Text>
                            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: 'blue',
        textAlign: 'center',
        marginBottom: 20,
    },
    linkText: {
        color: '#191970',
        textAlign: 'center',
        marginTop: 10,
    },
    button: {
        backgroundColor: "#191970",
        paddingVertical: 15,
        borderRadius: 8,
      },
      buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
      },
});

export default LoginScreen;
