<template>
  <div class="nav-bar-box">
    <div class="nav-item-box">
        <div class="logo"></div>
        <p class="website-title">MOCHARTS</p>
    </div>
    <div class="nav-item-box">
      <div class="nav-item">Docs</div>
      <div class="nav-item active">Gallery</div>
      <div class="nav-item">About</div>
    </div>
    
  </div>
  <div class = "body-box">
    <div class = "category-box">
      <div class="category-list">
        <div class="category-item-title">CATEGORY</div>
        <div class="category-item">Bar</div>
        <div class="category-item">Pie</div>
        <div class="category-item">Line</div>
      </div>
    </div>

    <div class="display-box">
      <charts></charts>
    </div>

  </div>
  

</template>

<script>
import charts from './charts.vue';


export default {
  components: {
    charts
  }
};
</script>

<style scoped>
  .nav-bar-box{
      position:fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 4rem;
      background-color: white;
      border-bottom: solid 1px #eaeaea;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      z-index: 100;
  }

  .body-box{
    width: 95vw;
  }

  .category-box{
    position: fixed;
    top: 4rem;
    left: 0;
    background-color: white;
    width: 10rem;
    border-right: solid 1px #eaeaea;
    height: 100vh;
  }

  .display-box{
    margin-left: 6rem;
    padding: 1rem;
  }

  .logo{
    width: 3.5rem;
    height: 3.5rem;
    background-image: url(../assets/4.png);
    background-size: cover; 
    background-position: center; 
  }

  .website-title{
    font-size: 1.2rem;
    color: #3c61cf;
    margin: 0.5rem;
  }
  
  .nav-item-box{
    display: flex;
    height:100%;
    align-items: center;
  }

  .nav-item{
    height: 100%;
    padding: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .category-list{
    display: flex;
    flex-direction: column;
    padding: 1rem;
    align-items: flex-start;
  }

  .category-item{
    margin: 0.8rem;
    cursor: pointer;
  }

  .category-item-title{
    font-size: 1.1rem;
    margin: 0.8rem;
    cursor: default;
  }

  .active{
    border-bottom: solid 3px #3c61cf;
  }
</style>
