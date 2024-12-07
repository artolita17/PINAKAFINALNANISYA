import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

// Dynamically get screen width for scaling
const { width } = Dimensions.get("window");

const TaskItems = ({
  title,
  id,
  isChecked,
  createdAt,
  dueDate,
  onDelete,
  onCheck,
  onEdit,
}) => {
  return (
    <View style={[styles.taskItem, isChecked && styles.doneTask]}>
      <View style={styles.taskDetails}>
        <TouchableOpacity onPress={() => onCheck(id, isChecked)}>
          <Text style={styles.checkButton}>{isChecked ? "❌" : "✔️"}</Text>
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={[styles.title, isChecked && styles.doneText]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.dateText}>
            Created: <Text>{new Date(createdAt).toLocaleDateString()}</Text>
          </Text>
          <Text style={styles.dateText}>
            Due: <Text style={styles.boldText}>{new Date(dueDate).toLocaleDateString()}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        {!isChecked && (
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: width * 0.03,
    marginVertical: width * 0.015,
    borderRadius: width * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: "95%",
    alignSelf: "center",
  },
  doneTask: {
    backgroundColor: "#a5d6a7", // Green background for done tasks
  },
  taskDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkButton: {
    fontSize: width * 0.05,
    marginRight: width * 0.02,
  },
  textContainer: {
    flexDirection: "column",
    flex: 1,
  },
  title: {
    fontFamily: "Poppins",
    fontSize: width * 0.045,
    fontWeight: "600",
    color: "#333",
  },
  doneText: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  dateText: {
    fontFamily: "Poppins",
    fontSize: width * 0.035,
    color: "gray",
    marginTop: width * 0.01,
  },
  boldText: {
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginLeft: width * 0.03,
  },
  editText: {
    fontSize: width * 0.035,
    color: "blue",
    marginBottom: width * 0.015,
  },
  deleteText: {
    fontSize: width * 0.035,
    color: "red",
  },
});

export default TaskItems;
