import { Text, View } from "react-native"

const HomeScreen = () => {
    return (
        <View className="flex flex-col w-full h-full items-center justify-center">
            <View className="mb-8">
                <Text className="text-4xl font-bold text-blue-600 mb-8 text-center">
                    <Text>Welcome to HealthIQ</Text>
                    <Text></Text>
                    <Text></Text>
                    <Text></Text>
                </Text>
            </View>

            <View className="space-y-4 w-full items-center">
                <Text className="text-lg text-gray-600">
                    New User? Select <Text className="font-semibold">"Sign Up"</Text>
                </Text>
                <Text className="text-lg text-gray-600">
                    Returning User? Select <Text className="font-semibold">"Login"</Text>
                </Text>
            </View>
        </View>
    )
}

export default HomeScreen
