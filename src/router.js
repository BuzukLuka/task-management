import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Log_In.vue";
import Signup from "@/components/Sign_Up.vue";
import Home from "@/components/HomePage.vue";
import Tasks from "@/components/TaskList.vue";
import firebase from "@/firebase.js";
import "firebase/auth";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/tasks",
    name: "Tasks",
    component: Tasks,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const currentUser = firebase.auth().currentUser;

  if (requiresAuth && !currentUser) {
    next("/login" || "/signup");
  } else {
    next();
  }
});

export default router;
