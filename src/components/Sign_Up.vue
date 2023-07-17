<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="signup">
      <input type="email" v-model="email" placeholder="Email" required />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />

      <button type="submit">Sign Up</button>
    </form>
    <router-link to="/login">
      <button class="login-button" @click="switchToLogin">Login</button>
    </router-link>
  </div>
</template>

<script>
import firebase from "@/firebase.js";

export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    signup() {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(() => {
          // Sign-up successful
          this.$router.push("/tasks");
          // Do something with the user or navigate to another page
        })
        .catch((error) => {
          // Handle sign-up error
          console.error(error);
        });
    },
    switchToLogin() {
      this.$emit("loginClicked");
    },
  },
};
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
}

input[type="email"],
input[type="password"] {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"],
button.login-button {
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
  cursor: pointer;
}

button.login-button {
  background-color: #fff;
  color: #333;
}
</style>
