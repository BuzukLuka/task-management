<template>
  <div id="app">
    <header v-if="user" class="header">
      <div class="logo">
        <router-link to="/home" class="logo-link">Your Company</router-link>
      </div>
      <nav class="navigation">
        <router-link to="/home" class="nav-link">Home</router-link>
        <router-link to="/tasks" class="nav-link">Tasks</router-link>
      </nav>
      <button @click="logout" class="logout-button">Logout</button>
    </header>
    <main>
      <!-- Your header component or navigation bar -->
      <router-view></router-view>
    </main>

    <footer>
      <div class="footer-container">
        <p>&copy; 2023 Your Company. All rights reserved.</p>
        <ul class="footer-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
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
/* Global Styles */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #333;
  color: #fff;
}

.logo {
  font-size: 1.2rem;
  font-weight: bold;
}

.logo-link {
  text-decoration: none;
  color: #fff;
}

.navigation {
  display: flex;
}

.nav-link {
  text-decoration: none;
  color: #fff;
  margin-right: 10px;
}

.logout-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
}

/* Main Content Styles */
main {
  min-height: 80vh;
  padding: 20px;
}

/* Footer Styles */
footer {
  background-color: #333;
  padding: 20px;
  color: #fff;
}

.footer-container {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  display: inline-block;
  margin-right: 10px;
}

.footer-links li a {
  text-decoration: none;
  color: #fff;
}
</style>
