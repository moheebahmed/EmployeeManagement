import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Start fade + scale animations //
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
        const timer = setTimeout(() => {
            navigation.replace('FormScreen'); // <-- important line --> //
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require('../assets/logo.png')}
                style={{
                    width: 120,
                    height: 120,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

