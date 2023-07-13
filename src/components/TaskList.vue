<template>
  <div>
    <!-- Task List -->
    <h2>Task List</h2>
    <div>
      <label for="sort">Sort By:</label>
      <select id="sort" v-model="sortOption" @change="fetchTasks">
        <option value="dueDate">Due Date</option>
        <option value="completionStatus">Completion Status</option>
        <option value="priority">Priority</option>
      </select>
    </div>
    <ul>
      <li v-for="task in sortedTasks" :key="task.id">
        <div>
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <p>Due Date: {{ task.dueDate }}</p>
          <p>Completion Status: {{ task.completionStatus }}</p>
          <button @click="shareTask(task)">Share</button>
          <!-- Add the Share button -->
        </div>
      </li>
    </ul>

    <!-- Task Reminder Notifications -->
    <button @click="toggleNotificationList">
      {{ showNotificationList ? "Hide Notifications" : "Show Notifications" }}
    </button>
    <div
      v-if="showNotificationList && notifications.length > 0"
      class="notifications"
    >
      <ul>
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
        >
          <p>{{ notification.message }}</p>
        </li>
      </ul>
    </div>

    <!-- Add/Edit Task Form -->
    <h2 v-if="editingTask">Edit Task</h2>
    <h2 v-else>Add Task</h2>
    <form @submit.prevent="editingTask ? updateTask() : addTask()">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="taskForm.title" />
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" v-model="taskForm.description"></textarea>
      </div>
      <div>
        <label for="dueDate">Due Date</label>
        <input type="date" id="dueDate" v-model="taskForm.dueDate" />
      </div>
      <div>
        <label for="completionStatus">Completion Status</label>
        <input
          type="checkbox"
          id="completionStatus"
          v-model="taskForm.completionStatus"
        />
      </div>
      <div>
        <label for="priority">Priority</label>
        <input type="number" id="priority" v-model="taskForm.priority" />
      </div>
      <button type="submit">{{ editingTask ? "Update" : "Add" }}</button>
      <button v-if="editingTask" @click="cancelEdit">Cancel</button>
    </form>

    <!-- Share Task Form -->
    <div v-if="selectedTask">
      <h2>Share Task</h2>
      <form @submit.prevent="performShareTask">
        <div>
          <label for="recipientEmail">Recipient Email</label>
          <input type="email" id="recipientEmail" v-model="recipientEmail" />
        </div>
        <button type="submit">Share</button>
      </form>
    </div>
  </div>
</template>

<script>
import firebase from "@/firebase";
import "firebase/firestore";
import "firebase/auth";

class Task {
  constructor(id, title, description, dueDate, completionStatus, priority) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.completionStatus = completionStatus;
    this.priority = priority;
  }
}

