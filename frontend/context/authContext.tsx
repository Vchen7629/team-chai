import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'

interface AuthContextType {
    loggedIn: boolean
    setLoggedIn: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType>({ loggedIn: false, setLoggedIn: () => {} })

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        SecureStore.getItemAsync('session_token').then(token => {
            setLoggedIn(!!token);
        })
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )
} 

export const useAuth = () => useContext(AuthContext)