import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  FadeIn
} from 'react-native-reanimated';

interface StepsIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepsIndicator: React.FC<StepsIndicatorProps> = ({ currentStep, totalSteps }) => {


  return (
    <View style={styles.stepsContainer}>
      <View style={styles.stepsIndicator}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View style={styles.circleContainer}>
              <View
                style={[
                  styles.circle,
                  index <= currentStep ? styles.activeCircle : styles.inactiveCircle,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    index <= currentStep
                      ? styles.activeCircleText
                      : styles.inactiveCircleText,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: index < currentStep ? '#28A745' : '#D0D0D0' },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeCircle: {
    backgroundColor: '#28A745',
  },
  inactiveCircle: {
    backgroundColor: '#D0D0D0',
  },
  activeCircleText: {
    color: '#FFFFFF',
  },
  inactiveCircleText: {
    color: '#666666',
  },
  line: {
    width: 40,
    height: 4,
    marginHorizontal: 4,
  },
});

export default StepsIndicator;

