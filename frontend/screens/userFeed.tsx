import { Text, View } from "react-native";
import React, { useState, useEffect } from 'react';
import { CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage'; //<-saving/loading notes, stepGoal
import useStepCounter from '../hooks/useStepCounter';
import TargetStepsDisplay from "../components/targetStepsDisplay";
import { WorkoutLogDisplay, WorkoutLogModal } from "../components/workoutLogComponents";

export interface Reminder {
    id: number
    date: string
    time: string
    note: string
}

const today = new Date().toISOString().split('T')[0]

const UserFeedScreen = () => {
    // calendar
    const [selectedDate, setSelectedDate] = useState(today);

    // notes
    const [modalVisible, setModalVisible] = useState(false);
    const [reminders, setReminders] = useState<Reminder[]>([]);

    const {stepCount, isAvailable} = useStepCounter();

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const stored = await AsyncStorage.getItem('reminders');
            if(stored) setReminders(JSON.parse(stored));
        }
        catch (e) {
            console.error('Failed to load reminders...', e);
        }
    };

    return (
        <View className="flex-1 bg-blue-300 pt-12">
            <Text className="p-3 text-xl font-bold"> HI User!</Text>

            <View className="flex-row pb-1">
                <View className="flex-1">
                    <Text className="font-bold text-center py-3 bg-yellow-300 rounded-lg">Current Steps</Text>
                    <View className="p-6 justify-center">
                        { isAvailable ? (
                            <Text className=" text-2xl font-bold text-center">{stepCount}</Text>
                            ) : (
                            <Text className=" text-2xl font-bold text-center">Not available</Text>
                            )
                    }
                </View>
                </View>
                <TargetStepsDisplay selectedDate={selectedDate}/>
            </View>

            <CalendarList
                horizontal={true}
                pagingEnabled={true}
                calendarHeight={150}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: {
                        selected: true,
                        dotColor: 'blue'
                    }
                }}
            />
            <WorkoutLogDisplay 
                selectedDate={selectedDate}
                setModalVisible={setModalVisible}
                reminders={reminders}
                setReminders={setReminders}
            />
            <WorkoutLogModal 
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedDate={selectedDate}
                reminders={reminders}
                setReminders={setReminders}
            />
        </View>
    );
};

export default UserFeedScreen