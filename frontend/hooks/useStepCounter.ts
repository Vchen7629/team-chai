import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { StepsService } from '../api/steps';
import { generateTodayDate } from '../utils/datetime';

const useStepCounter = () => {
    const [stepCount, setStepCount] = useState<number>(0);
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(false);
    const subscriptionRef = useRef<any>(null);
    const stepsGainedDelta = useRef<number>(0); // steps counted in between start and stop

    async function stopAndSave() {
        clearSubscription()

        // updating database after we stop tracking
        if (stepsGainedDelta.current > 0) {
            try {
                await StepsService.update_user_steps(stepsGainedDelta.current)
            } catch (e) {
                console.error("failed to save steps", e)
            }
            stepsGainedDelta.current = 0
        }
    }

    async function startTracking() {
        // Check if pedometer is available on this device
        setIsInitializing(true)
        const available = await Pedometer.isAvailableAsync();

        setIsAvailable(available);
        await new Promise(resolve => setTimeout(resolve, 400)); // short delay to get rid of delay

        setIsInitializing(false)

        if (!available) return

        // Get steps from midnight to now
        const today = generateTodayDate()
        let baseline = 0;
        try {
            baseline = await StepsService.fetch_user_curr_steps(today)
        } catch {
            baseline = 0
        }

        setStepCount(baseline);
        stepsGainedDelta.current = 0

        // watchStepCount returns steps since subscription start, so add to baseline
        subscriptionRef.current = Pedometer.watchStepCount(result => {
            stepsGainedDelta.current = result.steps
            setStepCount(baseline + result.steps);
        });
    }

    function clearSubscription() {
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
    }

    useEffect(() => {
        if (!isTracking) {
            stopAndSave()
        } else (
            startTracking()
        )

        // Cleanup when component unmounts
        return () => {
            clearSubscription()
        };
    }, [isTracking]);

    const toggleTracking = () => setIsTracking(prev => !prev);

    return { stepCount, isAvailable, isTracking, isInitializing, toggleTracking };
};

export default useStepCounter;