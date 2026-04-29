import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { StepsService } from '../api/steps';
import { generateTodayDate } from '../utils/datetime';

const today = generateTodayDate()

const useStepCounter = () => {
    const [sensorCount, setSensorCount] = useState(0);
    const [sensorAvailable, setSensorAvailable] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const subscriptionRef = useRef<any>(null);
    const sensorDelta = useRef(0);

    

    async function stopAndSave() {
        clearSubscription();
        if (sensorDelta.current > 0) {
            try {
                await StepsService.update_user_steps(sensorDelta.current);
            } catch (e) {
                console.error("failed to save steps", e);
            }
            sensorDelta.current = 0;
        }
    }

    async function startTracking() {
        setIsInitializing(true);
        const available = await Pedometer.isAvailableAsync();
        setSensorAvailable(available);
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsInitializing(false);

        if (!available) return;

        const baseline = await StepsService.fetch_user_curr_steps(today);
        setSensorCount(baseline);
        sensorDelta.current = 0;

        subscriptionRef.current = Pedometer.watchStepCount(result => {
            sensorDelta.current = result.steps;
            setSensorCount(baseline + result.steps);
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
            stopAndSave();
        } else {
            startTracking();
        }
        return () => { clearSubscription(); };
    }, [isTracking]);

    const toggleTracking = () => setIsTracking(prev => !prev);

    return { sensorCount, sensorAvailable, isTracking, isInitializing, toggleTracking };
};

export default useStepCounter;
