import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const client = axios.create({
    // this is my own private network machine ip, prob need to change it for yours 
    // by typing in ipconfig.
    baseURL: "http://10.0.0.229:8001"
})

// this is to attach the session token to every request for backend auth
client.interceptors.request.use(async (config) => {
    const sessionToken = await SecureStore.getItemAsync('session_token')
    if (sessionToken) {
        config.headers.Authorization = `Bearer ${sessionToken}`
    }
    return config
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            SecureStore.deleteItemAsync('session_token')
        }
        return Promise.reject(error)
    }
)

export default client