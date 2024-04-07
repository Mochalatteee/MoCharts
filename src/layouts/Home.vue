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
      height: 64px;
      background-color: white;
      border-bottom: solid 1px #eaeaea;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
  }

  .body-box{
    width: 95vw;
  }

  .category-box{
    position: fixed;
    top: 64px;
    left: 0;
    background-color: white;
    width: 160px;
    border-right: solid 1px #eaeaea;
    height: 100vh;
  }

  .display-box{
    margin-top: 64px;
    margin-left: 160px;
    padding: 16px;
  }

  .logo{
    width: 56px;
    height: 56px;
    background-image: url(../assets/4.png);
    background-size: cover; 
    background-position: center; 
  }

  .website-title{
    font-size: 20px;
    color: #3c61cf;
    margin: 8px;
  }
  
  .nav-item-box{
    display: flex;
    height:100%;
    align-items: center;
  }

  .nav-item{
    height: 100%;
    padding: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .category-list{
    display: flex;
    flex-direction: column;
    padding: 16px;
    align-items: flex-start;
  }

  .category-item{
    margin: 13px;
    cursor: pointer;
  }

  .category-item-title{
    font-size: 18px;
    margin: 13px;
    cursor: default;
  }

  .active{
    border-bottom: solid 3px #3c61cf;
  }
</style>
