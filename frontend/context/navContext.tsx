import { createContext, ReactNode, useContext, useState } from "react"

export type Screen = 'Home' | 'Login' | 'UserFeed' | 'UserProfile' | 'UserSignUp'

interface NavContextType {
    currentScreen: Screen
    navigate: (screen: Screen) => void
}

const NavContext = createContext<NavContextType>({
    currentScreen: 'Home',
    navigate: () => {},
})

export const NavProvider = ({ children }: { children: ReactNode }) => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('Home')

    return (
        <NavContext.Provider value={{ currentScreen, navigate: setCurrentScreen }}>
            {children}
        </NavContext.Provider>
    )
}

export const useNav = () => useContext(NavContext)
