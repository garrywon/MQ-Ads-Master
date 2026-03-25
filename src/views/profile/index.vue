<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="user-card">
          <div class="user-info">
            <div class="avatar-wrapper">
              <el-avatar :src="userDetail.avatar" :size="100" />
              <el-button
                type="info"
                class="avatar-edit-btn"
                circle
                :icon="Camera"
                size="small"
                @click="triggerFileUpload"
              />
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                accept="image/*"
                @change="handleFileChange"
              />
            </div>
            <div class="user-name">
              <span class="nickname">{{ userDetail.nickname }}</span>
            </div>
            <div class="user-role">{{ roleNames }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>账号信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">
              {{ userDetail.username }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ userDetail.createTime }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ userDetail.updateTime || "未更新" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">账户密码</div>
              <div class="security-desc">定期修改密码有助于保护账户安全</div>
            </div>
            <el-button type="primary" link @click="handleOpenPasswordDialog">修改</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" :width="500">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        :label-width="100"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import UserAPI from "@/api/system/user";
import FileAPI from "@/api/file";
import { useUserStore } from "@/store";
import { redirectToLogin } from "@/utils/auth";
import { Camera } from "@element-plus/icons-vue";

const userStore = useUserStore();

const userDetail = ref({
  userId: null,
  username: "",
  nickname: "",
  avatar: "",
  createTime: "",
  roles: [],
});

const roleNames = computed(() => {
  if (!userDetail.value.roles || userDetail.value.roles.length === 0) {
    return "";
  }
  return userDetail.value.roles.map((r) => r.name).join("、");
});

const passwordDialogVisible = ref(false);
const passwordFormRef = ref();
const fileInput = ref();

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

async function loadUserDetail() {
  const userId = userStore.userInfo.userId;
  if (!userId) {
    ElMessage.error("用户ID不存在，请重新登录");
    return;
  }
  const data = await UserAPI.getUserDetail(userId);
  userDetail.value = data;
}

function handleOpenPasswordDialog() {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordDialogVisible.value = true;
}

async function handleSubmitPassword() {
  const valid = await passwordFormRef.value?.validate();
  if (!valid) return;

  try {
    await UserAPI.changeMyPassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });
    ElMessage.success("密码修改成功，请重新登录");
    passwordDialogVisible.value = false;
    await redirectToLogin("密码已修改，请重新登录");
  } catch (error) {
    // ignore
  }
}

function triggerFileUpload() {
  fileInput.value.click();
}

async function handleFileChange(event) {
  const target = event.target;
  const file = target?.files?.[0];
  if (file) {
    try {
      const data = await FileAPI.uploadFile(file);
      await UserAPI.updateProfile({
        avatar: data.url,
      });
      userStore.userInfo.avatar = data.url;
      userDetail.value.avatar = data.url;
    } catch (error) {
      console.error("头像上传失败：" + error);
      ElMessage.error("头像上传失败");
    }
  }
}

onMounted(async () => {
  await loadUserDetail();
});
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: calc(100vh - 84px);
  padding: 20px;
  background: var(--el-fill-color-blank);
}

.user-card {
  .user-info {
    padding: 20px 0;
    text-align: center;

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;

      .avatar-edit-btn {
        position: absolute;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }

    .user-name {
      margin-bottom: 8px;

      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .user-role {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.info-card,
.security-card {
  margin-bottom: 20px;

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;

  .security-info {
    .security-title {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .security-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.el-descriptions {
  .el-descriptions__label {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .el-descriptions__content {
    color: var(--el-text-color-primary);
  }
}

.el-dialog {
  .el-dialog__header {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .el-dialog__body {
    padding: 30px 20px;
  }

  .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .el-col {
    width: 100%;
  }
}
</style>
