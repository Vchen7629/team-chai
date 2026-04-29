import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import * as SecureStore from 'expo-secure-store'

interface AuthContextType {
    loggedIn: boolean
    setLoggedIn: (value: boolean) => void
    username: string,
    setUsername: (value: string) => void
}

const AuthContext = createContext<AuthContextType>({ 
    loggedIn: false, setLoggedIn: () => {},
    username: '', setUsername: () => {}
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState<boolean>(false)
    const [username, setUsername] = useState<string>('')

    useEffect(() => {
        Promise.all([
            SecureStore.getItemAsync('session_token'),
            SecureStore.getItemAsync('username')
        ]).then(([token, storedUsername]) => {
            setLoggedIn(!!token);
            if (storedUsername) setUsername(storedUsername)
        })
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn, username, setUsername }}>
            {children}
        </AuthContext.Provider>
    )
} 

export const useAuth = () => useContext(AuthContext)