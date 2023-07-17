<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
    <router-link to="/signup">
      <button class="signup-button" @click="switchToSignUp">Sign Up</button>
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
    login() {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(() => {
          // Login successful
          this.$router.push("/tasks");
          // Do something after successful login
        })
        .catch((error) => {
          // Handle login error
          console.error(error);
        });
    },
    switchToSignUp() {
      this.$emit("signupClicked");
    },
  },
};
</script>

<style scoped>
.login-container {
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
button.signup-button {
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
  cursor: pointer;
}

button.signup-button {
  background-color: #fff;
  color: #333;
}
</style>
