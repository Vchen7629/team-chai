import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

const useStepCounter = () => {
    const [stepCount, setStepCount] = useState<number>(0);
    const [isAvailable, setIsAvailable] = useState<boolean>(false);

    useEffect(() => {
        let subscription: any;

        const subscribe = async (): Promise<void> => {
            // Check if pedometer is available on this device
            const available = await Pedometer.isAvailableAsync();
            setIsAvailable(available);

            if (available) {
                // Get steps from midnight to now
                const start = new Date();
                start.setHours(0, 0, 0, 0);
                const end = new Date();

                const { steps } = await Pedometer.getStepCountAsync(start, end);
                setStepCount(steps);

                // Passively watch for new steps
                subscription = Pedometer.watchStepCount(result => {
                    setStepCount(result.steps);
                });
            }
        };

        subscribe();

        // Cleanup when component unmounts
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    return { stepCount, isAvailable };
};

export default useStepCounter;