import { View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./context/authContext"
import { NavProvider, useNav } from "./context/navContext"
import BottomNavbar from "./components/navbar"
import HomeScreen from "./screens/home"
import LoginScreen from "./screens/login"
import UserFeedScreen from "./screens/userFeed"
import UserProfileScreen from "./screens/userProfile"
import UserSignUpScreen from "./screens/userSignUp"
import { JSX } from "react"

const AppScreens = () => {
    const { currentScreen } = useNav()

    const screens: Record<string, JSX.Element> = {
        Home: <HomeScreen />,
        Login: <LoginScreen />,
        UserFeed: <UserFeedScreen />,
        UserProfile: <UserProfileScreen />,
        UserSignUp: <UserSignUpScreen />,
    }

    return (
        <View className="flex-1">
            {screens[currentScreen]}
        </View>
    )
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavProvider>
                    <View className="flex-1">
                        <AppScreens />
                        <BottomNavbar />
                    </View>
                </NavProvider>
            </AuthProvider>
        </SafeAreaProvider>
    )
}
