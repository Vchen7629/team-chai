import { Text, View } from "react-native";
import React, { useState, useEffect } from 'react';
import { CalendarList } from 'react-native-calendars';
import useStepCounter from '../hooks/useStepCounter';
import StepProgressBar from "../components/stepProgressBar";
import { WorkoutLogDisplay, WorkoutLogModal } from "../components/workoutLog";
import { StepsService } from "../api/steps";

const today = new Date().toISOString().split('T')[0]

const UserFeedScreen = () => {
    // calendar
    const [selectedDate, setSelectedDate] = useState(today);

    // notes
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { stepCount, isAvailable, isTracking, isInitializing, toggleTracking } = useStepCounter();
    const [stepGoal, setStepGoal] = useState(0);
    const [savedStepCount, setSavedStepCount] = useState(0);

    const isToday = selectedDate === today;

    useEffect(() => {
        if (!selectedDate) return;
        async function loadDayData() {
            try {
                const goal = await StepsService.fetch_user_step_goal(selectedDate);
                setStepGoal(goal);
            } catch {
                setStepGoal(0);
            }
            try {
                const saved = await StepsService.fetch_user_curr_steps(selectedDate);
                setSavedStepCount(saved);
            } catch {
                setSavedStepCount(0);
            }
        }
        loadDayData();
    }, [selectedDate]);

    return (
        <View className="flex-1 bg-blue-300 pt-12">
            <Text className="p-3 text-xl font-bold"> HI User!</Text>

            <StepProgressBar
                stepCount={isToday ? stepCount : savedStepCount}
                stepGoal={stepGoal}
                isAvailable={isAvailable}
                isTracking={isTracking}
                isInitializing={isInitializing}
                onToggle={toggleTracking}
                showToggle={isToday}
            />

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
                refreshKey={refreshKey}
            />
            <WorkoutLogModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedDate={selectedDate}
                onSave={() => setRefreshKey(k => k + 1)}
            />
        </View>
    );
};

export default UserFeedScreen
