import { Redirect } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { useData } from '@/context/DataProvider';

export default function Index() {
    const { user } = useData();
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!user?.Onboarding?.completed) {
            setRedirect(true);
        }
    }, [user]);

    if (redirect) {
        return <Redirect href="/(logged)/onboarding/onboardingSteps" />;
    }

    return <Redirect href="/(logged)" />;

}