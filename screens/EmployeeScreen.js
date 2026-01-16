import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

// 📌 IMPORTANT: CONFIG FILE IMPORT //
import { BASE_URLS } from "../config/apiConfig";

export default function EmployeeScreen({ route, navigation }) {

    const [employee, setEmployee] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [appliedLeaves, setAppliedLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = route?.params?.userId;
    const env = route?.params?.env || "dev";

    // Base URL from config
    const baseURL = BASE_URLS[env];

    // ========== FORMAT DATE ==========
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ========== FETCH FUNCTIONS (DEFINE BEFORE useEffect) ==========
    const fetchEmployeeData = async (id) => {
        try {
            console.log("Fetching employee from:", `${baseURL}/api/users/${id}`);
            const response = await fetch(`${baseURL}/api/users/${id}`);
            console.log("Response status:", response.status);
            
            const data = await response.json();

            if (!response.ok) {
                return Alert.alert("Error", "Failed to fetch employee");
            }

            setEmployee({
                name: data.data.name,
                title: data.data.title,
                email: data.data.email,
                shift: data.data.shift,
            });

        } catch (error) {
            console.log("fetchEmployeeData error:", error);
            Alert.alert("Error", error.message || "Network error");
        }
    };

    const fetchLeaveBalance = async (id) => {
        try {
            console.log("Fetching leave balance from:", `${baseURL}/api/leaves/balance/${id}`);
            const response = await fetch(`${baseURL}/api/leaves/balance/${id}`);
            const data = await response.json();

            if (response.ok) {
                setLeaveBalance({
                    SL: data.data.sl,
                    CL: data.data.cl,
                    AL: data.data.al,
                    Others: data.data.others
                });
            }
        } catch (e) {
            console.log("fetchLeaveBalance error:", e);
        }
    };

    const fetchAppliedLeaves = async (id) => {
        setLoading(true);
        try {
            console.log("Fetching applied leaves from:", `${baseURL}/api/leaves/applied/${id}`);
            const response = await fetch(`${baseURL}/api/leaves/applied/${id}`);
            const data = await response.json();

            if (response.ok && Array.isArray(data.data)) {
                const mapped = data.data.map((leave) => ({
                    id: (leave.id ?? leave._id ?? leave.leaveId)?.toString() ?? Math.random().toString(),
                    type: leave.leaveType,
                    from: leave.fromDate,
                    to: leave.toDate,
                    status: leave.status,
                    reason: leave.reason,
                }));

                setAppliedLeaves(mapped);
            } else {
                setAppliedLeaves([]);
            }
        } catch (err) {
            console.log("fetchAppliedLeaves error:", err);
            setAppliedLeaves([]);
        } finally {
            setLoading(false);
        }
    };

    // ========== useEffect (AFTER FUNCTION DEFINITIONS) ==========
    useEffect(() => {
        if (userId) {
            fetchEmployeeData(userId);
            fetchLeaveBalance(userId);
            fetchAppliedLeaves(userId);
        } else {
            Alert.alert('Error', 'User ID not found');
            setLoading(false);
        }
    }, [userId]);

    // ========== CANCEL LEAVE FUNCTION ==========
    const cancelLeave = (leaveId) => {
        if (!leaveId || !userId) {
            return Alert.alert("Error", "Missing leaveId or userId");
        }

        Alert.alert(
            "Confirm Cancel",
            "Are you sure you want to cancel this leave?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${baseURL}/api/leaves/cancel`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ leaveId, userId }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                setAppliedLeaves(prev =>
                                    prev.map(leave =>
                                        leave.id === leaveId ? { ...leave, status: "Cancelled" } : leave
                                    )
                                );
                                Alert.alert("Cancelled", "Leave cancelled successfully");
                            } else {
                                Alert.alert("Error", data.message || "Unable to cancel leave");
                            }

                        } catch (err) {
                            console.log("Cancel Leave Error:", err);
                            Alert.alert("Error", "Server not responding");
                        }
                    },
                },
            ]
        );
    };

    // ========== RENDER ==========
    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#E65D36" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            {/* LOGOUT BUTTON */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: "#E65D36",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                        marginTop: 30,
                    }}
                    onPress={() => {
                        Alert.alert(
                            "Logout",
                            "Are you sure you want to logout?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Yes",
                                    onPress: () => navigation.replace("FormScreen")
                                }
                            ]
                        );
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/*  EMPLOYEE INFO  */}
            <View style={styles.infoBox}>
                <Text style={styles.name}>{employee?.name}</Text>
                <Text style={styles.title}>{employee?.title}</Text>
                <Text style={styles.email}>Email: {employee?.email}</Text>
                <Text style={styles.shift}>Shift: {employee?.shift}</Text>
            </View>

            {/*  LEAVE BALANCE  */}
            <View style={styles.leaveBox}>
                <Text style={styles.sectionTitle}>Leave Balance:</Text>

                {leaveBalance &&
                    Object.entries(leaveBalance).map(([type, value]) => (
                        <Text key={type} style={styles.leaveText}>
                            {type}: {value}
                        </Text>
                    ))}
            </View>

            {/*  APPLY LEAVE  */}
            <View style={styles.formBox}>
                <Text style={styles.sectionTitle}>Apply For Leave:</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                        navigation.navigate("EmployeeLeaveScreen", {
                            userId,
                            env,
                            onLeaveApplied: () => fetchAppliedLeaves(userId),
                        })
                    }
                >
                    <Text style={styles.buttonText}>Submit Leave</Text>
                </TouchableOpacity>
            </View>

            {/*  APPLIED LEAVES  */}
            <View style={styles.listBox}>
                <Text style={styles.sectionTitle}>Applied Leaves:</Text>

                <FlatList
                    data={appliedLeaves}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.leaveItem}>

                            <View style={{ flex: 1 }}>
                                <Text>Type: {item.type}</Text>
                                <Text>From: {formatDate(item.from)}</Text>
                                <Text>To: {formatDate(item.to)}</Text>
                                <Text>Reason: {item.reason}</Text>
                                <Text
                                    style={[
                                        styles.status,
                                        item.status === "Approved"
                                            ? styles.approved
                                            : item.status === "Cancelled"
                                                ? styles.cancelled
                                                : styles.pending,
                                    ]}
                                >
                                    Status: {item.status}
                                </Text>
                            </View>

                            {item.status === "Pending" && (
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => cancelLeave(item.id)}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            </View>

        </ScrollView>
    );
}

// -----css----- //
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    infoBox: {
        paddingTop: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        color: 'gray',
    },
    email: {
        fontSize: 15,
        color: '#444',
        marginTop: 4,
    },
    shift: {
        fontSize: 15,
        color: '#444',
    },
    leaveBox: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
    },
    leaveText: {
        fontSize: 16,
        marginBottom: 4,
    },
    formBox: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#E65D36',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listBox: {
        marginBottom: 20,
    },
    leaveItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#F9F9F9",
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    status: {
        marginTop: 6,
        fontWeight: 'bold',
    },
    approved: { color: 'green' },
    pending: { color: 'orange' },
    cancelled: { color: 'red' },

    cancelButton: {
        backgroundColor: "red",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        height: 35,
        justifyContent: "center",
        alignSelf: "center",
    },
});
