import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'//插件需要Vue.use
import store from './store'
import 'babel-polyfill'

Vue.config.productionTip = false

import "common/stylus/index.styl"

fastclick.attach(document.body)

Vue.use(VueLazyLoad,{
  loading:require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
