import { useEffect, useRef, useState } from "react";
import { StepsService } from "../api/steps";
import { generateTodayDate } from "../utils/datetime";

const today = generateTodayDate()

const useStepData = (isTracking: boolean, sensorCount: number) => {
    const [stepGoal, setStepGoal] = useState(0);
    const [savedStepCount, setSavedStepCount] = useState(0);
    const trackingBaseline = useRef(0);

    useEffect(() => {
        if (isTracking) {
            trackingBaseline.current = savedStepCount;
        } else {
            loadStepData(today);
        }
    }, [isTracking]);

    async function loadStepData(date: string) {
        try {
            const goal = await StepsService.fetch_user_step_goal(date);
            setStepGoal(goal);
        } catch {
            setStepGoal(0);
        }
        try {
            const saved = await StepsService.fetch_user_curr_steps(date);
            setSavedStepCount(saved);
        } catch {
            setSavedStepCount(0);
        }
    }

    // savedStepCount is the backend total (includes manual adds)
    // sensorCount - trackingBaseline isolates only the new steps since tracking started to prevent double-counting 
    const displayCount = isTracking
        ? savedStepCount + (sensorCount - trackingBaseline.current)
        : savedStepCount;

    return { displayCount, stepGoal, loadStepData };
}

export default useStepData