import '@babel/polyfill';
import Vue from 'vue';
import store from './store';
import { router } from './routers';
import App from './App.vue';
import VueRouter from 'vue-router';

import VueHighlightJS from 'vue-highlightjs';
import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(VueHighlightJS);
Vue.use(Vuetify, {
  iconfont: 'mdi'
});
Vue.use(VueRouter);

const app = new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
  methods: {
    goTo(elementId: string, options?: any) {
      // @ts-ignore
      this.$vuetify.goTo('#' + elementId.replace('#', ''), options);
      window.location.hash = elementId;
    },

    updateLinks(element: Element) {
      const links = element.getElementsByTagName('a');
      for (let fry = 0; fry < links.length; fry++) {
        const link = links[fry];
        link.onclick = (e) => {
          e.preventDefault();
          this._onLinkClick(element, link);
        };
      }
    },

    _onLinkClick(element: Element, link: HTMLAnchorElement) {
      const returnEvent = () => {
        if (link.href) {
          window.open(link.href, link.target);
        }
      };
      const href = link.href.replace(document.location.origin, '');
      const match = href.match(/^\/?([a-zA-Z\-]+)(#([a-zA-Z]+))?$/);
      if (match) {
        const [fullLink, module, hashName, name] = match;
        if (name) {
          element = document.getElementById(name);
          if (element) {
            this.goTo(name);
          } else {
            this.$router.push(`${module}#${name}`);
          }
        } else if (module) {
          this.$router.push(`${module}`);
        } else {
          returnEvent();
        }
      } else {
        returnEvent();
      }
    }
  }
});

// declare global {
//   interface Window {
//     version: string;
//   }
// }

// window.version = version;
