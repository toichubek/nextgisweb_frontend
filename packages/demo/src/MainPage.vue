<template>
  <div>

    <v-navigation-drawer
      :clipped="$vuetify.breakpoint.lgAndUp"
      :open="open"
      v-model="drawer"
      dark
      style="background:#0070c5"
      fixed
      app
    >
      <v-treeview
        v-if="items"
        :active.sync="active"
        :items="items"
        :open="open"
        activatable
        open-on-click
        transition
        @update:open="onOpen"
        class="pt-3 pb-3"
      >
        <template slot="prepend" slot-scope="{ item }">
          <v-icon v-if="item.icon">{{item.icon}}</v-icon>
        </template>
        <template slot="label" slot-scope="{ item }">
          <span :class="[item.priority <= 10 ? 'main-page' : '']">{{item.name}}</span>
        </template>
      </v-treeview>
    </v-navigation-drawer>

    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="#e5eef7" app fixed>
      <v-toolbar-title class="ml-0 pl-0">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <router-link to="/"><logo></logo></router-link>

      </v-toolbar-title>
      <span class="title ml-3">Frontend</span>
      <v-spacer></v-spacer>
      <v-btn icon large href="https://github.com/nextgis/nextgisweb_frontend" target="_blank">
        <v-icon large>mdi-github-circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <component
        v-if="current"
        :is="current.component"
        :item="current"
      ></component>
    </v-content>
  </div>
</template>

<script lang="ts">
export { MainPage as default } from './MainPage';
</script>


<style lang="scss">
  code:after,
  kbd:after,
  code:before,
  kbd:before {
    content: "" !important;
    letter-spacing: 0 !important;
  }

  .header {
      backface-visibility: hidden;
      background-color: #e5eef7;
      border-bottom: 1px solid #d3e3f2;
      color: rgba(0,0,0,.87);
      font-size: 14px;
      font-weight: 400;
      height: 43px;
      left: 0;
      line-height: 43px;
      min-height: 43px;
      padding-left: 0;
      padding-right: 0;
      position: fixed;
      right: 0;
      top: 0;
      white-space: nowrap;
      width: 100%;
      z-index: 40;
  }

  .main-page {
    font-weight: bold;
  }

  .nowrap {
    white-space: nowrap!important;
  }

  code {
    white-space: pre-wrap!important;
    font-size: 90%!important;
    line-height: 1.5em!important;
    background: rgba(31,51,73,.05)!important;
    border-radius: 3px!important;
    padding: 2px 4px!important;
    color: #5b7897!important;
    box-shadow: none!important;
}
</style>
