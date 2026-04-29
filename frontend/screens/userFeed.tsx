import { Text, View } from "react-native";
import { useState, useEffect } from 'react';
import { CalendarList } from 'react-native-calendars';
import useStepCounter from '../hooks/useStepCounter';
import StepProgressBar from "../components/stepProgressBar";
import { WorkoutLogDisplay, WorkoutLogModal } from "../components/workoutLog";
import { generateTodayDate } from "../utils/datetime";
import { useAuth } from "../context/authContext";
import useStepData from "../hooks/useStepData";

const today = generateTodayDate()

const UserFeedScreen = () => {
    const { username } = useAuth()
    // calendar
    const [selectedDate, setSelectedDate] = useState(today);

    // notes
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { sensorCount, sensorAvailable, isTracking, isInitializing, toggleTracking } = useStepCounter();
    const { displayCount, stepGoal, loadStepData } = useStepData(isTracking, sensorCount);

    const isToday = selectedDate === today;

    useEffect(() => {
        if (!selectedDate) return;
        loadStepData(selectedDate);
    }, [selectedDate]);

    return (
        <View className="flex-1 bg-blue-300 pt-12">
            <Text className="p-3 text-xl font-bold"> HI {username}!</Text>

            <StepProgressBar
                stepCount={displayCount}
                stepGoal={stepGoal}
                sensorAvailable={sensorAvailable}
                isTracking={isTracking}
                isInitializing={isInitializing}
                onToggle={toggleTracking}
                showToggle={isToday}
                onStepsAdded={() => loadStepData(today)}
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
