<script setup lang="ts">
/**
 * 默认布局 - 左右布局（侧边栏 + 主内容区）
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor,
  User,
  OfficeBuilding,
  Suitcase,
  Refresh,
  DataAnalysis,
  Fold,
  Expand,
  Sunny,
  Moon,
  SwitchButton,
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const isCollapsed = computed(() => appStore.sidebarCollapsed)
const menuList = computed(() => appStore.menuList)
const activeMenu = computed(() => router.currentRoute.value.path)

const iconMap: Record<string, any> = {
  Monitor,
  User,
  OfficeBuilding,
  Suitcase,
  Refresh,
  DataAnalysis,
}

const handleToggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleToggleTheme = () => {
  toggleTheme()
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出失败，请稍后重试')
    }
  }
}
</script>

<template>
  <el-container class="h-screen">
    <!-- 左侧菜单 -->
    <el-aside
      :width="isCollapsed ? '64px' : '240px'"
      class="transition-all duration-300 border-r border-gray-200 dark:border-gray-700"
    >
      <!-- Logo -->
      <div
        class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 relative overflow-hidden"
      >
        <Transition name="logo-fade" mode="out-in">
          <span
            v-if="!isCollapsed"
            key="full"
            class="text-xl font-bold text-primary"
            >数据分析平台</span
          >
          <span v-else key="short" class="text-xl font-bold text-primary"
            >BI</span
          >
        </Transition>
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :unique-opened="true"
        router
        class="h-[calc(100vh-64px)] border-none"
      >
        <el-menu-item
          v-for="item in menuList"
          :key="item.id"
          :index="item.path"
        >
          <el-icon v-if="item.icon">
            <component :is="iconMap[item.icon]" />
          </el-icon>
          <template #title>{{ item.name }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header
        class="h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <!-- 左侧 -->
        <div class="flex items-center space-x-4">
          <el-button
            :icon="isCollapsed ? Expand : Fold"
            circle
            @click="handleToggleSidebar"
          />
        </div>

        <!-- 右侧 -->
        <div class="flex items-center space-x-4">
          <!-- 主题切换 -->
          <el-button
            :icon="isDark ? Moon : Sunny"
            circle
            @click="handleToggleTheme"
          />

          <!-- 用户信息 -->
          <el-dropdown>
            <div class="flex items-center cursor-pointer">
              <el-avatar :size="32" :src="authStore.avatar">
                {{ authStore.name.charAt(0) }}
              </el-avatar>
              <span
                class="ml-2 text-sm"
                >{{ authStore.name || authStore.username }}</span
              >
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon class="mr-2"><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="bg-gray-50 dark:bg-gray-900">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.el-container {
  overflow: hidden;
}

.el-aside {
  background-color: var(--el-bg-color);
  overflow: hidden;
}

.el-header {
  height: 64px !important; /* 与侧边栏logo区域对齐 */
  padding: 0 20px;
  flex-shrink: 0; /* 防止header被压缩 */
}

.el-main {
  padding: 20px;
  overflow-y: auto; /* 只在主内容区域允许垂直滚动 */
  overflow-x: hidden;
}

/* Logo 过渡动画 */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all 0.3s ease;
}

.logo-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.logo-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.logo-fade-enter-to,
.logo-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
