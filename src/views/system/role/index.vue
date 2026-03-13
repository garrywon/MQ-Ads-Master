<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="角色名称"
            clearable
            @input="handleSearch"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-section">
      <div class="table-section__toolbar">
        <div class="table-section__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
          <el-button
            type="danger"
            :disabled="ids.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        class="table-section__content"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" prop="name" min-width="100" />
        <el-table-column label="角色编码" prop="code" width="150" />

        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.size"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="角色ID" v-if="formData.id">
          <el-input v-model="formData.id" disabled />
        </el-form-item>

        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="formData.name"
            :disabled="!!formData.id"
            placeholder="请输入角色名称"
          />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="formData.code"
            :disabled="!!formData.id"
            placeholder="请输入角色编码"
          />
        </el-form-item>

        <el-form-item label="菜单权限" prop="menuIds">
          <el-tree-select
            ref="menuTreeRef"
            v-model="formData.menuIds"
            :data="menuOptions"
            node-key="value"
            show-checkbox
            :props="{ children: 'children', label: 'label' }"
            multiple
            :render-after-expand="false"
            :check-strictly="!parentChildLinked"
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="2"
            placeholder="请选择菜单权限"
            style="width: 100%"
            @check="handleMenuCheck"
          />
          <!-- 联动切换按钮 -->
          <div class="mt-2 flex items-center">
            <el-button
              type="primary"
              size="small"
              plain
              @click="parentChildLinked = !parentChildLinked"
            >
              <el-icon><Switch /></el-icon>
              {{ parentChildLinked ? "父子联动" : "父子独立" }}
            </el-button>
            <el-tooltip placement="bottom">
              <template #content>关闭联动后，父菜单和子菜单选择独立，需分别勾选</template>
              <el-icon class="ml-2 color-[--el-color-primary] cursor-pointer">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="handleCloseDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useAppStore } from "@/store/modules/app";
import { DeviceEnum } from "@/enums/settings";

import RoleAPI from "@/api/system/role";
import MenuAPI from "@/api/system/menu";
import { Switch, QuestionFilled } from "@element-plus/icons-vue";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const appStore = useAppStore();

const queryFormRef = ref();
const roleFormRef = ref();
const menuTreeRef = ref();

const loading = ref(false);
const ids = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  size: 10,
});

// 角色表格数据
const roleList = ref();
// 原始角色数据（用于前端筛选）
const allRoleList = ref([]);
// 菜单树选项
const menuOptions = ref([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 角色表单
const formData = reactive({
  menuIds: [],
  sort: 5,
  status: 1,
});

// 父子联动开关
const parentChildLinked = ref(true);

const rules = reactive({
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  menuIds: [{ required: true, message: "请选择菜单权限", trigger: "blur" }],
});

// 获取数据
function fetchData() {
  loading.value = true;
  RoleAPI.getPage(queryParams)
    .then((data) => {
      roleList.value = data.items;
      total.value = data.total ?? 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 查询（重置页码后获取数据）
function handleQuery() {
  queryParams.page = 1;
  fetchData();
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.page = 1;
  fetchData();
}

// 行复选框选中
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
}

// 打开角色弹窗
async function handleOpenDialog(roleId) {
  dialog.visible = true;

  // 获取菜单选项
  if (menuOptions.value.length === 0) {
    menuOptions.value = await MenuAPI.getOptions();
  }

  if (roleId) {
    dialog.title = "修改角色";
    formData.id = roleId;
    // 从列表中获取角色基本信息
    const role = roleList.value.find((r) => r.id === roleId);
    if (role) {
      formData.name = role.name;
      formData.code = role.code;
      formData.sort = role.sort;
      formData.status = role.status;
    }
    // 获取角色的菜单权限
    const menuIds = await RoleAPI.getRoleMenuIds(roleId);
    formData.menuIds = menuIds;
    // 等待树渲染后设置选中状态
    await nextTick();
    if (menuTreeRef.value) {
      menuTreeRef.value.setCheckedKeys(formData.menuIds);
    }
  } else {
    dialog.title = "新增角色";
    formData.sort = 1;
    formData.status = 1;
    formData.menuIds = [];
    await nextTick();
    if (menuTreeRef.value) {
      menuTreeRef.value.setCheckedKeys([]);
    }
  }
}

// 处理菜单权限勾选（同步树选中状态到 formData）
function handleMenuCheck() {
  const tree = menuTreeRef.value?.tree;
  if (tree) {
    const checkedKeys = tree.getCheckedKeys();
    formData.menuIds = checkedKeys.map(Number); // 转换为数字数组
  }
}

// 提交角色表单
async function handleSubmit() {
  roleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        let roleId = formData.id;

        if (roleId) {
          // 编辑模式：只更新菜单权限
          console.log("更新菜单权限请求参数:", {
            roleId: roleId,
            menuIds: formData.menuIds,
          });
          if (formData.menuIds.length > 0) {
            await RoleAPI.updateRoleMenus(roleId, formData.menuIds);
          }
        } else {
          // 新增模式：创建角色基本信息
          const response = await RoleAPI.create({
            name: formData.name,
            code: formData.code,
            sort: formData.sort,
            status: formData.status,
          });
          roleId = response.data.id;
          // 分配菜单权限
          console.log("更新菜单权限请求参数:", {
            roleId: roleId,
            menuIds: formData.menuIds,
          });
          if (formData.menuIds.length > 0) {
            await RoleAPI.updateRoleMenus(roleId, formData.menuIds);
          }
        }

        ElMessage.success(roleId ? "更新成功" : "创建成功");
        handleCloseDialog();
        handleResetQuery();
      } catch (error) {
        console.error(error);
        ElMessage.error(error.message || "操作失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;

  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 5;
  formData.status = 1;
  formData.menuIds = [];
}

// 删除角色
function handleDelete(roleId) {
  const roleIds = [roleId || ids.value].join(",");
  if (!roleIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      RoleAPI.deleteByIds(roleIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
