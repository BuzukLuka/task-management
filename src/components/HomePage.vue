<template>
  <div class="home-container">
    <h1 class="home-title">Welcome to the Homepage</h1>
    <p class="home-description">This is an example homepage component.</p>
  </div>
</template>

<script>
export default {
  name: "HomePage",
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
  animation: fadeIn 1s;
}

.home-title {
  font-size: 36px;
  margin-bottom: 20px;
  color: #333;
}

.home-description {
  font-size: 18px;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
