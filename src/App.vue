<template>
  <div id="app">
    <header v-if="user">
      <router-link to="/home">Home</router-link>
      <router-link to="/tasks">Task</router-link>
      <button @click="logout">Logout</button>
    </header>
    <main>
      <!-- Your header component or navigation bar -->
      <router-view></router-view>
    </main>

    <footer>
      <!-- Your footer component -->
    </footer>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import firebase from "@/firebase";

export default {
  name: "App",
  data() {
    return {
      user: null,
    };
  },
  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          // Clear the user object and navigate to the login page
          this.user = null;
          this.$router.push("/login");
        })
        .catch((error) => {
          // Handle any logout errors
          console.log("Logout error:", error);
        });
    },
  },
  created() {
    const router = useRouter();

    // Check if the user is authenticated on route changes
    router.beforeEach((to, from, next) => {
      const requiresAuth = to.matched.some(
        (record) => record.meta.requiresAuth
      );
      const currentUser = firebase.auth().currentUser;

      if (requiresAuth && !currentUser) {
        next("/login" || "/signup");
      } else {
        next();
      }
    });

    // Listen for authentication state changes
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
    });
  },
};
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #333;
    color: #fff;
  }

  header a {
    color: #fff;
    text-decoration: none;
    margin-right: 10px;
  }

  header button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    cursor: pointer;
  }
</style>
