# Mars3D 后台管理系统

<p align="center">基于 Vue 3 + Vite + Ant Design Vue 的 Mars3D 后台管理前端</p>

## 项目介绍

Mars3D 后台管理系统是三维地理信息平台的管理端，提供用户管理、角色管理、权限管理、图层配置、地图标记管理、视角书签管理、操作日志等功能。

## 技术选型

- **框架**: [Vue 3](https://vuejs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 组件**: [Ant Design Vue 4](https://www.antdv.com/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router 4](https://router.vuejs.org/)
- **HTTP 客户端**: [Axios](https://axios-http.com/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)

## 功能模块

| 模块 | 功能 |
|------|------|
| 仪表盘 | 系统统计概览、最近操作日志 |
| 用户管理 | 用户 CRUD、角色分配、状态启用/禁用 |
| 角色管理 | 角色 CRUD、权限分配（树形选择）、图层权限分配 |
| 权限管理 | 权限树 CRUD（菜单/按钮/API 三种类型） |
| 日志管理 | 操作日志查询、筛选、统计 |
| 图层管理 | 图层配置 CRUD、JSON 配置编辑器 |
| 标记管理 | 地图标记列表、GeoJSON 预览、删除 |
| 书签管理 | 视角书签列表、查看视角配置 |
| 个人信息 | 查看当前用户信息和权限 |

## 快速开始

### 环境要求

- **Node.js**: >= 18.0.0

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

访问 http://localhost:3001

### 编译构建

```bash
npm run build
```

## 配置说明

### 开发代理

`vite.config.ts` 中配置了 API 代理，开发环境自动将 `/api` 请求转发到后端：

```ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

### 权限指令

使用 `v-permission` 按钮级权限指令控制元素显示：

```vue
<a-button v-permission="'system:user:create'">新增用户</a-button>
```

## 项目结构

```
src/
├── main.ts                # 入口文件
├── api/                   # API 接口定义
│   ├── http.ts            # Axios 封装
│   ├── auth.ts            # 认证接口
│   ├── user.ts            # 用户接口
│   ├── role.ts            # 角色接口
│   ├── permission.ts      # 权限接口
│   ├── layer.ts           # 图层接口
│   ├── marker.ts          # 标记接口
│   ├── bookmark.ts        # 书签接口
│   └── log.ts             # 日志接口
├── directives/            # 自定义指令
│   └── permission.ts      # 权限指令
├── layouts/               # 布局组件
│   └── BasicLayout.vue    # 后台主布局
├── router/                # 路由配置
├── store/                 # 状态管理
│   └── modules/
│       ├── auth.ts        # 认证状态
│       └── menu.ts        # 菜单状态
├── utils/                 # 工具函数
│   ├── auth.ts            # Token 存储
│   └── permission.ts      # 权限判断
└── views/                 # 页面视图
    ├── login/             # 登录页
    ├── dashboard/         # 仪表盘
    ├── profile/           # 个人信息
    ├── system/            # 系统管理
    │   ├── user/          # 用户管理
    │   ├── role/          # 角色管理
    │   ├── permission/    # 权限管理
    │   └── log/           # 日志管理
    └── mapconfig/         # 地图配置
        ├── layers/        # 图层管理
        ├── markers/       # 标记管理
        └── bookmarks/     # 书签管理
```

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 依赖服务

本项目需要配合 [mars3d-api](../mars3d-api) 后端服务使用，请先启动后端服务。

## 许可证

Apache-2.0
