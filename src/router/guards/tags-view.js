import router from "@/router";
import { useTagsViewStore } from "@/store";

/**
 * 标签页路由守卫
 *
 * 用于自动添加、更新标签页
 */
export function setupTagsViewGuard() {
  router.beforeEach((to) => {
    const tagsViewStore = useTagsViewStore();

    // 检查是否是有效的路由，避免添加空标签页
    // 如果路径为空或者是重定向路径，不添加标签页
    if (!to.path || to.path === "/" || to.path.startsWith("/redirect")) {
      return;
    }

    // 检查是否有有效的标题或名称
    const title = to.meta?.title || to.name;
    if (!title) {
      return;
    }

    // 创建标签视图对象
    const tagView = {
      fullPath: to.fullPath,
      path: to.path,
      name: to.name,
      title: title,
      affix: to.meta?.affix || false,
      keepAlive: to.meta?.keepAlive || false,
      query: to.query,
      params: to.params,
    };

    // 添加标签视图
    tagsViewStore.addView(tagView);

    return;
  });
}
