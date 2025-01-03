import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleForgotPassword = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3000/forgot-password', { email });
            Alert.alert('Success', response.data.message);
            navigation.navigate('ResetPassword'); // Navigate to Reset Password screen
        } catch (error) {
            Alert.alert('Error', 'Failed to send reset link. Make sure your email is registered.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Enter your registered email:</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
            />
            <Button title="Send Reset Link" onPress={handleForgotPassword} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
});

export default ForgotPasswordScreen;
