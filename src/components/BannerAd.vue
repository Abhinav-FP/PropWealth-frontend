<template>
  <a v-if="img && link" :href="link" target="_blank">
    <v-img
      :src="img"
      :class="{
        'mx-auto': true,
        'hover-shadow': hoverShadow
      }"
      alt="Buyers Guide"
      contain
      eager
      width="300"
      height="415"
      max-height="415"
      max-width="415"
    ></v-img>
  </a>
  <v-img
    v-else-if="img"
    :src="img"
    :class="{
      'mx-auto': true,
      'hover-shadow': hoverShadow
    }"
    alt="Buyers Guide"
    contain
    eager
    width="300"
    height="415"
    max-height="415"
    max-width="415"
  ></v-img>
</template>
<script>
export default {
  name: 'BannerAd',
  props: {
    img: {
      type: String
    },
    link: {
      type: String
    },
    hoverShadow: {
      type: Boolean,
      default: true
    }
  }
}
</script>
<style scoped>
  .hover-shadow {
    box-shadow: 0 0 10px 2px rgb(0 0 0 / 20%) !important;
  }
  .hover-shadow:hover {
    box-shadow: 0 0 10px 4px rgb(0 0 0 / 40%) !important;
  }
</style>
