<template>
  <div class="logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link :key="+collapse" class="wh-full flex-center" to="/">
        <div class="i-svg:logo3" style="width: 30px; height: 30px" />
        <span v-if="!collapse" class="title">
          {{ appConfig.title }}
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import { appConfig } from "@/settings";
import logo from "@/assets/icons/logo3.svg";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  color: $sidebar-logo-text-color;
  background-color: $sidebar-logo-background;

  .title {
    flex-shrink: 0;
    margin-left: 14px;
    font-size: 17px;
    font-weight: bold;
    color: inherit;
  }

  img {
    color: inherit;
  }
}
</style>

<style lang="scss">
// 顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    color: var(--menu-text);
    background-color: transparent !important;

    .title {
      color: inherit;
    }

    img {
      color: inherit;
    }
  }
}

// 宽屏时：openSidebar 状态下显示完整Logo+文字
.openSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: $sidebar-width; // 210px，显示logo+文字
  }
}

// 窄屏时：hideSidebar 状态下只显示Logo图标
.hideSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: $sidebar-width-collapsed; // 54px，只显示logo
  }

  // 隐藏文字，只显示图标
  .logo .title {
    display: none;
  }
}
</style>
