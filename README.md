<div align="center">
  <img alt="MQ Ads Master" width="120" height="120" src="./src/assets/icons/logo3.svg">
  <h1>MQ Ads Master</h1>
  <p>萌趣三方广告数据管理系统</p>

  <img src="https://img.shields.io/badge/Vue-3.5-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-7.3-green.svg"/>
  <img src="https://img.shields.io/badge/Element%20Plus-2.9-blue.svg"/>
  <img src="https://img.shields.io/badge/Pinia-3.0-orange.svg"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
</div>

## 项目简介

MQ Ads Master 是一款面向广告运营人员的广告数据管理系统，支持多广告平台（小米、MTG、BIGO）的广告投放管理和数据分析，帮助运营人员高效管理广告投放、监控投放效果、优化 ROI。

## 功能特性

### 广告投放管理

- **小米广告 (MIAds)**：广告计划、广告组、广告创意三层管理，支持预算修改、状态控制、多账户切换
- **MTG广告 (MTGAds)**：广告层级管理，支持单图/多图/视频创意组装
- **BIGO广告**：统一的数据模型和操作接口

### 数据分析中心

| 模块 | 说明 |
|------|------|
| **综合分析** | ROI分析、投放/变现数据对比、指标自定义配置 |
| **收入分析** | 变现收入统计，支持多维度筛选 |
| **成本分析** | 投放成本统计，实时监控花费 |
| **渠道分析** | 按渠道维度分析，评估渠道效果 |
| **数据获取** | 从各广告平台拉取数据，保持数据同步 |

**分析指标**：花费、激活数、投放展示/点击、变现预估收入、ROI、ROAS、eCPM 等

### 系统管理

| 模块 | 功能 |
|------|------|
| 用户管理 | 用户 CRUD、导入导出、密码重置 |
| 角色管理 | 角色权限分配 |
| 菜单管理 | 动态菜单配置 |
| 部门管理 | 组织架构管理 |
| 字典管理 | 数据字典维护 |
| 日志管理 | 操作日志记录 |
| 通知管理 | 系统通知发布/撤回 |
| 租户管理 | 多租户支持 |

### 特色功能

- **动态路由**：基于权限的动态菜单生成
- **实时推送**：WebSocket + STOMP 消息推送
- **多主题**：亮色/暗色模式切换
- **多布局**：左侧菜单、顶部菜单、混合布局
- **全屏模式**：沉浸式操作体验
- **多语言**：中英文切换
- **标签导航**：多标签页管理

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | Vue 3.5 |
| 构建工具 | Vite 7.3 |
| UI 组件库 | Element Plus 2.9 |
| 状态管理 | Pinia 3.0 |
| 路由管理 | Vue Router 5 |
| HTTP 客户端 | Axios |
| 图表库 | ECharts 6 |
| 国际化 | Vue I18n |

## 项目结构

```
MQ-Ads-Master/
├── src/
│   ├── api/              # API 接口层
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   ├── composables/       # 组合式函数
│   ├── constants/         # 常量定义
│   ├── directives/         # 指令
│   ├── enums/             # 枚举类型
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue
│   └── main.js
├── doc/                   # 文档目录
├── public/                # 公共资源
├── run.bat                # 一键启动脚本
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 20.19.0

### 启动方式

双击运行项目根目录下的 `run.bat` 脚本，即可自动检测环境、安装依赖并启动项目。

或者手动执行以下命令：

```bash
# 安装 pnpm
npm install pnpm -g

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### 访问地址

启动成功后，访问 http://localhost:3000

## License

[MIT License](./LICENSE)
