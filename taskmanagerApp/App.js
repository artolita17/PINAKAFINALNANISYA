import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import {
  app,
  db,
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  updateDoc,
  doc,
} from "./firebase/index";
import TaskItems from "./components/taskItems";

export default function App() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Add a new task
  const addTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Task title is required.");
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert("Validation Error", "Please set a due date for the task.");
      return;
    }
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        isChecked: false, // New task is not checked initially
        createdAt: new Date(),
        dueDate,
      });
      setTitle("");
      setDueDate("");
      fetchTasks();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Edit an existing task
  const editTask = async (taskId, updatedTitle, updatedDueDate) => {
    if (!updatedTitle.trim()) {
      Alert.alert("Validation Error", "Task title is required.");
      return;
    }
    if (!updatedDueDate.trim()) {
      Alert.alert("Validation Error", "Please set a due date for the task.");
      return;
    }
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        title: updatedTitle,
        dueDate: updatedDueDate,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, title: updatedTitle, dueDate: updatedDueDate }
            : task
        )
      );

      Alert.alert("Success", "Task updated successfully!");
      setIsEditing(false);
      setEditingTaskId(null);
      setTitle("");
      setDueDate("");
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Could not update task. Please try again.");
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      Alert.alert("Success", "Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Could not delete task. Please try again.");
    }
  };

  // Fetch tasks from Firebase
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      const fetchedTasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };

  // Toggle sorting order and sort tasks by dueDate
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sortedTasks = [...tasks].sort((a, b) => {
      const dueDateA = new Date(a.dueDate);
      const dueDateB = new Date(b.dueDate);

      return newSortOrder === "asc"
        ? dueDateA - dueDateB
        : dueDateB - dueDateA;
    });

    setTasks(sortedTasks);
  };

  // Toggle the "isChecked" status of a task
  const toggleCheck = async (taskId, currentStatus) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        isChecked: !currentStatus, // Toggle the check status
      });
      fetchTasks(); // Refresh task list after update
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require("./assets/Fingertips.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.noTask}>{tasks.length} Tasks</Text>
        </View>

        {/* Sort Button */}
        <Pressable onPress={toggleSortOrder}>
          <Text style={styles.sortText}>
            Sort Date {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Text>
        </Pressable>
      </View>

      {/* Task List */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : tasks.length > 0 ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItems
              title={item.title}
              id={item.id}
              isChecked={item.isChecked}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              onDelete={() => deleteTask(item.id)}
              onCheck={(taskId, currentStatus) =>
                toggleCheck(taskId, currentStatus)
              }
              onEdit={() => {
                setIsEditing(true);
                setEditingTaskId(item.id);
                setTitle(item.title);
                setDueDate(item.dueDate);
              }}
            />
          )}
          style={styles.taskList}
        />
      ) : (
        <Text style={styles.noTaskText}>No tasks available</Text>
      )}

      {/* Input Section */}
      <TextInput
        placeholder="Enter due date (YYYY-MM-DD)"
        style={styles.input}
        value={dueDate}
        onChangeText={(text) => setDueDate(text)}
      />
      <TextInput
        placeholder="Enter new Task"
        style={styles.input}
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (isEditing) {
            editTask(editingTaskId, title, dueDate);
          } else {
            addTask();
          }
        }}
      >
        <Text style={styles.addButtonText}>
          {isEditing ? "Save Changes" : "Add Task"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  noTask: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    marginTop: 5,
    textAlign: "center",
  },
  input: {
    backgroundColor: "lightgray",
    padding: 10,
    fontSize: 17,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignSelf: "center",
    width: "90%",
    alignItems: "center",
    marginBottom: 30,
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
  sortText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "blue",
  },
  taskList: {
    marginTop: 20,
  },
  noTaskText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "gray",
  },
});
