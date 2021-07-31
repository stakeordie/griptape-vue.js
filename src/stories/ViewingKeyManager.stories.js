import ViewingKeyManager from "./ViewingKeyManager.vue";

export default {
  title: 'ViewingKeyManager',
  component: ViewingKeyManager,
};

const Template = (args) => ({
  components: { ViewingKeyManager },
  setup() {
    return { args };
  },
  template: '<viewing-key-manager v-bind="args" />',
});

export const FirstStory = Template.bind({});
