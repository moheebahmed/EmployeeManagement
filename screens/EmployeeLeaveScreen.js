import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
// 📌 IMPORTANT: CONFIG FILE IMPORT //
import { BASE_URLS } from "../config/apiConfig";

export default function EmployeeLeaveScreen({ route, navigation }) {

    const userId = route.params?.userId;
    const env = route.params?.env || "dev";  
    const onLeaveApplied = route.params?.onLeaveApplied;

    const [type, setType] = useState("CL");  // leave type //
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [reason, setReason] = useState("");
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    // Base URL from config
    const baseURL = BASE_URLS[env];

    const getNumberOfDays = () => {
        const diffTime = Math.abs(toDate - fromDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const submitLeave = async () => {
        if (!reason.trim()) return Alert.alert("Error", "Please enter a reason");

        try {
            const response = await fetch(`${baseURL}/api/leaves/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    leaveType: type,
                    fromDate: fromDate.toISOString().split("T")[0],
                    toDate: toDate.toISOString().split("T")[0],
                    numberOfDays: getNumberOfDays(),
                    reason,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Leave submitted successfully!");
                onLeaveApplied?.();
                navigation.goBack();
            } else {
                Alert.alert("Error", data.message || "Something went wrong");
            }
        } catch (error) {
            console.log("Apply Leave Error:", error);
            Alert.alert("Error", "Unable to connect to server");
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>

                <Text style={styles.title}>Apply Leave</Text>

                <Text style={styles.label}>Leave Type (CL / SL / AL)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter leave type"
                    value={type}
                    onChangeText={setType}
                />

                <Text style={styles.label}>From Date</Text>
                <TouchableOpacity style={styles.dateBox} onPress={() => setShowFromPicker(true)}>
                    <Text>{fromDate.toDateString()}</Text>
                </TouchableOpacity>
                {showFromPicker && (
                    <DateTimePicker
                        value={fromDate}
                        mode="date"
                        onChange={(e, d) => { setShowFromPicker(false); if (d) setFromDate(d); }}
                    />
                )}

                <Text style={styles.label}>To Date</Text>
                <TouchableOpacity style={styles.dateBox} onPress={() => setShowToPicker(true)}>
                    <Text>{toDate.toDateString()}</Text>
                </TouchableOpacity>
                {showToPicker && (
                    <DateTimePicker
                        value={toDate}
                        mode="date"
                        onChange={(e, d) => { setShowToPicker(false); if (d) setToDate(d); }}
                    />
                )}

                <Text style={styles.label}># of Days</Text>
                <View style={styles.dateBox}>
                    <Text>{getNumberOfDays()}</Text>
                </View>

                <Text style={styles.label}>Reason</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Enter reason"
                    value={reason}
                    onChangeText={setReason}
                    multiline
                />

                <View style={styles.row}>
                    <TouchableOpacity style={styles.applyBtn} onPress={submitLeave}>
                        <Text style={styles.btnText}>Apply</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </TouchableWithoutFeedback>
    );
}


// -----css----- //
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginTop: "40", marginBottom: 20 },
    label: { fontSize: 16, marginTop: 10, fontWeight: "bold" },
    input: { backgroundColor: "#eee", borderRadius: 8, marginTop: 5 },
    dateBox: {
        padding: 12,
        backgroundColor: "#eee",
        borderRadius: 8,
        marginTop: 5
    },
    textArea: {
        backgroundColor: "#eee",
        padding: 12,
        borderRadius: 10,
        height: 100,
        marginTop: 5
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20
    },
    applyBtn: {
        backgroundColor: "#E65D36",
        padding: 14,
        borderRadius: 10,
        width: "48%",
        alignItems: "center"
    },
    cancelBtn: {
        backgroundColor: "#333",
        padding: 14,
        borderRadius: 10,
        width: "48%",
        alignItems: "center"
    },
    btnText: { color: "#fff", fontWeight: "bold" }
});
