import Constants from 'expo-constants';

const hostUri = `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:3000/images`;
0
export const envConfig = {
    OPEN_FOOD_FACTS_API_URL: process.env.EXPO_PUBLIC_OPEN_FOOD_FACTS_API_URL,
    IMAGE_SERVER_URL: hostUri
}