export default {
  data() {
    return {
      tasks: [],
      taskForm: {
        title: "",
        description: "",
        dueDate: "",
        completionStatus: false,
        priority: 0,
      },
      editingTask: null,
      sortOption: "dueDate",
      notifications: [],
      showNotificationList: false,
      selectedTask: null,
      recipientEmail: "",
      db: null,
      sharedTasksRef: null,
    };
  },
  computed: {
    sortedTasks() {
      const sortKey = this.sortOption;
      return this.tasks.slice().sort((a, b) => {
        if (a[sortKey] > b[sortKey]) {
          return 1;
        } else if (a[sortKey] < b[sortKey]) {
          return -1;
        }
        return 0;
      });
    },
  },
  methods: {
    fetchTasks() {
      const user = firebase.auth().currentUser;
      if (user) {
        const tasksRef = this.db
          .collection("users")
          .doc(user.uid)
          .collection("tasks");

        tasksRef.onSnapshot((snapshot) => {
          const tasks = snapshot.docs.map((doc) => {
            const taskData = doc.data();
            return new Task(
              doc.id,
              taskData.title,
              taskData.description,
              taskData.dueDate,
              taskData.completionStatus,
              taskData.priority
            );
          });

          this.tasks = tasks;
        });

        this.sharedTasksRef.onSnapshot((snapshot) => {
          const sharedTasksPromises = snapshot.docs.map((doc) => {
            const sharedTaskData = doc.data();
            return tasksRef.doc(sharedTaskData.taskId).get();
          });

          Promise.all(sharedTasksPromises).then((sharedTaskDocs) => {
            const sharedTasks = sharedTaskDocs
              .filter((taskDoc) => taskDoc.exists)
              .map((taskDoc) => {
                const taskData = taskDoc.data();
                return new Task(
                  taskDoc.id,
                  taskData.title,
                  taskData.description,
                  taskData.dueDate,
                  taskData.completionStatus,
                  taskData.priority
                );
              });

            this.tasks = [...this.tasks, ...sharedTasks];
          });
        });
      }
    },
    addTask() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.db
          .collection("users")
          .doc(user.uid)
          .collection("tasks")
          .add(this.taskForm)
          .then(() => {
            this.resetTaskForm();
          })
          .catch((error) => {
            console.error("Error adding task: ", error);
          });
      }
    },
    editTask(task) {
      this.editingTask = task;
      this.taskForm = {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        completionStatus: task.completionStatus,
        priority: task.priority,
      };
    },
    updateTask() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.db
          .collection("users")
          .doc(user.uid)
          .collection("tasks")
          .doc(this.editingTask.id)
          .update(this.taskForm)
          .then(() => {
            this.resetTaskForm();
          })
          .catch((error) => {
            console.error("Error updating task: ", error);
          });
      }
    },
    deleteTask(task) {
      const user = firebase.auth().currentUser;
      if (user) {
        this.db
          .collection("users")
          .doc(user.uid)
          .collection("tasks")
          .doc(task.id)
          .delete()
          .catch((error) => {
            console.error("Error deleting task: ", error);
          });
      }
    },
    cancelEdit() {
      this.editingTask = null;
      this.resetTaskForm();
    },
    resetTaskForm() {
      this.taskForm = {
        title: "",
        description: "",
        dueDate: "",
        completionStatus: false,
        priority: 0,
      };
    },
    showNotification(message) {
      const notification = {
        id: Date.now(),
        message,
      };
      this.notifications.push(notification);
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, 5000); // Remove notification after 5 seconds (adjust as needed)
    },
    dismissNotification(notificationId) {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== notificationId
      );
    },
    toggleNotificationList() {
      this.showNotificationList = !this.showNotificationList;
    },
    shareTask(task) {
      this.selectedTask = task;
      this.recipientEmail = "";
    },
    performShareTask() {
      // Validate recipient's email
      if (!this.recipientEmail) {
        console.error("Recipient email is required.");
        return;
      }

      // Get the recipient's user ID
      const user = firebase.auth().currentUser;
      if (user) {
        const recipientRef = this.db
          .collection("users")
          .where("email", "==", this.recipientEmail.toLowerCase()); // Search in lowercase
        recipientRef
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              console.error("Recipient not found.");
              return;
            }

            // Share the task
            const recipientDoc = querySnapshot.docs[0];
            const recipientUserId = recipientDoc.id;

            const sharedTaskData = {
              taskId: this.selectedTask.id,
              ownerId: user.uid,
              recipientId: recipientUserId,
            };

            this.sharedTasksRef
              .add(sharedTaskData)
              .then(() => {
                this.resetTaskForm();
              })
              .catch((error) => {
                console.error("Error sharing task: ", error);
              });
          })
          .catch((error) => {
            console.error("Error searching for recipient: ", error);
          });
      }
    },
  },
  mounted() {
    this.db = firebase.firestore();
    this.sharedTasksRef = this.db.collection("sharedTasks");

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.fetchTasks();

        // Task reminder system implementation
        setInterval(() => {
          const now = new Date();
          const dueTasks = this.tasks.filter(
            (task) => task.dueDate && new Date(task.dueDate) < now
          );

          dueTasks.forEach((task) => {
            const notificationMessage = `Task "${task.title}" is due.`;
            this.showNotification(notificationMessage);
          });
        }, 60000); // Check for due tasks every minute (adjust as needed)
      }
    });
  },
};
</script>

<style>
/* Task List */
h2 {
  color: #333;
  font-size: 20px;
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

select,
input[type="text"],
input[type="date"],
input[type="email"],
textarea {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
}

li div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
  cursor: pointer;
}

.notifications {
  margin-top: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
}

.notification {
  margin-bottom: 10px;
  padding: 5px;
  background-color: #f9f9f9;
}

/* Add/Edit Task Form */
form div {
  margin-bottom: 10px;
}

button[type="submit"] {
  background-color: #333;
  color: #fff;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #555;
}

button[type="submit"],
button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  margin-right: 10px;
}
</style>
