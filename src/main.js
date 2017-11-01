import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import routes from './routes'
import 'font-awesome/css/font-awesome.min.css'
import VueResource from 'vue-resource'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VueResource)

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  let user = JSON.parse(localStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    if (to.path == "/") {
      var lastVue = localStorage.getItem('lastVue');
      if (lastVue) {
        next({ path: lastVue })
      }
    }
    next()
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


