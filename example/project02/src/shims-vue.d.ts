declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'megalo/types/vue' {
  interface Vue {
    $mp: any
  }
}

declare function getApp()
