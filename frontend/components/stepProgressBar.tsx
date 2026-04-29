import { useEffect } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { StepsService } from "../api/steps";
import { UserService } from "../api/user";
import { generateTomorrowDate } from "../utils/datetime";
import { useAuth } from "../context/authContext";

interface StepProgressDisplayProps {
    stepCount: number
    stepGoal: number
    isAvailable: boolean
    isTracking: boolean
    isInitializing: boolean
    onToggle: () => void
    showToggle: boolean
}

const StepProgressBar = ({ stepCount, stepGoal, isAvailable, isTracking, isInitializing, onToggle, showToggle }: StepProgressDisplayProps) => {
    const progress = stepGoal > 0 ? Math.min(stepCount / stepGoal, 1) : 0
    const percent = Math.round(progress * 100)
    const { username } = useAuth()

    const buttonText = () => {
        if (isInitializing) return 'Starting...'
        if (isTracking && !isAvailable) return 'Sensor unavailable'
        
        return isTracking ? 'Stop Tracking' : 'Start Tracking'
    }

    async function newStepGoal() {
        if (percent != 100) return

        try {
            await UserService.update_fitness_metrics()

            const fitnessData = await UserService.fetch_fitness_data()

            const newStepGoal = await StepsService.create_new_step_goal(
                String(fitnessData.age), 
                String(fitnessData.weight), 
                String(Math.floor(fitnessData.heightin / 12)),
                String(fitnessData.heightin % 12),
                fitnessData.gender, 
                fitnessData.activityLevel,
                fitnessData.avg_steps_7_days,
                fitnessData.goal_hit_rate
            )

            const nextDay = generateTomorrowDate()

            await StepsService.add_new_step_goal(username, newStepGoal, nextDay)
        } catch (err: any) {
            const msg = err.response?.data?.detail ?? "Something went wrong";
            Alert.alert('Error', msg)
        }
    }

    useEffect(() => {
        newStepGoal()
    }, [percent])

    return (
        <View className="mx-3 mb-2 bg-white/30 rounded-xl p-3">
            <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-sm">Today's Steps</Text>
                <Text className="font-bold text-sm">Goal: {stepGoal ? stepGoal : "No goal set for this date"}</Text>
            </View>

            <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold mr-2">
                    {isAvailable ? stepCount : 0}
                </Text>
                <Text className="text-sm text-gray-700">
                    {`${percent}%`}
                </Text>
            </View>

            {/* Progress bar */}
            <View className="h-4 bg-white/50 rounded-full overflow-hidden mb-3">
                <View 
                    className="h-4 bg-yellow-400 rounded-full"
                    style={{ width: `${percent}%` }}
                />
            </View>

            {showToggle && (
                <TouchableOpacity
                    onPress={onToggle}
                    className={`rounded-full py-2 px-4 self-center ${isTracking ? 'bg-red-400' : 'bg-yellow-300'}`}
                >
                    <Text className="font-bold text-center">{buttonText()}</Text>
                </TouchableOpacity>

            )}
        </View>
    )
}

export default StepProgressBar