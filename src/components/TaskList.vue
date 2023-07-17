<template>
  <div class="task-manager">
    <!-- Task List -->
    <div class="task-list">
      <h2>Task List</h2>
      <div class="sort">
        <label for="sort">Sort By:</label>
        <select id="sort" v-model="sortOption" @change="fetchTasks">
          <option value="dueDate">Due Date</option>
          <option value="completionStatus">Completion Status</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      <ul>
        <li v-for="task in sortedTasks" :key="task.id" class="task-item">
          <div>
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <p><strong>Due Date:</strong> {{ task.dueDate }}</p>
            <p>
              <strong>Completion Status:</strong> {{ task.completionStatus }}
            </p>
            <button @click="openShareModal(task)">Share</button>
            <button @click="openDeleteConfirmation(task)">Delete</button>
          </div>
        </li>
        <li
          v-for="sharedTask in sharedTasks"
          :key="sharedTask.id"
          class="task-item"
        >
          <div>
            <h3>{{ sharedTask.title }}</h3>
            <p>{{ sharedTask.description }}</p>
            <p><strong>Due Date:</strong> {{ sharedTask.dueDate }}</p>
            <p>
              <strong>Completion Status:</strong>
              {{ sharedTask.completionStatus }}
            </p>
            <button @click="editTask(sharedTask)">Edit</button>
            <button @click="openDeleteConfirmation(sharedTask)">Delete</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Task Reminder Notifications -->
    <div class="notification-section">
      <button class="notification-toggle" @click="toggleNotificationList">
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
            <button
              class="notification-dismiss"
              @click="dismissNotification(notification.id)"
            >
              Dismiss
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Add/Edit Task Form -->
    <div class="task-form">
      <h2 v-if="editingTask">Edit Task</h2>
      <h2 v-else>Add Task</h2>
      <form @submit.prevent="editingTask ? updateTask() : addTask()">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            v-model="taskForm.title"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="taskForm.description"
            class="form-input"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            v-model="taskForm.dueDate"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="completionStatus">Completion Status</label>
          <input
            type="checkbox"
            id="completionStatus"
            v-model="taskForm.completionStatus"
          />
        </div>
        <div class="form-group">
          <label for="priority">Priority</label>
          <input
            type="number"
            id="priority"
            v-model="taskForm.priority"
            class="form-input"
          />
        </div>
        <div class="form-buttons">
          <button type="submit" class="form-button">
            {{ editingTask ? "Update" : "Add" }}
          </button>
          <button v-if="editingTask" @click="cancelEdit" class="form-button">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Share Task Modal -->
    <div v-if="selectedTask" class="modal-container">
      <div class="modal">
        <h2>Share Task</h2>
        <form @submit.prevent="performShareTask" class="share-form">
          <div class="form-group">
            <label for="recipientEmail">Recipient Email</label>
            <input
              type="email"
              id="recipientEmail"
              v-model="recipientEmail"
              class="form-input"
            />
          </div>
          <div class="form-buttons">
            <button type="submit" class="form-button">Share</button>
            <button @click="cancelShare" class="form-button">Cancel</button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="deleteConfirmation" class="modal-container">
      <div class="modal">
        <h2>Are you sure you want to delete this task?</h2>
        <div class="modal-buttons">
          <button @click="deleteTask(selectedTaskToDelete)">Yes</button>
          <button @click="closeDeleteConfirmation">No</button>
        </div>
      </div>
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
      notificationTimeout: null,
      selectedTask: null,
      recipientEmail: "",
      db: null,
      sharedTasksRef: null,
      sharedTasks: [],
      showModal: false,
      deleteConfirmation: false,
      selectedTaskToDelete: null,
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
    fetchSharedTasks() {
      const user = firebase.auth().currentUser;
      if (user) {
        const sharedTasksRef = this.db
          .collection("sharedTasks")
          .where("recipientId", "==", user.uid);

        sharedTasksRef.onSnapshot((snapshot) => {
          const sharedTasks = snapshot.docs.map((doc) => {
            const sharedTaskData = doc.data();
            return new Task(
              doc.id,
              sharedTaskData.title,
              sharedTaskData.description,
              sharedTaskData.dueDate,
              sharedTaskData.completionStatus,
              sharedTaskData.priority
            );
          });

          this.sharedTasks = sharedTasks;
        });
      }
    },

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

        const sharedTasksRef = this.db
          .collection("sharedTasks")
          .where("ownerId", "==", user.uid);

        sharedTasksRef.onSnapshot((snapshot) => {
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
            this.editingTask = null;
          })
          .catch((error) => {
            console.error("Error updating task: ", error);
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

      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }

      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, 5000); // Remove notification after 5 seconds (adjust as needed)

      this.notificationTimeout = setTimeout(() => {
        this.dismissNotification(notification.id);
      }, 5000); // Adjust the duration as needed (e.g., 5000 milliseconds = 5 seconds)
    },
    dismissNotification(notificationId) {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== notificationId
      );
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
    },
    toggleNotificationList() {
      this.showNotificationList = !this.showNotificationList;
    },
    openShareModal(task) {
      this.selectedTask = task;
      this.recipientEmail = "";
      this.showModal = true;
    },
    closeShareModal() {
      this.showModal = false;
      this.selectedTask = null;
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
                const sharedTask = new Task(
                  this.selectedTask.id,
                  this.selectedTask.title,
                  this.selectedTask.description,
                  this.selectedTask.dueDate,
                  this.selectedTask.completionStatus,
                  this.selectedTask.priority
                );

                this.sharedTasks.push(sharedTask);
                this.closeShareModal();
                this.showNotification("Task shared successfully.");
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

    cancelShare() {
      this.closeShareModal();
    },

    openDeleteConfirmation(task) {
      this.selectedTaskToDelete = task;
      this.deleteConfirmation = true;
    },

    closeDeleteConfirmation() {
      this.selectedTaskToDelete = null;
      this.deleteConfirmation = false;
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
          .then(() => {
            this.closeDeleteConfirmation();
            this.showNotification("Task deleted successfully.");
          })
          .catch((error) => {
            console.error("Error deleting task: ", error);
          });
      }
    },
  },
  mounted() {
    this.db = firebase.firestore();
    this.sharedTasksRef = this.db.collection("sharedTasks");
    this.fetchSharedTasks();

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
/* Global Styles */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* Task Manager Styles */
.task-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Task List Styles */
.task-list {
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 4px;
}

.sort {
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

.task-item {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.task-item div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  margin-bottom: 5px;
}

button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
}

/* Task Reminder Notifications Styles */
.notification-section {
  margin-top: 10px;
}

.notification-toggle {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
  margin-bottom: 10px;
}

.notifications {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
}

.notification {
  margin-bottom: 10px;
  padding: 5px;
  background-color: #f9f9f9;
}

.notification-dismiss {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
}

/* Add/Edit Task Form Styles */
.task-form {
  margin-top: 20px;
}

form {
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-buttons {
  margin-top: 10px;
}

.form-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
  margin-right: 10px;
}

/* Modal Styles */
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>
