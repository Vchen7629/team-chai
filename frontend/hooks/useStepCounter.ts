import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';

const useStepCounter = () => {
    const [stepCount, setStepCount] = useState<number>(0);
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        const subscribe = async (): Promise<void> => {
            if (!isTracking) {
                if (subscriptionRef.current) {
                    subscriptionRef.current.remove()
                    subscriptionRef.current = null
                }
                return
            }
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
                subscriptionRef.current = Pedometer.watchStepCount(result => {
                    setStepCount(result.steps);
                });
            }
        };

        subscribe();

        // Cleanup when component unmounts
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
        };
    }, [isTracking]);

    const toggleTracking = () => setIsTracking(prev => !prev);

    return { stepCount, isAvailable, isTracking, toggleTracking};
};

export default useStepCounter;