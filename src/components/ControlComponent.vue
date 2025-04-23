<template>
  <div :class="['control-component', name.toLowerCase()]">
    <input
      :id="name"
      type="range"
      :value="modelValue"
      min="minValue"
      max="maxValue"
      step="5"
      list="markers"
      @input="updateValue($event.target.value)"
    />
    <datalist id="markers">
      <option v-for="label in labels" :value="label" :label="label" :key="label"></option>
    </datalist>
  </div>
</template>

<script>
export default {
  name: "ControlComponent",
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      minValue: 0,
      maxValue: 100,
      labels: [0, 25, 50, 75, 100],
    };
  },
  methods: {
    updateValue(value) {
      this.$emit("update:modelValue", parseInt(value));
    },
  },
};
</script>
<style scoped>

input[type="range"] {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}
datalist {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
datalist option {
  position: relative;
  width:2em;
  text-align: center;
}
datalist option:first-of-type {
  text-align: left;
}
datalist option:last-of-type {
  text-align: right;
}
</style>
