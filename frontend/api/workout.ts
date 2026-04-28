import * as SecureStore from 'expo-secure-store'
import client from './client'
import { WorkoutLog } from '../components/workoutLog'

export const WorkoutService = {
    create_new_workout_log: async(note: string, timestamp: string) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/workout_log/add`, {
            session_token, note, timestamp
        })

        return response.data
    },

    fetch_workout_logs: async(date: string): Promise<WorkoutLog[]> => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/workout_log/fetch`, {session_token, date})

        return response.data
    },

    delete_workout_log: async(id: number) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.delete(`/workout_log/delete`, { 
            data: { session_token, id }
        })

        return response.data
    }
}