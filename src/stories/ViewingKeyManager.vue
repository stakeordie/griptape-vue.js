<template>
  <viewing-key-manager-component></viewing-key-manager-component>
</template>

<script>
import ViewingKeyManagerComponent from "../components/ViewingKeyManager.vue";

import { reactive, computed } from 'vue';

export default {
  name: 'viewing-key-manager',
  components: {ViewingKeyManagerComponent},
  props: {
    contractIdentifier: {
      type: String
    }
  },

  emits: ['click'],

  setup(props, { emit }) {
    props = reactive(props);
    return {
      onClick() {
        emit('click');
      }
    }
  },
};
</script>
