import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ResetPasswordScreen = ({ navigation }) => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleResetPassword = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3000/reset-password', {
                token,
                newPassword,
            });
            Alert.alert('Success', response.data.message);
            navigation.navigate('Login'); // Navigate back to Login screen
        } catch (error) {
            Alert.alert('Error', 'Failed to reset password. Make sure the token is valid.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Enter the reset token from your email:</Text>
            <TextInput
                style={styles.input}
                value={token}
                onChangeText={setToken}
                placeholder="Reset Token"
            />
            <Text style={styles.label}>Enter your new password:</Text>
            <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                secureTextEntry
            />
            <Button title="Reset Password" onPress={handleResetPassword} />
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

export default ResetPasswordScreen;
