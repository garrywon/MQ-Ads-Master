export const useTagsViewStore = defineStore("tagsView", () => {
  const visitedViews = ref([]);
  const cachedViews = ref([]);
  const router = useRouter();
  const route = useRoute();

  // 从本地存储恢复标签页状态
  function restoreTagsView() {
    try {
      const savedVisitedViews = localStorage.getItem("visitedViews");
      const savedCachedViews = localStorage.getItem("cachedViews");

      if (savedVisitedViews) {
        visitedViews.value = JSON.parse(savedVisitedViews);
      }

      if (savedCachedViews) {
        cachedViews.value = JSON.parse(savedCachedViews);
      }
    } catch (error) {
      console.error("恢复标签页状态失败:", error);
    }
  }

  // 保存标签页状态到本地存储
  function saveTagsView() {
    try {
      localStorage.setItem("visitedViews", JSON.stringify(visitedViews.value));
      localStorage.setItem("cachedViews", JSON.stringify(cachedViews.value));
    } catch (error) {
      console.error("保存标签页状态失败:", error);
    }
  }

  // 初始化首页标签页
  function initDashboardTag() {
    // 检查是否已经有首页标签页
    const hasDashboard = visitedViews.value.some((tag) => tag.name === "Dashboard");

    if (!hasDashboard) {
      // 添加首页标签页
      const dashboardTag = {
        fullPath: "/dashboard",
        path: "/dashboard",
        name: "Dashboard",
        title: "dashboard",
        affix: true,
        keepAlive: true,
        query: {},
        params: {},
      };

      // 如果是affix标签，添加到开头
      visitedViews.value.unshift(dashboardTag);

      // 如果需要缓存，添加到缓存列表
      if (dashboardTag.keepAlive) {
        cachedViews.value.push(dashboardTag.fullPath);
      }
    }
  }

  /**
   * 添加已访问视图到已访问视图列表中
   */
  function addVisitedView(view) {
    // 如果已经存在于已访问的视图列表中或者是重定向地址，则不再添加
    if (view.path.startsWith("/redirect")) {
      return;
    }
    if (visitedViews.value.some((v) => v.path === view.path)) {
      return;
    }
    // 如果视图是固定的（affix），则在已访问的视图列表的开头添加
    if (view.affix) {
      visitedViews.value.unshift(view);
    } else {
      // 如果视图不是固定的，则在已访问的视图列表的末尾添加
      visitedViews.value.push(view);
    }
    // 保存到本地存储
    saveTagsView();
  }

  /**
   * 添加缓存视图到缓存视图列表中
   */
  function addCachedView({ fullPath, keepAlive }) {
    // 如果缓存视图名称已经存在于缓存视图列表中，则不再添加
    if (cachedViews.value.includes(fullPath)) {
      return;
    }

    // 如果视图需要缓存（keepAlive），则将其路由名称添加到缓存视图列表中
    if (keepAlive) {
      cachedViews.value.push(fullPath);
    }
  }

  /**
   * 从已访问视图列表中删除指定的视图
   */
  function delVisitedView(view) {
    return new Promise((resolve) => {
      for (const [i, v] of visitedViews.value.entries()) {
        // 找到与指定视图路径匹配的视图，在已访问视图列表中删除该视图
        if (v.path === view.path) {
          visitedViews.value.splice(i, 1);
          break;
        }
      }
      // 保存到本地存储
      saveTagsView();
      resolve([...visitedViews.value]);
    });
  }

  function delCachedView(view) {
    const { fullPath } = view;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(fullPath);
      if (index > -1) {
        cachedViews.value.splice(index, 1);
      }
      // 保存到本地存储
      saveTagsView();
      resolve([...cachedViews.value]);
    });
  }
  function delOtherVisitedViews(view) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => {
        return v?.affix || v.path === view.path;
      });
      resolve([...visitedViews.value]);
    });
  }

  function delOtherCachedViews(view) {
    const { fullPath } = view;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(fullPath);
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1);
      } else {
        // if index = -1, there is no cached tags
        cachedViews.value = [];
      }
      resolve([...cachedViews.value]);
    });
  }

  function updateVisitedView(view) {
    for (let v of visitedViews.value) {
      if (v.path === view.path) {
        v = Object.assign(v, view);
        break;
      }
    }
  }

  /**
   * 根据路径更新标签名称
   * @param fullPath 路径
   * @param title 标签名称
   */
  function updateTagName(fullPath, title) {
    const tag = visitedViews.value.find((tag) => tag.fullPath === fullPath);

    if (tag) {
      tag.title = title;
    }
  }

  function addView(view) {
    addVisitedView(view);
    addCachedView(view);
  }

  function delView(view) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delOtherViews(view) {
    return new Promise((resolve) => {
      delOtherVisitedViews(view);
      delOtherCachedViews(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delLeftViews(view) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index >= currIndex || item?.affix) {
          return true;
        }

        const cacheIndex = cachedViews.value.indexOf(item.fullPath);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delRightViews(view) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index <= currIndex || item?.affix) {
          return true;
        }
        const cacheIndex = cachedViews.value.indexOf(item.fullPath);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delAllViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      cachedViews.value = [];
      // 保存到本地存储
      saveTagsView();
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delAllVisitedViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      resolve([...visitedViews.value]);
    });
  }

  function delAllCachedViews() {
    return new Promise((resolve) => {
      cachedViews.value = [];
      resolve([...cachedViews.value]);
    });
  }

  /**
   * 关闭当前tagView
   */
  function closeCurrentView() {
    const tags = {
      name: route.name,
      title: route.meta.title,
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      query: route.query,
    };
    delView(tags).then((res) => {
      if (isActive(tags)) {
        toLastView(res.visitedViews, tags);
      }
    });
  }

  function isActive(tag) {
    return tag.path === route.path;
  }

  function toLastView(visitedViews, view) {
    const latestView = visitedViews.slice(-1)[0];
    if (latestView && latestView.fullPath) {
      router.push(latestView.fullPath);
    } else {
      // now the default is to redirect to the home page if there is no tags-view,
      // you can adjust it according to your needs.
      if (view?.name === "Dashboard") {
        // to reload home page
        router.replace("/redirect" + view.fullPath);
      } else {
        router.push("/");
      }
    }
  }

  // 初始化时恢复标签页状态
  restoreTagsView();

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    updateVisitedView,
    addView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    closeCurrentView,
    isActive,
    toLastView,
    updateTagName,
    initDashboardTag,
    restoreTagsView,
    saveTagsView,
  };
});
