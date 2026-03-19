<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-section">
      <div class="table-section__toolbar">
        <div class="table-section__toolbar--actions">
          <el-button
            v-hasPerm="['sys:menu:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog('0')"
          >
            新增
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="menuTableData"
        row-key="id"
        class="table-section__content"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
        @row-click="handleRowClick"
      >
        <el-table-column label="菜单名称" min-width="200">
          <template #default="scope">
            <div class="menu-name-cell">
              <span class="menu-name-cell__icon">
                <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
                  <el-icon style="vertical-align: -0.15em">
                    <component :is="scope.row.icon.replace('el-icon-', '')" />
                  </el-icon>
                </template>
                <template v-else-if="scope.row.icon">
                  <span :class="`i-svg:${scope.row.icon}`" />
                </template>
              </span>
              <span class="menu-name-cell__text">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.type === MenuTypeEnum.CATALOG" type="warning">目录</el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.MENU" type="success">菜单</el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.BUTTON" type="danger">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="路由名称" align="left" width="150" prop="name" />
        <el-table-column label="路由路径" align="left" width="150" prop="path" />
        <el-table-column label="组件路径" align="left" width="250" prop="component" />
        <el-table-column label="权限标识" align="center" width="200" prop="perm" />
        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" width="80" prop="sort" />
        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-if="scope.row.type == MenuTypeEnum.CATALOG || scope.row.type == MenuTypeEnum.MENU"
              v-hasPerm="['sys:menu:create']"
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id)"
            >
              新增
            </el-button>

            <el-button
              v-hasPerm="['sys:menu:edit']"
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(undefined, scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['sys:menu:delete']"
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type" @change="handleMenuTypeChange">
            <el-radio :value="MenuTypeEnum.CATALOG">目录</el-radio>
            <el-radio :value="MenuTypeEnum.MENU">菜单</el-radio>
            <el-radio :value="MenuTypeEnum.BUTTON">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.CATALOG || formData.type == MenuTypeEnum.MENU"
          prop="routePath"
        >
          <template #label>
            <div class="flex-y-center">
              路由路径
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  定义应用中不同页面对应的 URL 路径，目录需以 / 开头，菜单项不用。例如：系统管理目录
                  /system，系统管理下的用户管理菜单 user。
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-if="formData.type == MenuTypeEnum.CATALOG"
            v-model="formData.routePath"
            placeholder="system"
          />
          <el-input v-else v-model="formData.routePath" placeholder="user 或 https://example.com" />
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU && !isExternalLink" prop="component">
          <template #label>
            <div class="flex-y-center">
              组件路径
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  组件页面完整路径，相对于 src/views/，如 system/user/index，缺省后缀 .vue
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.component" placeholder="system/user/index" style="width: 95%">
            <template v-if="formData.type == MenuTypeEnum.MENU" #prepend>src/views/</template>
            <template v-if="formData.type == MenuTypeEnum.MENU" #append>.vue</template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU && !isExternalLink">
          <template #label>
            <div class="flex-y-center">
              路由参数
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  组件页面使用 `useRoute().query.参数名` 获取路由参数值。
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-form-item>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" prop="visible" label="显示状态">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item v-if="formData.type == MenuTypeEnum.BUTTON" label="权限标识" prop="perm">
          <el-input v-model="formData.perm" placeholder="sys:user:create" />
        </el-form-item>

        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" label="图标" prop="icon">
          <!-- 图标选择器 -->
          <icon-select v-model="formData.icon" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="handleCloseDialog">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { useAppStore } from "@/store/modules/app";
import { DeviceEnum } from "@/enums/settings";

import MenuAPI from "@/api/system/menu";
import { MenuTypeEnum } from "@/enums/business";
import { isTenantEnabled } from "@/utils/tenant";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const menuFormRef = ref();

const loading = ref(false);
const dialog = reactive({
  title: "新增菜单",
  visible: false,
});

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));
// 查询参数
const queryParams = reactive({});
// 菜单表格数据
const menuTableData = ref([]);
// 顶级菜单下拉选项
const menuOptions = ref([]);
// 初始菜单表单数据
const initialMenuFormData = ref({
  id: undefined,
  parentId: "0",
  name: "",
  visible: 1,
  sort: 1,
  type: MenuTypeEnum.MENU, // 默认菜单
  icon: "",
  component: "",
  routePath: "",
  perm: "",
  status: 1,
});
// 菜单表单数据
const formData = ref({ ...initialMenuFormData.value });
const isExternalLink = computed(
  () =>
    formData.value.type === MenuTypeEnum.MENU &&
    !!formData.value.routePath &&
    /^https?:\/\//.test(formData.value.routePath)
);
const validateComponent = (_, value, callback) => {
  if (formData.value.type === MenuTypeEnum.MENU && !isExternalLink.value && !value) {
    callback(new Error("请输入组件路径"));
    return;
  }
  callback();
};
// 表单验证规则
const rules = reactive({
  parentId: [{ required: true, message: "请选择父级菜单", trigger: "blur" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  routePath: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
  component: [{ validator: validateComponent, trigger: "blur" }],
  visible: [{ required: true, message: "请选择显示状态", trigger: "change" }],
});

// 选择表格的行菜单ID
const selectedMenuId = ref();

// 查询菜单
function handleQuery() {
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuTableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 行点击事件
function handleRowClick(row) {
  selectedMenuId.value = row.id;
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父菜单ID
 * @param menuId 菜单ID
 */
function handleOpenDialog(parentId, menuId) {
  MenuAPI.getOptions(true)
    .then((data) => {
      menuOptions.value = [{ value: "0", label: "顶级菜单", children: data }];
    })
    .then(() => {
      dialog.visible = true;
      if (menuId) {
        dialog.title = "编辑菜单";
        MenuAPI.getFormData(menuId).then((data) => {
          initialMenuFormData.value = { ...data };
          formData.value = data;
        });
      } else {
        dialog.title = "新增菜单";
        formData.value.parentId = parentId?.toString();
      }
    });
}

// 菜单类型切换
function handleMenuTypeChange() {
  const newType = formData.value.type;
  // 目录类型默认组件为 Layout
  if (newType === MenuTypeEnum.CATALOG) {
    formData.value.component = "Layout";
    formData.value.perm = "";
  } else if (newType === MenuTypeEnum.MENU) {
    formData.value.component = "";
    formData.value.perm = "";
  } else if (newType === MenuTypeEnum.BUTTON) {
    formData.value.component = "";
    formData.value.routePath = "";
    formData.value.perm = "";
  }
}

/**
 * 提交表单
 */
function handleSubmit() {
  menuFormRef.value.validate((isValid) => {
    if (isValid) {
      const menuId = formData.value.id;
      // 数据转换
      let submitData = { ...formData.value };

      // 1. 新增时删除 id
      if (!menuId) {
        delete submitData.id;
      }

      // 2. parentId 转 Int
      submitData.parentId = Number(submitData.parentId);

      // 3. type 转 Int
      const typeMap = {
        [MenuTypeEnum.CATALOG]: 0,
        [MenuTypeEnum.MENU]: 1,
        [MenuTypeEnum.BUTTON]: 2,
      };
      submitData.type = typeMap[submitData.type];

      // 4. routePath 改为 path
      submitData.path = submitData.routePath;
      delete submitData.routePath;

      // 5. 目录类型设置默认组件
      if (submitData.type === 0 && !submitData.component) {
        submitData.component = "Layout";
      }

      // 6. 非按钮类型 perm 设为空字符串
      if (submitData.type !== 2 && submitData.perm === undefined) {
        submitData.perm = "";
      }

      if (menuId) {
        // 修改时父级菜单不能为当前菜单
        if (submitData.parentId == menuId) {
          ElMessage.error("父级菜单不能为当前菜单");
          return;
        }
        MenuAPI.update(menuId, submitData).then(() => {
          ElMessage.success("修改成功");
          handleCloseDialog();
          handleQuery();
        });
      } else {
        MenuAPI.create(submitData).then(() => {
          ElMessage.success("新增成功");
          handleCloseDialog();
          handleQuery();
        });
      }
    }
  });
}

// 删除菜单
function handleDelete(menuId) {
  if (!menuId) {
    ElMessage.warning("请勾选删除项");
    return false;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      MenuAPI.deleteById(menuId)
        .then(() => {
          ElMessage.success("删除成功");
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();
  formData.value = {
    id: undefined,
    parentId: "0",
    name: "",
    visible: 1,
    sort: 1,
    type: MenuTypeEnum.MENU, // 默认菜单
    icon: "",
    component: "",
    routePath: "",
    perm: "",
    status: 1,
  };
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.menu-name-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.menu-name-cell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  min-width: 18px;
  margin-right: 6px;
}

.menu-name-cell__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
