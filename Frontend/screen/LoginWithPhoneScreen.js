import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const LoginWithPhoneScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const handleSendOtp = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3000/send-otp', { phone_number: phoneNumber });
            Alert.alert('Success', response.data.message);
            setIsOtpSent(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3000/verify-otp', { phone_number: phoneNumber, otp });
            Alert.alert('Success', response.data.message);
        } catch (error) {
            Alert.alert('Error', 'Failed to verify OTP');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Phone Number</Text>
            <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                placeholder="Enter Phone Number"
                keyboardType="phone-pad"
            />
            {isOtpSent && (
                <>
                    <Text>OTP</Text>
                    <TextInput
                        value={otp}
                        onChangeText={setOtp}
                        style={styles.input}
                        placeholder="Enter OTP"
                        keyboardType="numeric"
                    />
                    <Button title="Verify OTP" onPress={handleVerifyOtp} />
                </>
            )}
            {!isOtpSent && <Button title="Send OTP" onPress={handleSendOtp} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
});

export default LoginWithPhoneScreen;
