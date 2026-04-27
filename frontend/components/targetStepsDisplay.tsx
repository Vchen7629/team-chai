import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { StepsService } from "../api/steps";

const TargetStepsDisplay = ({ selectedDate }: { selectedDate: string }) => {
    const [stepGoal, setStepGoal] = useState(0);

    useEffect(() => {
        if (!selectedDate) return;
        async function loadStepGoal(selectedDate: string) {
            try {
                const stepGoalData = await StepsService.fetch_user_steps(selectedDate);
                setStepGoal(stepGoalData);
            } catch (e) {
                setStepGoal(0);
            }
        };
        loadStepGoal(selectedDate);
    }, [selectedDate])

    return (
        <View className="flex-1 border border-white/10 rounded-lg">
            <Text className="font-bold text-center p-3 bg-red-400 border-white/30 rounded-lg">Step Goal</Text>
            <Text className="border border-white/40 rounded-xl font-bold p-3 justify-evenly text-center text-2xl">
                {stepGoal}
            </Text>
        </View>
    )
}

export default TargetStepsDisplay