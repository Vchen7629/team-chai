import { useEffect, useState } from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StepsService } from "../api/steps";
import { UserService } from "../api/user";
import { generateTomorrowDate } from "../utils/datetime";
import { useAuth } from "../context/authContext";
import { Plus } from "lucide-react-native";

interface StepProgressDisplayProps {
    stepCount: number
    stepGoal: number
    sensorAvailable: boolean
    sensorInitializing: boolean
    isTracking: boolean
    onToggle: () => void
    showToggle: boolean
    onStepsAdded?: () => void
}

const StepProgressBar = ({ 
    stepCount, stepGoal, sensorAvailable, isTracking, sensorInitializing, 
    onToggle, showToggle, onStepsAdded 
}: StepProgressDisplayProps) => {
    const progress = stepGoal > 0 ? Math.min(stepCount / stepGoal, 1) : 0
    const percent = Math.round(progress * 100)
    const { username } = useAuth()
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    
    const progressBarColor = () => {
        if (percent <= 75) return 'bg-yellow-400';
        if (75 < percent && percent <= 90) return 'bg-orange-400'
        return 'bg-green-400'
    }

    const buttonText = () => {
        if (sensorInitializing) return 'Starting...'
        if (isTracking && !sensorAvailable) return 'Sensor unavailable'
        
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
                <Text className="text-2xl font-bold mr-2">{stepCount}</Text>
                <Text className="text-sm text-gray-700">{`${percent}%`}</Text>
                {showToggle && (
                    <AddStepsButton setModalVisible={setModalVisible}/>
                )}
            </View>

            {showToggle && (
                <>
                    {/* Progress bar */}
                    <View className="h-4 bg-white/50 rounded-full overflow-hidden mb-3">
                        <View 
                            className={`h-4 ${progressBarColor()} rounded-full`}
                            style={{ width: `${percent}%` }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={onToggle}
                        className={`rounded-full py-2 px-4 self-center ${isTracking ? 'bg-red-400' : 'bg-yellow-300'}`}
                    >
                        <Text className="font-bold text-center">{buttonText()}</Text>
                    </TouchableOpacity>
                </>

            )}
            <AddStepsModal modalVisible={modalVisible} setModalVisible={setModalVisible} onStepsAdded={onStepsAdded}/>
        </View>
    )
}

// testing button — lets users manually add steps without physically walking
const AddStepsButton = ({ setModalVisible }: { setModalVisible: (v: boolean) => void }) => {
    return (
        <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="rounded-full py-1 px-2 ml-2 self-center bg-blue-500 flex-row items-center"
        >
            <Plus size={16} color="white" />
            <Text className="font-bold text-white text-xs ml-1">Add Steps</Text>
        </TouchableOpacity>
    )
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

const AddStepsModal = ({ modalVisible, setModalVisible, onStepsAdded }: { modalVisible: boolean, setModalVisible: (v: boolean) => void, onStepsAdded?: () => void }) => {
    const [input, setInput] = useState('')

    function handleClose() {
        setInput('')
        setModalVisible(false)
    }

    async function handleAddSteps() {
        const steps = parseInt(input)
        if (!steps || steps <= 0) {
            Alert.alert('Invalid', 'Please enter a valid step count')
            return
        }
        try {
            await StepsService.update_user_steps(steps)
            setInput('')
            setModalVisible(false)
            onStepsAdded?.()
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.detail ?? 'Failed to add steps')
        }
    }

    return (
        <Modal
            visible={modalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50 px-8">
                <View className="bg-white rounded-2xl overflow-hidden w-full">
                    <View className="bg-blue-500 px-6 py-4">
                        <Text className="text-white font-bold text-xl text-center">Add Steps</Text>
                    </View>

                    <View className="px-5 py-5">
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Quick Add</Text>
                        <View className="flex-row gap-2 mb-5">
                            {QUICK_AMOUNTS.map(amount => (
                                <TouchableOpacity
                                    key={amount}
                                    onPress={() => setInput(String(amount))}
                                    className={`flex-1 py-2 rounded-full border ${input === String(amount) ? 'bg-blue-500 border-blue-500' : 'bg-white border-blue-300'}`}
                                >
                                    <Text className={`text-center text-xs font-bold ${input === String(amount) ? 'text-white' : 'text-blue-500'}`}>
                                        +{amount >= 1000 ? `${amount / 1000}k` : amount}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Custom Amount</Text>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            keyboardType="numeric"
                            placeholder="Enter steps..."
                            placeholderTextColor="#9ca3af"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-center font-semibold mb-5 bg-gray-50"
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleClose}
                                className="flex-1 bg-gray-100 rounded-full py-3"
                            >
                                <Text className="text-gray-600 font-bold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddSteps}
                                className="flex-1 bg-yellow-400 rounded-full py-3"
                            >
                                <Text className="font-bold text-center">Add Steps</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default StepProgressBar