# 系统通知 API 接口文档

**版本**: v1  
**更新日期**: 2026-03-19  
**基础路径**: `/api/v1/notices`  
**认证方式**: JWT Bearer Token (需要登录后获取)  

---

## 目录

1. [接口概述](#1-接口概述)
2. [数据模型](#2-数据模型)
3. [管理接口](#3-管理接口)
4. [用户接口](#4-用户接口)
5. [重要说明](#5-重要说明)
6. [错误码](#6-错误码)
7. [权限清单](#7-权限清单)

---

## 1. 接口概述

### 1.1 基础信息

- **API版本**: v1
- **基础URL**: `{后端地址}/api/v1/notices`
- **数据格式**: JSON (UTF-8)
- **请求方法**: POST, GET, PUT, DELETE (见各接口说明)

### 1.2 统一响应结构

所有接口返回统一的响应格式：

```json
{
  "code": "00000",
  "msg": "成功",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 业务状态码，00000表示成功 |
| msg | string | 操作结果描述 |
| data | any | 响应数据载荷 |

### 1.3 接口分类

系统将通知接口分为两类：

- **管理接口**：用于管理员创建、编辑、发布、撤回、删除通知
- **用户接口**：用于普通用户查看自己的通知和标记已读

---

## 2. 数据模型

### 2.1 Notice（通知公告）

系统通知对象包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 通知唯一ID (主键) |
| title | string | 通知标题 |
| type | int | 通知类型: 1-版本更新, 2-系统维护, 3-安全提醒, 4-放假通知, 5-活动通知 |
| level | string | 通知级别: L-低, M-中, H-高 |
| target_type | int | 目标类型: 1-全体, 2-指定用户 |
| target_user_ids | string? | 指定用户ID数组 (JSON格式存储，仅当target_type=2时有效) |
| content | string | 通知内容 (HTML格式) |
| publish_status | int | 发布状态: 0-未发布, 1-已发布, -1-已撤回 |
| publisher_id | int? | 发布人ID (外键关联sys_users) |
| publish_time | datetime? | 发布时间 |
| revoke_time | datetime? | 撤回时间 |
| created_at | datetime | 创建时间 (默认当前时间) |
| updated_at | datetime | 更新时间 (自动更新) |

**示例**:
```json
{
  "id": 123,
  "title": "系统维护通知",
  "type": 2,
  "level": "H",
  "target_type": 1,
  "target_user_ids": null,
  "content": "<p>系统将于今晚进行维护升级</p>",
  "publish_status": 1,
  "publisher_name": "张三",
  "publish_time": "2026-03-19 10:00",
  "create_time": "2026-03-19 09:00",
  "revoke_time": null
}
```

### 2.2 NoticeRead（已读记录）

记录用户已读状态：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 记录ID (主键) |
| notice_id | int | 通知ID (外键) |
| user_id | int | 用户ID (外键) |
| read_time | datetime | 阅读时间 |

**复合唯一约束**: (notice_id, user_id)

---

## 3. 管理接口

### 3.1 获取通知列表（管理员）

🔥 **高频核心接口**

**接口**: `GET /api/v1/notices`  
**功能**: 获取系统通知列表，支持分页和筛选  
**权限要求**: `sys:notice:query`

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10，最大100 |
| title | string | 否 | 通知标题（模糊搜索） |
| publishStatus | int | 否 | 发布状态: 0-未发布, 1-已发布, -1-已撤回 |

**请求示例**:
```bash
curl -X GET "http://localhost:8000/api/v1/notices?pageNum=1&pageSize=10&publishStatus=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {
      "id": 123,
      "title": "系统维护通知",
      "publish_status": 1,
      "type": 2,
      "publisher_name": "张三",
      "level": "H",
      "level_label": "高优先级",
      "target_type": 1,
      "target_user_ids": null,
      "publish_time": "2026-03-19 10:00",
      "is_read": null,
      "create_time": "2026-03-19 09:00",
      "revoke_time": null
    }
  ],
  "page": {
    "pageNum": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

---

### 3.2 新增通知

🔥 **高频核心接口**

**接口**: `POST /api/v1/notices`  
**功能**: 创建新的通知（创建后需发布才能对用户可见）  
**权限要求**: `sys:notice:create`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 通知标题 |
| type | int | 是 | 通知类型: 1-版本更新, 2-系统维护, 3-安全提醒, 4-放假通知, 5-活动通知 |
| level | string | 是 | 通知级别: L-低, M-中, H-高 |
| targetType | int | 是 | 目标类型: 1-全体, 2-指定用户 |
| targetUserIds | array | 否 | 指定用户ID数组（当targetType=2时必须提供） |
| content | string | 是 | 通知内容 (HTML格式) |

**请求示例**:
```json
{
  "title": "系统维护通知",
  "type": 2,
  "level": "H",
  "targetType": 1,
  "targetUserIds": [],
  "content": "<p>系统将于今晚22:00-06:00进行维护升级，期间可能影响正常使用。</p>"
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "新增成功",
  "data": null
}
```

**注意事项**:
- 创建的通知默认状态为`未发布` (publish_status=0)
- `targetType=2`时必须提供`targetUserIds`，否则会返回400错误
- `content`字段支持HTML格式，可用于富文本显示

---

### 3.3 获取通知表单数据（编辑用）

**接口**: `GET /api/v1/notices/{notice_id}/form`  
**功能**: 获取指定通知的完整表单数据，用于编辑页面回填  
**权限要求**: `sys:notice:update`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| notice_id | int | 是 | 通知ID |

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "id": 123,
    "title": "系统维护通知",
    "type": 2,
    "level": "H",
    "target_type": 1,
    "target_user_ids": [],
    "content": "<p>系统维护内容...</p>",
    "publish_status": 0,
    "publisher_name": "张三",
    "publish_time": null,
    "create_time": "2026-03-19 09:00",
    "revoke_time": null
  }
}
```

---

### 3.4 获取通知详情

**接口**: `GET /api/v1/notices/{notice_id}/detail`  
**功能**: 获取通知的完整详情（不包含target_user_ids）  
**权限要求**: `sys:notice:query`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| notice_id | int | 是 | 通知ID |

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "id": 123,
    "title": "系统维护通知",
    "type": 2,
    "level": "H",
    "target_type": 1,
    "content": "<p>系统维护内容...</p>",
    "publish_status": 1,
    "publisher_name": "张三",
    "publish_time": "2026-03-19 10:00",
    "create_time": "2026-03-19 09:00"
  }
}
```

---

### 3.5 修改通知

🔥 **高频核心接口**

**接口**: `PUT /api/v1/notices/{notice_id}`  
**功能**: 修改指定通知（仅未发布的通知可修改）  
**权限要求**: `sys:notice:update`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| notice_id | int | 是 | 通知ID |

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 通知标题 |
| type | int | 是 | 通知类型 |
| level | string | 是 | 通知级别 |
| targetType | int | 是 | 目标类型: 1-全体, 2-指定用户 |
| targetUserIds | array | 否 | 指定用户ID数组 |
| content | string | 是 | 通知内容 (HTML格式) |

**请求示例**:
```json
{
  "title": "系统维护通知（已修改）",
  "type": 2,
  "level": "H",
  "targetType": 2,
  "targetUserIds": [1, 2, 3],
  "content": "<p>更新后的维护内容...</p>"
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "修改成功",
  "data": null
}
```

**注意事项**:
- 已发布或已撤回的通知**不能**修改
- 修改后通知仍需重新发布才能对用户可见
- `targetType=2`时必须提供`targetUserIds`

---

### 3.6 批量删除通知

**接口**: `DELETE /api/v1/notices/{notice_ids}`  
**功能**: 批量删除通知，多个ID以英文逗号分割  
**权限要求**: `sys:notice:delete`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| notice_ids | string | 是 | 通知ID列表，英文逗号分隔，如 "1,2,3" |

**请求示例**:
```bash
curl -X DELETE "http://localhost:8000/api/v1/notices/1,2,3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "删除成功",
  "data": null
}
```

---

### 3.7 发布通知

🔥 **高频核心接口**

**接口**: `PUT /api/v1/notices/{notice_id}/publish`  
**功能**: 发布指定通知，使其对目标用户可见  
**权限要求**: `sys:notice:publish`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| notice_id | int | 是 | 通知ID |

**响应示例**:
```json
{
  "code": "00000",
  "msg": "发布成功",
  "data": null
}
```

**注意事项**:
- 仅未发布的通知可以发布
- 已撤回的通知不能重新发布，需重新创建
- 发布后`publish_status`变为1，`publish_time`设为当前时间

---

### 3.8 撤回通知

**接口**: `PUT /api/v1/notices/{notice_id}/revoke`  
**功能**: 撤回已发布的通知（用户将无法查看）  
**权限要求**: `sys:notice:revoke`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| notice_id | int | 是 | 通知ID |

**响应示例**:
```json
{
  "code": "00000",
  "msg": "撤回成功",
  "data": null
}
```

**注意事项**:
- 仅已发布的通知可以撤回
- 撤回后`publish_status`变为-1，`revoke_time`设为当前时间

---

## 4. 用户接口

### 4.1 我的通知列表

**接口**: `GET /api/v1/notices/my`  
**功能**: 获取当前用户收到的通知列表（仅已发布的通知）  
**认证要求**: 需要登录（可选，未登录返回空列表）

**查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10，最大100 |
| title | string | 否 | 通知标题（模糊搜索） |
| isRead | int | 否 | 已读状态: 0-未读, 1-已读 |

**请求示例**:
```bash
curl -X GET "http://localhost:8000/api/v1/notices/my?pageNum=1&pageSize=10&isRead=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {
      "id": 123,
      "title": "系统维护通知",
      "type": 2,
      "level": "H",
      "publisher_name": "张三",
      "publish_time": "2026-03-19 10:00",
      "is_read": 0
    }
  ],
  "page": {
    "pageNum": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

**筛选逻辑**:
- 仅返回 `publish_status=1` 的通知
- 包含`target_type=1`（全体）或`target_user_ids`包含当前用户ID的通知
- 排除已撤回的通知（publish_status=-1）

---

### 4.2 标记全部已读

**接口**: `PUT /api/v1/notices/read-all`  
**功能**: 将当前用户的所有未读通知标记为已读  
**认证要求**: 需要登录

**响应示例**:
```json
{
  "code": "00000",
  "msg": "操作成功",
  "data": null
}
```

**注意事项**:
- 仅标记当前用户的未读记录
- 会跳过已存在的已读记录，避免重复创建

---

## 5. 重要说明

### 5.1 HTML内容处理

通知内容 (`content`) 字段支持HTML格式，前端渲染时需注意：

```javascript
// Vue/React中渲染HTML
<div v-html="notice.content"></div>
// 或
<div dangerouslySetInnerHTML={{ __html: notice.content }}></div>
```

**安全提醒**:
- 后台需对HTML内容进行XSS过滤（使用` bleach `或类似库）
- 前端渲染时注意防范XSS攻击

---

### 5.2 已读状态管理

已读状态通过 `sys_notice_reads` 表独立记录：

- **标记已读**: 当用户查看通知详情时，应调用某个接口或在查看时自动插入已读记录
- **查询状态**: `我的通知`接口返回的`is_read`字段表示当前用户是否已读
- **批量已读**: `PUT /api/v1/notices/read-all` 用于一键全部已读

**当前缺失**: 系统没有独立的"标记单条已读"接口，建议在查看通知详情时自动插入已读记录。

---

### 5.3 通知状态流转

notification 的 `publish_status` 有以下状态：

| 状态值 | 名称 | 说明 | 可操作 |
|--------|------|------|--------|
| 0 | 未发布 | 草稿状态 | 修改、删除、发布 |
| 1 | 已发布 | 对目标用户可见 | 撤回 |
| -1 | 已撤回 | 撤回后不可恢复 | 无 |

**状态转换图**:
```
未发布 (0) ──发布──> 已发布 (1) ──撤回──> 已撤回 (-1)
    │                              ↑
    └──────────删除───────────────┘
```

---

### 5.4 目标用户筛选逻辑

通知的目标用户筛选逻辑：

```python
# 查询条件：已发布 AND (全体 OR 包含当前用户)
query = db.query(Notice).filter(
    Notice.publish_status == 1,
    or_(
        Notice.target_type == 1,
        Notice.target_user_ids.contains(str(user_id))
    )
)
```

**target_user_ids 存储格式**: JSON数组字符串，如 `"[1,2,3]"`
**查询方式**: 使用`contains`模糊匹配，简单但可能误匹配（如`[10]`也会匹配`[1]`）。生产环境建议使用数据库JSON函数。

---

### 5.5 通知类型与级别

**通知类型 (type)**:

| 值 | 说明 | 适用场景 |
|----|------|----------|
| 1 | 版本更新 | App版本更新提醒 |
| 2 | 系统维护 | 系统停机维护通知 |
| 3 | 安全提醒 | 密码过期、账户异常 |
| 4 | 放假通知 | 节假日安排 |
| 5 | 活动通知 | 运营活动推广 |

**通知级别 (level)**:

| 值 | 标签 | 显示建议 |
|----|------|----------|
| L | 低优先级 | 灰色显示 |
| M | 中优先级 | 橙色显示 |
| H | 高优先级 | 红色显示或加粗 |

---

### 5.6 日期时间格式

所有时间字段均使用 **"YYYY-MM-DD HH:MM"** 格式字符串返回：

```python
publish_time = notice.publish_time.strftime("%Y-%m-%d %H:%M") if notice.publish_time else None
```

前端可直接用于显示，如 `"2026-03-19 10:00"`

---

## 6. 错误码

### 6.1 业务错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 00000 | 成功 | - |
| 400 | 请求参数错误 | 检查请求体字段和类型 |
| 401 | 未认证 | Token无效或缺失 |
| 403 | 无权限 | 确认用户角色包含所需权限 |
| 404 | 资源不存在 | 检查通知ID是否正确 |
| 500 | 服务器内部错误 | 查看后端日志 |

### 6.2 HTTP 状态码

| 状态码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求体格式 |
| 401 | 未认证 | 重新登录获取Token |
| 403 | 无权限 | 联系管理员授权 |
| 404 | 资源不存在 | 通知ID不存在或已被删除 |
| 422 | 参数校验失败 | 返回详细错误信息 |

---

## 7. 权限清单

通知系统需要以下权限（RBAC模型）：

| 权限标识 | 权限名称 | 接口对应 | 描述 |
|----------|----------|----------|------|
| sys:notice:query | 通知查询 | GET `/api/v1/notices`<br>GET `/api/v1/notices/{id}/detail` | 查看通知列表和详情 |
| sys:notice:create | 通知新增 | POST `/api/v1/notices` | 创建新通知 |
| sys:notice:update | 通知编辑 | PUT `/api/v1/notices/{id}`<br>GET `/api/v1/notices/{id}/form` | 修改通知内容 |
| sys:notice:delete | 通知删除 | DELETE `/api/v1/notices/{ids}` | 批量删除通知 |
| sys:notice:publish | 通知发布 | PUT `/api/v1/notices/{id}/publish` | 发布通知 |
| sys:notice:revoke | 通知撤回 | PUT `/api/v1/notices/{id}/revoke` | 撤回已发布通知 |

**角色分配建议**:
- **超级管理员**: 拥有所有权限
- **运营人员**: `sys:notice:query`, `sys:notice:create`, `sys:notice:update`
- **审核员**: `sys:notice:query`, `sys:notice:publish`, `sys:notice:revoke`

---

## 附录

### 附录A：接口清单汇总

#### 管理接口 (8个)
1. `GET /api/v1/notices` - 获取通知列表（分页）
2. `POST /api/v1/notices` - 新增通知
3. `GET /api/v1/notices/{notice_id}/form` - 获取通知表单数据
4. `GET /api/v1/notices/{notice_id}/detail` - 获取通知详情
5. `PUT /api/v1/notices/{notice_id}` - 修改通知
6. `DELETE /api/v1/notices/{notice_ids}` - 批量删除通知
7. `PUT /api/v1/notices/{notice_id}/publish` - 发布通知
8. `PUT /api/v1/notices/{notice_id}/revoke` - 撤回通知

#### 用户接口 (2个)
9. `GET /api/v1/notices/my` - 我的通知分页列表
10. `PUT /api/v1/notices/read-all` - 全部已读

**总计**: 10个路由端点

---

### 附录B：快速开始示例

#### 1. 管理员创建并发布通知

```javascript
// Step 1: 创建通知
const createRes = await fetch('/api/v1/notices', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "系统维护通知",
    type: 2,
    level: "H",
    targetType: 1,
    targetUserIds: [],
    content: "<p>系统将于今晚22:00-06:00进行维护升级</p>"
  })
});
const notice = createRes.data;

// Step 2: 发布通知
await fetch(`/api/v1/notices/${notice.id}/publish`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 2. 用户获取我的未读通知

```javascript
const myNoticesRes = await fetch('/api/v1/notices/my?pageSize=10&isRead=0', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const unreadNotices = myNoticesRes.data;

// 渲染通知列表
unreadNotices.forEach(notice => {
  console.log(`${notice.title} - ${notice.publisher_name} ${notice.publish_time}`);
});
```

---

### 附录C：开发工具

- **Swagger UI**: http://localhost:8000/docs (自动生成API文档，路径 `/api/v1/notices`)
- **后端源码**: 
  - 通知路由: `app/routers/system/notices.py`
  - 数据模型: `app/models.py` (Notice, NoticeRead)
  - 数据Schema: `app/schemas.py` (NoticeCreate, NoticeUpdate, NoticeItem等)

---

**文档维护**: 如有接口变更，请同步更新此文档和后端 Swagger 注释。
