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
          this.$router.push('/tasks');
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
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
}

button {
  padding: 10px;
  width: 100%;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}

button.signup-button {
  margin-top: 10px;
  background-color: #28a745;
}

button:hover {
  background-color: #0056b3;
}
</style>
