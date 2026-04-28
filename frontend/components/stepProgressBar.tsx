import { Text, TouchableOpacity, View } from "react-native";

interface StepProgressDisplayProps {
    stepCount: number
    stepGoal: number
    isAvailable: boolean
    isTracking: boolean
    onToggle: () => void
}

const StepProgressBar = ({ stepCount, stepGoal, isAvailable, isTracking, onToggle }: StepProgressDisplayProps) => {
    const progress = stepGoal > 0 ? Math.min(stepCount / stepGoal, 1) : 0
    const percent = Math.round(progress * 100)

    return (
        <View className="mx-3 mb-2 bg-white/30 rounded-xl p-3">
            <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-sm">Today's Steps</Text>
                <Text className="font-bold text-sm">Goal: {stepGoal ? stepGoal : "No goal set for this date"}</Text>
            </View>

            <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold mr-2">
                    {isAvailable ? stepCount : "-"}
                </Text>
                <Text className="text-sm text-gray-700">{isAvailable ? `${percent}%` : 'Sensor unavailable'}</Text>
            </View>

            {/* Progress bar */}
            <View className="h-4 bg-white/50 rounded-full overflow-hidden mb-3">
                <View 
                    className="h-4 bg-yellow-400 rounded-full"
                    style={{ width: `${percent}%` }}
                />
            </View>

            <TouchableOpacity
                onPress={onToggle}
                className={`rounded-full py-2 px-4 self-center ${isTracking ? 'bg-red-400' : 'bg-yellow-300'}`}
            >
                <Text className="font-bold text-center">
                    {isTracking ? 'Pause Tracking' : 'Start Tracking'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default StepProgressBar