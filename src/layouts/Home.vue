<template>
  <div class="nav-bar-box">
    <div class="nav-item-box">
        <div class="logo"></div>
        <p class="website-title">MOCHARTS</p>
    </div>
    <div class="nav-item-box">
      <router-link to="/docs" class="nav-item" :class="{ 'active': currentRoute === '/docs' }">Docs</router-link>
      <router-link to="/gallery" class="nav-item" :class="{ 'active': currentRoute === '/gallery' }">Gallery</router-link>
      <router-link to="/about" class="nav-item" :class="{ 'active': currentRoute === '/about' }">About</router-link>
    </div>
    
  </div>
  <div class = "body-box">
    <div class = "category-box">
      <div class="category-list">
        <div class="category-item-title" @click="setType('all')" :class="{ 'nav-active': type === 'all' }">CATEGORY</div>
        <div class="category-item" @click="setType('bar')" :class="{ 'nav-active': type === 'bar' }">Bar</div>
        <div class="category-item" @click="setType('pie')" :class="{ 'nav-active': type === 'pie' }">Pie</div>
        <div class="category-item" @click="setType('line')" :class="{ 'nav-active': type === 'line' }">Line</div>
        <div class="category-item" @click="setType('radar')" :class="{ 'nav-active': type === 'radar' }">Radar</div>
      </div>
    </div>
  
    <div class="display-box">
      <div class="">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in" appear="">
            <component :is="Component" :type="type"/>
          </transition>
        </router-view>
      </div>
    </div>

   

  </div>
  

</template>

<script>
import charts from './gallery.vue';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


export default {
  components: {
    charts
  },
  data() {
    return {
      type: 'all' // 初始值
    };
  },
  methods: {
    setType(type) {
      // 在这里根据不同的点击事件设置 type 的值
      this.type = type;
    }
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentRoute = ref(route.path);
    const isTransitioning = ref(false);
    const navItems = [
      { path: '/docs', label: 'Docs' },
      { path: '/gallery', label: 'Gallery' },
      { path: '/about', label: 'About' }
    ];

    const goto = (path) => {
      if (!isTransitioning.value) {
        isTransitioning.value = true;
        router.push(path);
      }
    };

    watch(() => route.path, (newValue) => {
      currentRoute.value = newValue;
      isTransitioning.value = false;
    });

    return {
      currentRoute,
      navItems,
      goto
    };
  }
};

</script>

<style scoped>
  .nav-bar-box{
      position:fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 8vh;
      background-color: white;
      border-bottom: solid 1px #eaeaea;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
  }

  .body-box{
    width: 100vw;
  }

  .category-box{
    position: fixed;
    top: 8vh;
    left: 0;
    background-color: white;
    width: 12vw;
    border-right: solid 1px #eaeaea;
    height: 100vh;
  }

  .display-box{
    margin-top: 8vh;
    margin-left: 12vw;
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
    font-size: 1.5vw;
    color: #3c61cf;
    margin: 8px;
  }
  
  .nav-item-box{
    display: flex;
    height:100%;
    align-items: center;
    font-size: 1vw;
  }

  .nav-item{
    height: 100%;
    padding: 13px;
    text-decoration: none;
    color: #454545;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: border-bottom-color 0.3s ease;
  }

  .category-list{
    display: flex;
    flex-direction: column;
    padding: 16px;
    align-items: flex-start;
  }

  .category-item{
    padding: 0 13px ;
    margin: 13px 0;
    cursor: pointer;
    font-size: 1vw;
  }

  .category-item-title{
    font-size: 1.2vw;
    padding: 0 13px ;
    margin: 13px 0;
    cursor: default;
  }

  .active{
    border-bottom: solid 3px #3c61cf;
    transition: border-bottom-color 0.3s ease;
  }

  .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.2s;
    }


    .fade-leave-to,
    .before-enter {
      opacity: 0;
    }

    .fade-enter-from {
    opacity: 0 ; /* 设置进入时的初始状态为完全透明 */
  }

    .fade-enter-to,
    .fade-leave {
      opacity: 1;
    }

.nav-active{
  border-left: solid 2px #3c61cf;
  font-weight: bolder;
}

</style>