import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Text, TextInput, View, TouchableOpacity, ScrollView, Modal, Keyboard } from "react-native";
import React, { useState, useEffect } from 'react';
import { CalendarList } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker'; //<- wheel for setting note time
import AsyncStorage from '@react-native-async-storage/async-storage'; //<-saving/loading notes, stepGoal
import useStepCounter from '../hooks/useStepCounter';
import TargetStepsDisplay from "../components/targetStepsDisplay";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserFeed'>;

const UserFeedScreen = () => {
    // calendar
    const [selectedDate, setSelectedDate] = useState('');

    // notes
    const [modalVisible, setModalVisible] = useState(false);
    const [note, setNote] = useState('');
    const [reminders, setReminders] = useState([]);

    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');

    const {stepCount, isAvailable} = useStepCounter();

    const [username, setUsername] = useState('');

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

    const saveReminder = async () => {
        if(!selectedDate || !note){
            alert('Please select a date on the calendar and enter a note')
            return;
        }
        try {
            const newReminder = {
                id: Date.now(),
                date: selectedDate,
                time: `${hour}:${minute} ${period}`,
                note: note
            };
            const updated = [...reminders, newReminder];

            await AsyncStorage.setItem('reminders', JSON.stringify(updated));
            setReminders(updated);

            setNote('');
            setHour('12');
            setMinute('00');
            setPeriod('AM');
            setModalVisible(false);
        }
        catch(e) {
            console.error('Failed to save reminder', e)
        }

    };

    const deleteReminder = async (id) => {
        try {
            const updated = reminders.filter(r => r.id !== id);
            await AsyncStorage.setItem('reminders', JSON.stringify(updated));
            setReminders(updated);
        }
        catch (e) {
            console.error('Failed to delete reminder', e)
        }
    };

    return (
        <View className="flex-1 bg-blue-300">
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
                        selectedDotColor: 'blue'
                    }
                }}
             />

            <View className=" h-screen bg-blue-300">
                <View className="flex-row">
                    <Text className="text-center text-2xl py-3 flex-1 ml-8 font-light">Workout Log</Text>
                    <TouchableOpacity className="bg-blue-500 rounded-full m-2 p-2"
                        onPress={() => setModalVisible(true)}
                    >
                        <Text className="text-center text-white w-5">+</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView>
                    { selectedDate ? (
                        reminders.filter(r => r.date === selectedDate).length === 0 ? (
                            <Text className="text-center rounded-lg p-6 bg-yellow-200 font-light">No workouts logged for this day</Text>
                        ) : (
                            reminders
                                .filter(r=> r.date === selectedDate)
                                .map(reminder => (
                                <View key={reminder.id} className="flex-row rounded-lg bg-yellow-200 p-4 mb-1">
                                    <Text className="w-18 p-2 font-medium">{reminder.time}:</Text>
                                    <Text className="flex-1 justify-center p-2 "> {reminder.note}</Text>
                                    <TouchableOpacity onPress={() => deleteReminder(reminder.id)}>
                                        <Text className="bg-red-400 text-white w-10 p-2 rounded-xl text-center">×</Text>
                                    </TouchableOpacity>
                                </View>
                                ))
                            )
                        ) : (
                            <Text className="text-center rounded-lg p-6 bg-yellow-200">No date selected</Text>
                    )}
                </ScrollView>
            </View>

            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 pt-32 bg-black/50">
                    <View className=" bg-green-500 rounded-lg">
                        <View className="items-center">
                            <Text className="font-bold p-5 text-2xl">Add Workout Log</Text>
                        </View>
                        <View className="bg-green-300 py-3 items-center ">
                            <Text className="font-medium">
                                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    }) :
                                    'No date selected'
                                }
                            </Text>
                        </View>
                    </View>



                    <View className="bg-gray-100 py-3 px-2">
                        <Text className="font-semibold">Time:</Text>
                    </View>

                    <View className="border border-gray-200">
                        <View className="bg-gray-100 pb-4 px-2 flex-row">
                            <View className=" flex-row flex-1 justify-evenly">
                                <Picker
                                    selectedValue={hour}
                                    onValueChange={(val) => setHour(val)}
                                    style={{ width: 100 }}
                                    itemStyle={{ height: 110}}
                                >
                                {Array.from({ length: 12 }, (_, i) => {
                                    const h = String(i + 1).padStart(2, '0');
                                    return <Picker.Item key={h} label={h} value={h} color="black" />;
                                })}
                                </Picker>
                                <Text className="text-2xl self-center">:</Text>

                                            {/* Minutes */}
                                <Picker
                                    selectedValue={minute}
                                    onValueChange={(val) => setMinute(val)}
                                    style={{ width: 100 }}
                                    itemStyle={{ height: 110}}
                                >
                                    {['00', '10', '20', '30', '40', '50'].map(m => (
                                    <Picker.Item key={m} label={m} value={m} color="black" />
                                    ))}
                                </Picker>

                                            {/* AM/PM */}
                                <Picker
                                    selectedValue={period}
                                    onValueChange={(val) => setPeriod(val)}
                                    style={{ width: 100 }}
                                    itemStyle={{ height: 110}}
                                >
                                    <Picker.Item label="AM" value="AM" color="black"/>
                                    <Picker.Item label="PM" value="PM" color="black"/>
                                </Picker>
                            </View>
                        </View>

                        <View className="bg-gray-100 py-2 px-2 border border-gray-200">
                            <Text className="font-semibold w-12">Note:</Text>
                            <TextInput
                                value={note}
                                onChangeText={setNote}
                                placeholder="Enter note..."
                                placeholderTextColor='gray'
                                onSubmitEditing={() => {
                                    saveReminder();
                                    Keyboard.dismiss()
                                }}
                                className="border border-gray-300 rounded-xl p-3 text-base mt-3 justify-evenly"
                            />
                            <View className="rounded-xl flex-row justify-evenly my-2 p-4 bg-green-300">
                                <TouchableOpacity
                                    className="bg-red-500 rounded-full w-15 p-2 justify-center"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="font-semibold">Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-green-500 rounded-full w-15 p-2 justify-center"
                                    onPress={() => saveReminder()}
                                >
                                    <Text className="font-semibold">Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

    // Idk if we should make a new screen when the user clicks on the day in the calendar on user feed screen
    // to expand or just make that a component
};

export default UserFeedScreen