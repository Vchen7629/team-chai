import { View, Text, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Home, Newspaper, User, LogOut, LogIn, UserPlus } from "lucide-react-native"
import * as SecureStore from "expo-secure-store"
import { useAuth } from "../context/authContext"
import { useNav, Screen } from "../context/navContext"

const BottomNavbar = () => {
    const { loggedIn, setLoggedIn } = useAuth()
    const { currentScreen, navigate } = useNav()
    const insets = useSafeAreaInsets()

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('session_token')
        setLoggedIn(false)
        navigate('Home')
    }

    const iconColor = (screen: Screen) => currentScreen === screen ? '#000000' : '#9ca3af'
    const labelStyle = (screen: Screen) =>
        `text-[10px] mt-0.5 ${currentScreen === screen ? 'text-black font-semibold' : 'text-gray-400'}`

    const loggedInTabs = [
        {
            label: 'Home',
            screen: 'Home' as Screen,
            icon: (active: boolean) => <Home size={24} color={active ? '#000000' : '#9ca3af'} strokeWidth={active ? 2.5 : 1.8} />,
        },
        {
            label: 'Feed',
            screen: 'UserFeed' as Screen,
            icon: (active: boolean) => <Newspaper size={24} color={active ? '#000000' : '#9ca3af'} strokeWidth={active ? 2.5 : 1.8} />,
        },
        {
            label: 'Profile',
            screen: 'UserProfile' as Screen,
            icon: (active: boolean) => <User size={24} color={active ? '#000000' : '#9ca3af'} strokeWidth={active ? 2.5 : 1.8} />,
        },
    ]

    return (
        <View
            style={{ paddingBottom: insets.bottom }}
            className="bg-white border-t border-gray-200 pt-4"
        >
            <View className="flex-row items-center justify-around h-14">
                {loggedIn ? (
                    <>
                        {loggedInTabs.map(({ label, screen, icon }) => {
                            const active = currentScreen === screen
                            return (
                                <Pressable
                                    key={screen}
                                    onPress={() => navigate(screen)}
                                    className="flex-1 items-center justify-center h-full"
                                    android_ripple={{ color: '#f3f4f6', borderless: false }}
                                >
                                    {icon(active)}
                                    <Text className={labelStyle(screen)}>{label}</Text>
                                </Pressable>
                            )
                        })}
                        <Pressable
                            onPress={handleLogout}
                            className="flex-1 items-center justify-center h-full"
                            android_ripple={{ color: '#f3f4f6', borderless: false }}
                        >
                            <LogOut size={24} color="#9ca3af" strokeWidth={1.8} />
                            <Text className="text-[10px] mt-0.5 text-gray-400">Logout</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Pressable
                            onPress={() => navigate('Login')}
                            className="flex-1 items-center justify-center h-full"
                            android_ripple={{ color: '#f3f4f6', borderless: false }}
                        >
                            <LogIn size={24} color={iconColor('Login')} strokeWidth={currentScreen === 'Login' ? 2.5 : 1.8} />
                            <Text className={labelStyle('Login')}>Login</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => navigate('UserSignUp')}
                            className="flex-1 items-center justify-center h-full"
                            android_ripple={{ color: '#f3f4f6', borderless: false }}
                        >
                            <UserPlus size={24} color={iconColor('UserSignUp')} strokeWidth={currentScreen === 'UserSignUp' ? 2.5 : 1.8} />
                            <Text className={labelStyle('UserSignUp')}>Sign Up</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    )
}

export default BottomNavbar
