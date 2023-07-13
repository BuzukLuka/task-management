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

button.login-button {
  margin-top: 10px;
  background-color: #dc3545;
}

button:hover {
  background-color: #0056b3;
}
</style>
