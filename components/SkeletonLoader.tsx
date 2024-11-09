import { useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const SkeletonLoader = () => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        };

        startAnimation();
        return () => animatedValue.stopAnimation();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const ShimmerItem = () => (
        <View style={styles.skeletonItem}>
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }]
                    }
                ]}
            />
            <View style={styles.skeletonContent}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonText} />
                <View style={styles.skeletonPrice} />
            </View>
        </View>
    );

    return (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((item) => (
                <ShimmerItem key={item} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonContainer: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    skeletonItem: {
        width: 140,
        height: 140,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    skeletonContent: {
        padding: 8,
        height: '100%',
        justifyContent: 'space-between',
    },
    skeletonImage: {
        width: '100%',
        height: 100,
        backgroundColor: '#D0D8DD',
        borderRadius: 4,
    },
    skeletonText: {
        width: '80%',
        height: 12,
        backgroundColor: '#D0D8DD',
        borderRadius: 2,
        marginTop: 8,
    },
    skeletonPrice: {
        width: '40%',
        height: 12,
        backgroundColor: '#D0D8DD',
        borderRadius: 2,
        marginTop: 4,
    },
    shimmer: {
        width: '60%',
        height: '100%',
        backgroundColor: '#D0D8DD',
        opacity: 0.2,
        transform: [{ skewX: '-20deg' }],
        position: 'absolute',
    },
});