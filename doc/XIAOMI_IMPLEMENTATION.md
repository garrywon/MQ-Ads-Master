# 小米广告平台 API 接口文档

**版本**: v2  
**更新日期**: 2026-03-09  
**基础路径**: `/api/v1/mi`  
**认证方式**: JWT Bearer Token (需要登录后获取)  

---

## 目录

1. [接口概述](#1-接口概述)
2. [数据模型](#2-数据模型)
3. [建单接口](#3-建单接口)
4. [查询接口](#4-查询接口)
5. [更新接口](#5-更新接口)
6. [通用平台接口](#6-通用平台接口)
7. [数据字段对照表](#7-数据字段对照表)
8. [重要说明](#8-重要说明)
9. [错误码](#9-错误码)

---

## 1. 接口概述

### 1.1 基础信息

- **API版本**: Xiaomi Marketing API v2
- **基础URL**: `{后端地址}/api/v1/mi`
- **通用平台接口**: `{后端地址}/api/v1/platform/MI`
- **数据格式**: JSON (UTF-8)
- **请求方法**: POST, GET (见各接口说明)

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

### 1.3 建单 vs 查询

系统将接口分为两类：

- **建单接口** (`/create/*`): 用于创建广告时选择配置项（账户、区域、媒体版位等）
- **查询接口** (`/query/*`): 用于查询已有广告的数据

**关键区别**: 
- 建单接口使用 `/foreign/` 前缀的API（与报表API不同）
- 查询接口使用 `/marketing/` 前缀的API（与报表API相同）

---

## 2. 数据模型

### 2.1 Campaign（广告计划）

广告计划对象包含以下字段：

| 字段名 | 类型 | 说明 | 小米API对应字段 |
|--------|------|------|----------------|
| campaign_id | string | 计划唯一ID | campaignId |
| campaign_name | string | 计划名称 | campaignName |
| status | enum | 状态: ACTIVE/PAUSED | status (0=投放中, 1=暂停) |
| budget | decimal | 日预算 (USD × 100000) | dayBudget |
| bid | decimal? | 出价 (计划层级无此字段) | - |
| spend | decimal | 已消耗金额 (readonly) | - |
| currency | string | 货币单位，固定为 USD | - |
| package_name | string? | 应用包名 (可能为空) | - |
| ads_id | string? | 广告主账号ID | advertiserId |
| created_at | datetime | 创建时间 (GMT+8) | createTime (毫秒时间戳) |
| updated_at | datetime | 更新时间 (GMT+8) | updateTime (毫秒时间戳) |
| campaign_type | int | 计划类型 (1=应用下载, 2=H5, 3=再营销) | campaignType |
| raw_data | object | 原始API响应数据 (调试用) | - |

**示例**:
```json
{
  "campaign_id": "123456",
  "campaign_name": "三星渠道投放",
  "status": "ACTIVE",
  "budget": 5000000.0,
  "currency": "USD",
  "ads_id": "78910",
  "created_at": "2026-03-09T10:00:00",
  "updated_at": "2026-03-09T12:00:00",
  "campaign_type": 1
}
```

### 2.2 Group（广告组）

广告组对象包含以下字段：

| 字段名 | 类型 | 说明 | 小米API对应字段 |
|--------|------|------|----------------|
| group_id | string | 组唯一ID | groupId |
| group_name | string | 组名称 | groupName |
| campaign_id | string | 所属计划ID | campaignId |
| status | enum | 状态: ACTIVE/PAUSED | status (0/1) |
| budget | decimal | 日预算 (USD × 100000) | dayBudget |
| bid | decimal? | 出价 (USD × 100000) | bid |
| package_name | string? | 应用包名 | packageName |
| ads_id | string? | 广告主账号ID | advertiserId |
| created_at | datetime? | 创建时间 | createTime |
| updated_at | datetime? | 更新时间 | updateTime |
| product_type | int | 推广产品 (1=GA, 2=GP) | productType |
| billing_type | int | 出价类型 (11=CPA, 2=CPC) | billingType |
| regions | string[] | 投放国家/地区代码 | region |
| optimize_goal | int | 优化目标 (1=激活, 2=点击, 3=应用内事件, 4=转化价值, 5=网站内事件) | optimizeGoal |
| optimize_event | int? | 优化事件ID | optimizeEvent |
| raw_data | object | 原始API响应数据 | - |

**示例**:
```json
{
  "group_id": "654321",
  "group_name": "测试组",
  "campaign_id": "123456",
  "status": "ACTIVE",
  "budget": 5000000.0,
  "bid": 2000000.0,
  "package_name": "com.example.app",
  "ads_id": "78910",
  "product_type": 2,
  "billing_type": 2,
  "regions": ["CN", "US"],
  "optimize_goal": 1
}
```

### 2.3 Creative（广告创意）

广告创意对象包含以下字段：

| 字段名 | 类型 | 说明 | 小米API对应字段 |
|--------|------|------|----------------|
| creative_id | string | 创意唯一ID | creativeId |
| creative_name | string | 创意名称 | creativeName |
| group_id | string | 所属组ID | groupId |
| campaign_id | string | 所属计划ID | campaignId |
| status | enum | 状态: ACTIVE/PAUSED | status (0/1) |
| title | string? | 广告标题 | title |
| description | string? | 广告描述 | description |
| image_urls | string[] | 图片URL列表 | imageUrl (单个) |
| video_urls | string[] | 视频URL列表 | videoUrl (单个) |
| landing_url | string? | 落地页链接 | landingUrl |
| icon_url | string? | 图标URL | iconUrl |
| ads_id | string? | 广告主账号ID | advertiserId |
| created_at | datetime? | 创建时间 | createTime |
| updated_at | datetime? | 更新时间 | updateTime |
| raw_data | object | 原始API响应数据 | - |

**示例**:
```json
{
  "creative_id": "111222",
  "creative_name": "创意素材1",
  "group_id": "654321",
  "campaign_id": "123456",
  "status": "ACTIVE",
  "title": "游戏标题",
  "description": "游戏描述",
  "image_urls": ["https://..."],
  "video_urls": [],
  "landing_url": "https://example.com/download"
}
```

### 2.4 OperationResult（操作结果）

写操作返回此模型：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 操作是否成功 |
| message | string | 操作结果消息 |
| data | object? | 返回数据（如ID） |
| error_code | string? | 错误代码（失败时） |
| raw_response | string? | 原始API响应（调试用） |

### 2.5 CampaignStatus 枚举

```typescript
enum CampaignStatus {
  ACTIVE = "active",    // 投放中
  PAUSED = "paused",    // 已暂停
  PENDING = "pending",  // 审核中
  REJECTED = "rejected", // 审核拒绝
  DELETED = "deleted"   // 已删除
}
```

**小米平台实际支持**: 仅 ACTIVE (0) 和 PAUSED (1)

---

## 3. 建单接口 (Creation APIs)

建单接口用于创建广告时获取可选项（账户、区域、媒体版位等）。

### 3.1 获取广告账户列表

🔥 **高频核心接口**

**接口**: `GET /api/v1/mi/create/accounts/list`  
**功能**: 获取小米广告账户列表  
**数据来源**: 从 `UA_Reports` 表查询小米渠道的去重 `Ads_Id`  

**请求参数**: 无

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {"accountId": 11281, "accountName": "Account_11281"},
    {"accountId": 11392, "accountName": "Account_11392"}
  ]
}
```

**返回字段**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| accountId | int | 广告账户ID |
| accountName | string | 账户名称 (格式: Account_{id}) |

**注意事项**:
- 账户ID来自历史报表数据，如无数据则返回空列表
- 创建计划/组时需要使用此 `accountId`

---

### 3.2 创建广告计划

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/create/campaigns`  
**底层API**: `/foreign/marketing/campaign/add`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_id | int | ✅ | 广告账户ID | 11281 |
| campaign_name | string | ❌ | 计划名称 | "测试计划" |
| day_budget | int | ❌ | 日预算 (USD × 100000) | 3000000 |
| campaign_type | int | ❌ | 计划类型，默认1 | 1 |

**计划类型说明**:
- `1`: 应用下载
- `2`: H5
- `3`: 再营销

**预算单位重要说明**:  
小米API要求预算字段为 **USD × 100000**，即：
- 1 USD = 100000
- 50 USD = 5000000
- 0.5 USD = 50000

**请求示例**:
```json
{
  "account_id": 11281,
  "campaign_name": "测试计划",
  "day_budget": 3000000,
  "campaign_type": 1
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "Campaign创建成功",
  "data": {
    "campaign_id": "987654",
    "uniKey": "abc123def456"
  }
}
```

**响应字段**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| campaign_id | string | 新建计划的ID |
| uniKey | string | 唯一键（用于幂等） |

---

### 3.3 创建广告组

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/create/groups`  
**底层API**: `/foreign/marketing/v2/group/add`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_id | int | ✅ | 广告账户ID | 333 |
| campaign_id | int | ✅ | 所属计划ID | 125009 |
| group_name | string | ❌ | 广告组名称 | "测试组" |
| package_name | string | ❌ | 应用包名 | "com.example.app" |
| product_type | int | ❌ | 推广产品，默认2 | 2 |
| placement_choice | int | ❌ | 版位选择，默认1 | 1 |
| display_type | int | ❌ | 细分版位类型 (1-13) | 13 |
| regions | string[] | ✅ | 投放国家/地区代码 | ["CN", "US"] |
| billing_type | int | ❌ | 出价类型，默认2 | 2 |
| bid | int | ✅ | 目标成本 (USD × 100000) | 2000000 |
| day_budget | int | ✅ | 日预算 (USD × 100000) | 500000 |
| total_budget | int | ✅ | 总预算 (USD × 100000) | 10000000 |
| begin_time | int | ✅ | 投放起始时间 (毫秒时间戳) | 1742352000000 |
| end_time | int | ✅ | 投放结束时间 (毫秒时间戳) | 1744934400000 |
| optimize_goal | int | ❌ | 优化目标，默认1 | 1 |
| optimize_event | int | ❌ | 优化事件ID | - |

**参数详细说明**:

**推广产品 (product_type)**:
- `1`: GA (Google Play)
- `2`: GP (其他应用商店)

**版位选择 (placement_choice)**:
- `1`: 通投智选
- `2`: 自选版位

**细分版位 (display_type)**:
| 值 | 说明 |
|----|------|
| 1 | 信息流 |
| 2 | 图标 |
| 3 | 系统默认开屏 |
| 6 | banner |
| 7 | 插屏 |
| 8 | 激励视频 |
| 9 | PUSH |
| 12 | 锁屏画报 |
| 13 | 通投智选 |

**出价类型 (billing_type)**:
- `11`: CPA
- `2`: CPC

**优化目标 (optimize_goal)**:
| 值 | 说明 |
|----|------|
| 1 | 激活 |
| 2 | 点击 |
| 3 | 应用内事件 |
| 4 | 转化价值 |
| 5 | 网站内事件 |

**请求示例**:
```json
{
  "account_id": 333,
  "campaign_id": 125009,
  "group_name": "测试广告组",
  "package_name": "com.example.app",
  "product_type": 2,
  "placement_choice": 1,
  "display_type": 13,
  "regions": ["CN", "US"],
  "billing_type": 2,
  "bid": 2000000,
  "day_budget": 500000,
  "total_budget": 10000000,
  "begin_time": 1742352000000,
  "end_time": 1744934400000,
  "optimize_goal": 1
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "Group创建成功",
  "data": {
    "group_id": 987321,
    "uniKey": "xyz789abc123"
  }
}
```

---

### 3.4 创建广告创意

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/create/creatives`  
**底层API**: `/foreign/marketing/creative/add`  

**前置条件**: 需要先调用文件上传接口获取素材URL

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_id | int | ✅ | 广告账户ID | 307 |
| group_id | int | ✅ | 广告组ID | 103038 |
| creative_name | string | ❌ | 创意名称 | "创意1" |
| title | string | ✅ | 广告标题 | "游戏标题" |
| description | string | ✅ | 广告描述 | "游戏描述" |
| button | string | ✅ | 按钮文字 | "Install" |
| landing_url | string | ✅ | 点击地址/落地页 | "https://example.com" |
| icon_url | object | ❌ | 图标配置 | {"id": 12345, "url": "..."} |
| img_urls | string[] | ❌ | 图片URL列表 | ["https://..."] |
| video_urls | string[] | ❌ | 视频URL列表 | ["https://..."] |
| deeplink_url | string | ❌ | Deeplink | "myapp://path" |
| expose_monitor_url | string | ❌ | 曝光监测URL | "https://..." |

**素材要求**:
- 必须提供 `image_urls` 或 `video_urls` 至少一个
- 素材URL需通过文件上传接口获取

**请求示例**:
```json
{
  "account_id": 307,
  "group_id": 103038,
  "creative_name": "创意素材1",
  "title": "超好玩休闲游戏",
  "description": "立即下载，无限金币等你来拿！",
  "button": "立即安装",
  "landing_url": "https://example.com/download",
  "img_urls": ["https://cdn.example.com/creative1.jpg"],
  "expose_monitor_url": "https://track.example.com/expose"
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "Creative创建成功",
  "data": {
    "creative_id": "111222",
    "uniKey": "creative_uni_key_123"
  }
}
```

---

### 3.5 上传文件

**接口**: `POST /api/v1/mi/create/upload`  
**Content-Type**: `multipart/form-data`  

**功能**: 上传图片、视频或图标文件，获取URL用于创建创意

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| file | File | ✅ | 上传的文件 | (form-data) |
| account_id | int | ✅ | 广告账户ID | 11281 |
| file_type | int | ✅ | 文件类型 | 1 |

**文件类型 (file_type)**:
| 值 | 说明 |
|----|------|
| 1 | 图片 |
| 2 | 视频 |
| 3 | 图标 |

**请求示例 (curl)**:
```bash
curl -X POST "http://localhost:8000/api/v1/mi/create/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "account_id=11281" \
  -F "file_type=1"
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "上传成功",
  "data": {
    "id": 333444,
    "url": "https://cdn.xiaomi.com/creative/abc123.jpg",
    "width": 1080,
    "height": 1920
  }
}
```

**响应字段**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 文件ID |
| url | string | 文件访问URL（用于创建创意） |
| width | int | 图片/视频宽度 |
| height | int | 图片/视频高度 |

**使用流程**:
1. 调用本接口上传素材文件
2. 从响应中获取 `url`
3. 创建创意时传入 `img_urls` 或 `video_urls`

---

### 3.6 获取投放国家/地区列表（建单）

⚠️ 建单专用接口，与查询接口不同

**接口**: `GET /api/v1/mi/create/regions/list`  
**功能**: 获取小米广告支持投放的国家/地区列表（建单时选择用）  
**底层API**: `/foreign/marketing/region/countryList`

**请求参数**: 无

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {
      "geoType": "COUNTRY",
      "id": "CN",
      "name": "中国"
    },
    {
      "geoType": "COUNTRY",
      "id": "US",
      "name": "美国"
    }
  ]
}
```

**返回字段**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| geoType | string | 地区类型，固定为 COUNTRY |
| id | string | 地区代码 (2字母国家码) |
| name | string | 地区名称 |

**与查询接口的区别**:
- 建单接口: `/create/regions/list` → `/foreign/marketing/region/countryList`
- 查询接口: `/query/countries` → `/marketing/region/countryList`（返回已投放的国家）

---

### 3.7 获取国家下属区域（建单）

**接口**: `GET /api/v1/mi/create/regions/{country}/sub`  
**功能**: 获取指定国家/地区的下属区域（省份/城市）  
**底层API**: `/foreign/marketing/region/getByCountry`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| country | string | ✅ | 国家/地区代码 | "CN" |

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {
      "geoType": "PROVINCE",
      "id": "110000",
      "name": "北京市",
      "subGeo": [
        {
          "geoType": "CITY",
          "id": "110100",
          "name": "市辖区"
        }
      ]
    }
  ]
}
```

**返回字段**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| geoType | string | 地区类型: PROVINCE/CITY |
| id | string | 地区ID |
| name | string | 地区名称 |
| subGeo | array | 子区域列表（可选） |

---

### 3.8 获取媒体/版位列表（建单）

**接口**: `POST /api/v1/mi/create/media/list`  
**功能**: 根据计划ID获取可用的媒体/版位列表（建单时选择用）  
**底层API**: `/foreign/marketing/ads/media/list`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| campaign_ids | int[] | ✅ | 计划ID列表 | [123456] |
| display_type | int | ❌ | 版位类型，默认13 | 13 |

**版位类型 (display_type)**:
| 值 | 说明 |
|----|------|
| 1 | 信息流 |
| 2 | 图标 |
| 3 | 系统默认开屏 |
| 6 | banner |
| 7 | 插屏 |
| 8 | 激励视频 |
| 9 | PUSH |
| 12 | 锁屏画报 |
| 13 | 通投智选 |

**请求示例**:
```json
{
  "campaign_ids": [123456],
  "display_type": 13
}
```

**响应结构**:
返回包含层级结构的媒体/版位列表：
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {
      "mediaName": "内部媒体",
      "apps": [
        {
          "appName": "小米应用商店",
          "adSpaces": [
            {
              "adSpaceId": 111,
              "adSpaceName": "信息流"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. 查询接口 (Query APIs)

查询接口用于获取已有广告的数据（计划、组、创意列表及详情）。

### 4.1 查询广告计划列表

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/query/campaigns`  
**底层API**: `/marketing/campaign/list`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_ids | int[] | ✅ | 账号ID列表 | [11281] |
| campaign_ids | int[] | ❌ | 计划ID列表（筛选） | [123456, 789012] |
| page | int | ❌ | 页码，默认1 | 1 |
| page_size | int | ❌ | 每页大小，默认10，最大1000 | 50 |

**请求示例**:
```json
{
  "account_ids": [11281],
  "campaign_ids": [123456],
  "page": 1,
  "page_size": 10
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "records": [
      {
        "accountId": 11281,
        "campaignId": 123456,
        "name": "三星渠道投放",
        "dayBudget": 5000000,
        "campaignType": 1,
        "status": 0,
        "createTime": 1742352000000,
        "updateTime": 1742352000000
      }
    ],
    "size": 1,
    "total": 1
  }
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| accountId | int | 广告账户ID |
| campaignId | int | 广告计划ID |
| name | string | 计划名称 |
| dayBudget | int | 日预算 (USD × 100000) |
| campaignType | int | 计划类型 |
| status | int | 状态 (0=投放中, 1=暂停) |
| createTime | long | 创建时间 (毫秒时间戳) |
| updateTime | long | 更新时间 (毫秒时间戳) |

**注意**: 返回的 `status` 为原始数字，前端需自行映射为枚举值

---

### 4.2 获取单个广告计划详情

**接口**: `POST /api/v1/platform/MI/campaigns/get`  
**功能**: 通用平台接口，获取计划详细信息

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | ✅ | 计划ID | "123456" |
| extra_params | object | ❌ | 平台特有参数 | {"account_id": 11281} |

**请求示例**:
```json
{
  "id": "123456",
  "extra_params": {}
}
```

**响应数据**: `CampaignInfo` 对象（见第2.1节）

---

### 4.3 查询广告组列表

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/query/groups`  
**底层API**: `/marketing/group/list`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_ids | int[] | ✅ | 账号ID列表 | [11281] |
| campaign_ids | int[] | ❌ | 计划ID列表 | [123456] |
| group_ids | int[] | ❌ | 广告组ID列表 | [193338] |
| page | int | ❌ | 页码，默认1 | 1 |
| page_size | int | ❌ | 每页大小，默认10，最大1000 | 50 |

**请求示例**:
```json
{
  "account_ids": [11281],
  "campaign_ids": [123456],
  "group_ids": [193338],
  "page": 1,
  "page_size": 10
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "records": [
      {
        "accountId": 11281,
        "groupId": 654321,
        "name": "测试组",
        "campaignId": 123456,
        "dayBudget": 5000000,
        "billingType": 2,
        "productType": 2,
        "bid": 2000000,
        "region": ["CN", "US"],
        "packageName": "com.example.app",
        "optimizeGoal": 1,
        "status": 0,
        "createTime": 1742352000000,
        "updateTime": 1742352000000
      }
    ],
    "size": 1,
    "total": 1
  }
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| accountId | int | 广告账户ID |
| groupId | int | 广告组ID |
| name | string | 组名称 |
| campaignId | int | 所属计划ID |
| dayBudget | int | 日预算 (USD × 100000) |
| billingType | int | 出价类型 |
| productType | int | 推广产品 |
| bid | int | 出价 (USD × 100000) |
| region | string[] | 投放区域代码 |
| packageName | string | 包名 |
| optimizeGoal | int | 优化目标 |
| status | int | 状态 (0/1) |
| createTime | long | 创建时间 (毫秒) |
| updateTime | long | 更新时间 (毫秒) |

---

### 4.4 获取单个广告组详情

**接口**: `POST /api/v1/platform/MI/groups/get`  
**功能**: 通用平台接口，获取组详细信息

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 组ID |
| extra_params | object | ❌ | 平台特有参数 |

**响应数据**: `GroupInfo` 对象（见第2.2节）

---

### 4.5 查询广告创意列表

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/query/creatives`  
**底层API**: `/marketing/creative/list`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| group_ids | int[] | ✅ | 广告组ID列表 | [193338] |
| campaign_id | int | ❌ | 计划ID（筛选） | 123456 |
| creative_id | int | ❌ | 创意ID（筛选） | 111222 |
| page | int | ❌ | 页码，默认1 | 1 |
| page_size | int | ❌ | 每页大小，默认10 | 50 |

**请求示例**:
```json
{
  "group_ids": [193338],
  "campaign_id": 123456,
  "page": 1,
  "page_size": 10
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "records": [
      {
        "accountId": 11281,
        "groupId": 654321,
        "campaignId": 123456,
        "creativeId": 111222,
        "name": "创意素材1",
        "landingUrl": "https://example.com/download",
        "exposeMonitorUrl": "https://track.example.com/expose",
        "status": 0,
        "createTime": 1742352000000,
        "updateTime": 1742352000000
      }
    ],
    "size": 1,
    "total": 1
  }
}
```

**响应字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| accountId | int | 广告账户ID |
| groupId | int | 广告组ID |
| campaignId | int | 广告计划ID |
| creativeId | int | 创意ID |
| name | string | 创意名称 |
| landingUrl | string | 落地页 |
| exposeMonitorUrl | string | 曝光监测URL |
| status | int | 状态 (0/1) |
| createTime | long | 创建时间 |
| updateTime | long | 更新时间 |

---

### 4.6 获取单个广告创意详情

**接口**: `POST /api/v1/platform/MI/creatives/get`  
**功能**: 通用平台接口，获取创意详细信息

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 创意ID |
| extra_params | object | ❌ | 平台特有参数 |

**响应数据**: `CreativeInfo` 对象（见第2.3节）

---

### 4.7 查询国家列表（查询用）

⚠️ 注意：与建单接口 `/create/regions/list` 返回的数据源不同

**接口**: `GET /api/v1/mi/query/countries`  
**底层API**: `/marketing/region/countryList`  
**功能**: 获取**已投放广告**的国家列表（查询维度）

**请求参数**: 无

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": [
    {
      "geoType": "COUNTRY",
      "id": "CN",
      "name": "中国"
    }
  ]
}
```

**使用场景**: 分析报表时看哪些国家有投放数据

---

### 4.8 查询国家下属区域（查询用）

**接口**: `GET /api/v1/mi/query/countries/{country}/sub`  
**底层API**: `/marketing/region/getByCountry`  
**功能**: 获取指定国家**已投放广告**的下属区域（省份/城市）

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| country | string | ✅ | 国家代码 (如 "CN") |

---

### 4.9 查询媒体列表（查询用）

**接口**: `GET /api/v1/mi/query/media/list`  
**功能**: 根据广告组ID获取媒体/版位（查询维度）  
**底层API**: `/marketing/group/getMediaList`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| group_ids | long[] | ✅ | 广告组ID列表（query参数） |

**请求示例 (curl)**:
```bash
curl "http://localhost:8000/api/v1/mi/query/media/list?group_ids=654321,987321"
```

---

### 4.10 根据广告状态获取广告ID

**接口**: `POST /api/v1/mi/query/ads/by-status`  
**底层API**: `/foreign/marketing/getAdsByStatus`  

**功能**: 根据广告状态批量获取广告ID列表

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_id | int | ✅ | 广告账户ID | 320 |
| business_type | int | ✅ | 业务类型 | 1 |
| status_list | int[] | ✅ | 状态列表 | [0, 1] |

**业务类型 (business_type)**:
| 值 | 说明 |
|----|------|
| 1 | 广告计划 |
| 2 | 广告组 |
| 3 | 广告创意 |

**状态值**:
| 值 | 说明 |
|----|------|
| 0 | 投放中 |
| 1 | 未投放 |

**请求示例**:
```json
{
  "account_id": 320,
  "business_type": 1,
  "status_list": [0, 1]
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "accountId": 320,
    "adInfoStatus": {
      "0": [123456, 789012],
      "1": [345678]
    }
  }
}
```

---

### 4.11 根据广告ID查询广告状态

**接口**: `POST /api/v1/mi/query/ads/by-ids`  
**底层API**: `/foreign/marketing/getStatusByIds`  

**功能**: 批量查询广告ID的状态

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| business_type | int | ✅ | 业务类型 (1=计划, 2=组, 3=创意) | 1 |
| ids | int[] | ✅ | 广告ID列表 | [123232, 123233] |

**请求示例**:
```json
{
  "business_type": 1,
  "ids": [123232, 123233]
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "成功",
  "data": {
    "adInfo": [
      {
        "id": 123232,
        "status": 0,
        "unDeliveryReason": null
      },
      {
        "id": 123233,
        "status": 1,
        "unDeliveryReason": "计划已暂停"
      }
    ]
  }
}
```

---

## 5. 更新接口 (Update APIs)

更新接口用于修改广告配置（状态、预算、出价等）。

### 5.1 修改计划状态

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/update/campaigns/status`  
**权限要求**: OPERATOR 及以上角色  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| campaign_id | string | ✅ | 计划ID | "123456" |
| status | boolean | ✅ | 状态: true=启用, false=暂停 | true |
| account_id | int | ❌ | 广告账户ID | 11281 |

**请求示例**:
```json
{
  "campaign_id": "123456",
  "status": true,
  "account_id": 11281
}
```

**响应示例**:
```json
{
  "code": "00000",
  "msg": "计划状态修改成功",
  "data": {
    "success": true,
    "campaign_id": "123456"
  }
}
```

---

### 5.2 修改计划预算

🔥 **高频核心接口**

**接口**: `POST /api/v1/mi/update/campaigns/budget`  
**权限要求**: OPERATOR 及以上角色  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| campaign_id | string | ✅ | 计划ID | "123456" |
| budget | float | ✅ | 新预算金额 (USD × 100000) | 10000000 |
| account_id | int | ❌ | 广告账户ID | 11281 |

**预算说明**: 值为 USD × 100000，如 100 USD = 10000000

**请求示例**:
```json
{
  "campaign_id": "123456",
  "budget": 10000000,
  "account_id": 11281
}
```

---

### 5.3 批量修改计划预算

**接口**: `POST /api/v1/mi/update/campaigns`  
**底层API**: `/marketing/campaign/update`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| campaign_ids | int[] | ✅ | 计划ID列表 | [100205030, 100205031] |
| day_budget | int | ✅ | 新日预算 (USD × 100000) | 500000 |

**请求示例**:
```json
{
  "campaign_ids": [100205030, 100205031],
  "day_budget": 500000
}
```

---

### 5.4 修改广告组状态

**接口**: `POST /api/v1/mi/update/groups/status`  
**权限要求**: OPERATOR 及以上角色  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| group_id | string | ✅ | 广告组ID |
| status | boolean | ✅ | 状态: true=启用, false=暂停 |

---

### 5.5 修改广告组预算

**接口**: `POST /api/v1/mi/update/groups/budget`  
**权限要求**: OPERATOR 及以上角色  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| group_id | string | ✅ | 广告组ID |
| budget | float | ✅ | 新预算 (USD × 100000) |

---

### 5.6 修改广告组出价

🔥 **高频核心接口**

**接口**: `POST /api/v1/platform/MI/groups/update-bid`  
**权限要求**: OPERATOR 及以上角色  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 广告组ID |
| bid | float | ✅ | 新出价 (USD × 100000) |
| dry_run | boolean | ❌ | 预检查模式，默认false |
| extra_params | object | ❌ | 平台特有参数 |

---

### 5.7 批量修改广告组

⚠️ 高级接口

**接口**: `POST /api/v1/mi/update/groups`  
**底层API**: `/marketing/group/update`  

**功能**: 批量修改广告组的预算、出价、投放区域

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| group_ids | int[] | ✅ | 广告组ID列表 | [32434, 2346] |
| regions | string[] | ❌ | 新投放国家/地区 | ["IN", "ID"] |
| day_budget | int | ❌ | 新日预算 | 500000 |
| bid | int | ❌ | 新出价 | 100000 |

**注意事项**:
- 优化目标为转化价值且优化事件为广告收入价值的广告组，**不支持**修改 bid

---

### 5.8 批量修改广告组媒体版位

⚠️ 高级接口

**接口**: `POST /api/v1/mi/update/groups/media`  
**底层API**: `/marketing/group/media/update`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| group_ids | int[] | ✅ | 广告组ID列表 |
| media_and_tag_ids | object | ✅ | 媒体和广告位配置（复杂JSON） |

**media_and_tag_ids 结构示例**:
```json
{
  "all": true
}
```
或详细结构参考接口文档

---

### 5.9 修改留存率目标/ROAS目标

⚠️ 高级接口

**接口**: `POST /api/v1/mi/update/groups/roas`  
**底层API**: `/foreign/marketing/roas/group/update`  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| account_id | int | ✅ | 账户ID | 333 |
| updates | object[] | ✅ | ROAS更新请求列表 | [...] |

**updates 数组元素**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| group_id | int | ✅ | 广告组ID |
| retention_rate_target | int | ❌ | 留存率目标（次留） |
| target_type | string | ❌ | 目标类型 ("adRevenueValue") |
| roas_target | int | ❌ | ROAS目标 |

**请求示例**:
```json
{
  "account_id": 333,
  "updates": [
    {
      "group_id": 193363,
      "retention_rate_target": 13
    },
    {
      "group_id": 193339,
      "target_type": "adRevenueValue",
      "roas_target": 20
    }
  ]
}
```

**注意事项**:
- 修改留存率目标的前提：广告组的优化目标为**次留**
- 修改ROAS目标的前提：广告组优化目标为**转化价值**

---

### 5.10 批量修改广告创意

**接口**: `POST /api/v1/mi/update/creatives`  
**底层API**: `/marketing/creative/update`  

**功能**: 批量修改创意的点击地址或曝光监测

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| creative_ids | int[] | ✅ | 创意ID列表 | [32434, 2346] |
| landing_url | string | ❌ | 新点击地址 | "https://..." |
| expose_monitor_url | string | ❌ | 新曝光监测URL | "https://..." |

**请求示例**:
```json
{
  "creative_ids": [32434, 2346],
  "landing_url": "https://new-landing.example.com",
  "expose_monitor_url": "https://track.example.com/expose"
}
```

---

### 5.11 批量修改广告状态（通用）

**接口**: `POST /api/v1/mi/update/ads/status`  
**底层API**: `/foreign/marketing/ads/status/update`  

**功能**: 批量修改广告计划/组/创意的状态（支持三种层级）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| ids | int[] | ✅ | 广告ID列表 | [75312748, 75312749] |
| business_type | int | ✅ | 业务类型 | 1 |
| status | int | ✅ | 状态值 | 1 |

**业务类型**:
| 值 | 说明 |
|----|------|
| 1 | 广告计划 (Campaign) |
| 2 | 广告组 (Group) |
| 3 | 广告创意 (Creative) |

**状态值**:
| 值 | 说明 |
|----|------|
| 1 | 打开 (对应 ACTIVE) |
| 2 | 关闭 (对应 PAUSED) |

**请求示例**:
```json
{
  "ids": [75312748, 75312749],
  "business_type": 1,
  "status": 1
}
```

---

## 6. 通用平台接口 (Platform Ops APIs)

系统提供统一的通用三层级操作接口，支持 MTG/BIGO/MI 三个平台。

**基础路径**: `/api/v1/platform/{platform}`  
**平台标识**: `MI` (Xiaomi)

---

### 6.1 通用 Campaign 操作

#### 6.1.1 查询计划列表

**接口**: `POST /api/v1/platform/MI/campaigns/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| campaign_id | string | ❌ | 计划ID筛选 |
| package_name | string | ❌ | 包名筛选 |
| status | string | ❌ | 状态筛选 ("active"/"paused") |
| limit | int | ❌ | 返回条数，默认50 |
| offset | int | ❌ | 偏移量，默认0 |
| extra_params | object | ❌ | 平台特有参数（如advertiser_id） |

**示例**:
```bash
curl -X POST "http://localhost:8000/api/v1/platform/MI/campaigns/list" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "limit": 50,
    "offset": 0,
    "extra_params": {"account_id": 11281}
  }'
```

#### 6.1.2 修改计划状态

**接口**: `POST /api/v1/platform/MI/campaigns/update-status`  
**权限**: OPERATOR+  

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 计划ID |
| status | boolean | ✅ | true=启用, false=暂停 |
| dry_run | boolean | ❌ | 预检查模式 |
| extra_params | object | ❌ | 平台特有参数 |

---

### 6.2 通用 Group 操作

#### 6.2.1 查询广告组列表

**接口**: `POST /api/v1/platform/MI/groups/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| campaign_id | string | ❌ | 计划ID筛选 |
| group_id | string | ❌ | 组ID筛选 |
| status | string | ❌ | 状态筛选 |
| limit | int | ❌ | 返回条数 |
| offset | int | ❌ | 偏移量 |
| extra_params | object | ❌ | 平台特有参数 |

#### 6.2.2 修改广告组状态

**接口**: `POST /api/v1/platform/MI/groups/update-status`

#### 6.2.3 修改广告组预算

**接口**: `POST /api/v1/platform/MI/groups/update-budget`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | ✅ | 组ID |
| budget | float | ✅ | 新预算 |
| dry_run | boolean | ❌ | 预检查模式 |
| extra_params | object | ❌ | 平台特有参数 |

#### 6.2.4 修改广告组出价

**接口**: `POST /api/v1/platform/MI/groups/update-bid`

---

### 6.3 通用 Creative 操作

#### 6.3.1 查询创意列表

**接口**: `POST /api/v1/platform/MI/creatives/list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| campaign_id | string | ❌ | 计划ID筛选 |
| group_id | string | ❌ | 组ID筛选 |
| creative_id | string | ❌ | 创意ID筛选 |
| status | string | ❌ | 状态筛选 |
| limit | int | ❌ | 返回条数 |
| offset | int | ❌ | 偏移量 |
| extra_params | object | ❌ | 平台特有参数 |

#### 6.3.2 修改创意状态

**接口**: `POST /api/v1/platform/MI/creatives/update-status`

---

### 6.4 通用账户查询

**接口**: `POST /api/v1/platform/MI/accounts/list`  
**响应**: 广告账户列表（格式同建单接口）

---

## 7. 数据字段对照表

### 7.1 三层级模型映射

| 统一概念 | MTG | BIGO | **Xiaomi** |
|----------|-----|------|------------|
| Campaign | campaign | campaign | **campaign** |
| Group | Offer | Adset | **Group** |
| Creative | creative_sets | Ad | **Creative** |
| Campaign ID | campaign_id | id | **campaignId** |
| Group ID | offer_id | id | **groupId** |
| Creative ID | creative_md5/id | id | **creativeId** |

### 7.2 状态码映射

| 平台 | ACTIVE | PAUSED | PENDING | REJECTED | DELETED |
|------|--------|--------|---------|----------|---------|
| **Xiaomi** | 0 | 1 | ❌ 不支持 | ❌ 不支持 | ❌ 不支持 |
| MTG | "active"/"RUNNING" | "paused"/"STOPPED" | "pending" | "rejected" | - |
| BIGO | 1 | 2 | - | - | 100 |

**前端转化示例**:
```javascript
const statusMap = { 0: 'ACTIVE', 1: 'PAUSED' };
const displayStatus = statusMap[response.status] || 'UNKNOWN';
```

### 7.3 计划类型 (campaign_type)

| 值 | 说明 |
|----|------|
| 1 | 应用下载 |
| 2 | H5 |
| 3 | 再营销 |

### 7.4 出价类型 (billing_type)

| 值 | 说明 |
|----|------|
| 11 | CPA |
| 2 | CPC |

### 7.5 优化目标 (optimize_goal)

| 值 | 说明 | 适用场景 |
|----|------|----------|
| 1 | 激活 | 应用下载 |
| 2 | 点击 | 各类推广 |
| 3 | 应用内事件 | 深度转化 |
| 4 | 转化价值 | ROAS优化 |
| 5 | 网站内事件 | 网页转化 |

### 7.6 版位类型 (display_type)

| 值 | 说明 |
|----|------|
| 1 | 信息流 |
| 2 | 图标 |
| 3 | 系统默认开屏 |
| 6 | banner |
| 7 | 插屏 |
| 8 | 激励视频 |
| 9 | PUSH |
| 12 | 锁屏画报 |
| 13 | 通投智选 |

### 7.7 文件类型 (file_type)

| 值 | 说明 |
|----|------|
| 1 | 图片 |
| 2 | 视频 |
| 3 | 图标 |

---

## 8. 重要说明

### 8.1 预算单位处理 ⚠️

小米API使用 **USD × 100000** 作为预算和出价单位，前端展示时需要**除以 100000**：

```javascript
// 后端返回: {"budget": 5000000}
const displayBudget = 5000000 / 100000; // 50.00 USD
const formatted = `$${displayBudget.toFixed(2)}`; // "$50.00"

// 前端提交: 输入50 USD
const apiBudget = 50 * 100000; // 5000000
```

### 8.2 时间戳格式

小米API返回的时间戳为**毫秒级 Unix 时间戳**：

```javascript
// 后端返回: {"createTime": 1742352000000}
const date = new Date(1742352000000); // JavaScript Date对象
const isoString = date.toISOString(); // "2025-03-20T00:00:00.000Z"
const localString = date.toLocaleString('zh-CN'); // "2025/3/20 08:00:00"
```

### 8.3 包名绑定占位符

小米API在查询计划/组时，**不返回应用包名** (`appPackageName` 字段)。解决方案：

1. 数据库中使用占位符: `PENDING_BIND:{campaign_id}`
2. 需要后台手动绑定游戏与广告计划的包名关系
3. 前端展示时应做处理:
```javascript
const packageName = data.package_name || `待绑定 (Campaign: ${data.campaign_id})`;
```

### 8.4 advertiser_id 自动处理

大多数小米API需要在Header或Cookie中传递 `advertiser_id`（广告主账号ID）。系统实现：

- 自动从 `UA_Reports` 表的 `Ads_Id` 字段读取
- 建单时需显式传递 `account_id`（来自 `/create/accounts/list`）
- 前端无需关心此字段，只需确保数据库有历史数据

### 8.5 状态枚举差异

小米只支持两种状态（0=ACTIVE, 1=PAUSED），返回 `CampaignInfo.status` 时已自动映射为统一枚举。但在查询列表接口 (`/query/campaigns` 等) 中返回的是原始数字，需前端自行转换。

---

## 9. 错误码

### 9.1 业务错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 00000 | 成功 | - |
| 10001 | 无效token | Token过期，系统会自动刷新；如持续失败需重新登录 |
| 10002 | 无效appId或appKey | 检查后端 `MI_APP_ID` 和 `MI_APP_KEY` 配置 |
| 10003 | 无任何账户查询权限 | 确认小米广告账户已授权给当前应用 |
| 10004 | accountId未授权 | 检查accountId是否正确 |
| 20001 | 请求参数异常 | 检查请求体字段格式和类型 |
| 20002 | 接口调用频率过高 | 降低请求频率，或使用批量接口 |
| 100500 | 服务端异常 | 小米服务器问题，稍后重试 |

### 9.2 HTTP 状态码

| 状态码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求体 |
| 401 | 未认证 | Token无效或缺失 |
| 403 | 无权限 | 当前角色无权操作 |
| 404 | 资源不存在 | 检查ID是否正确 |
| 422 | 参数校验失败 | 返回详细错误信息 |
| 500 | 服务器内部错误 | 查看后端日志 |

### 9.3 操作结果错误码（OperationResult.error_code）

写操作返回的 `OperationResult` 对象可能包含以下 `error_code`:

| 错误码 | 说明 |
|--------|------|
| AUTH_FAILED | 认证失败 |
| CAMPAIGN_NOT_FOUND | 计划不存在 |
| VALIDATION_FAILED | 参数验证失败 |
| CREATE_FAILED | 创建失败 |
| UPDATE_FAILED | 更新失败 |
| STATUS_UPDATE_FAILED | 状态修改失败 |
| RATE_LIMIT | 请求频率超限 |
| TIMEOUT | 请求超时 |

---

## 附录

### 附录A：接口清单汇总

#### 建单接口 (9个)
1. GET `/api/v1/mi/create/accounts/list`
2. POST `/api/v1/mi/create/campaigns`
3. POST `/api/v1/mi/create/groups`
4. POST `/api/v1/mi/create/creatives`
5. POST `/api/v1/mi/create/upload`
6. GET `/api/v1/mi/create/regions/list`
7. GET `/api/v1/mi/create/regions/{country}/sub`
8. POST `/api/v1/mi/create/media/list`
9. (通用) POST `/api/v1/platform/MI/campaigns/create`

#### 查询接口 (12个)
10. POST `/api/v1/mi/query/campaigns`
11. POST `/api/v1/mi/query/groups`
12. POST `/api/v1/mi/query/creatives`
13. GET `/api/v1/mi/query/countries`
14. GET `/api/v1/mi/query/countries/{country}/sub`
15. GET `/api/v1/mi/query/media/list`
16. POST `/api/v1/mi/query/ads/by-status`
17. POST `/api/v1/mi/query/ads/by-ids`
18. POST `/api/v1/platform/MI/campaigns/list`
19. POST `/api/v1/platform/MI/campaigns/get`
20. POST `/api/v1/platform/MI/groups/list`
21. POST `/api/v1/platform/MI/groups/get`
22. POST `/api/v1/platform/MI/creatives/list`
23. POST `/api/v1/platform/MI/creatives/get`

#### 更新接口 (11个)
24. POST `/api/v1/mi/update/campaigns/status`
25. POST `/api/v1/mi/update/campaigns/budget`
26. POST `/api/v1/mi/update/campaigns`
27. POST `/api/v1/mi/update/groups/status`
28. POST `/api/v1/mi/update/groups/budget`
29. POST `/api/v1/mi/update/groups/bid`
30. POST `/api/v1/mi/update/groups`
31. POST `/api/v1/mi/update/groups/media`
32. POST `/api/v1/mi/update/groups/roas`
33. POST `/api/v1/mi/update/creatives`
34. POST `/api/v1/mi/update/ads/status`
35. POST `/api/v1/platform/MI/campaigns/update-status`
36. POST `/api/v1/platform/MI/campaigns/update-budget`
37. POST `/api/v1/platform/MI/groups/update-status`
38. POST `/api/v1/platform/MI/groups/update-budget`
39. POST `/api/v1/platform/MI/groups/update-bid`
40. POST `/api/v1/platform/MI/creatives/update-status`

**总计**: 40个路由端点

---

### 附录B：快速开始示例

#### 1. 获取账户列表并创建计划

```javascript
// Step 1: 获取账户列表
const accountsRes = await fetch('/api/v1/mi/create/accounts/list', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const accounts = accountsRes.data;

// Step 2: 创建计划
const createCampaignRes = await fetch('/api/v1/mi/create/campaigns', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    account_id: accounts[0].accountId,
    campaign_name: "Test Campaign",
    day_budget: 3000000, // 30 USD
    campaign_type: 1
  })
});
const campaign = createCampaignRes.data;
```

#### 2. 查询计划列表

```javascript
const listRes = await fetch('/api/v1/platform/MI/campaigns/list', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: "active",
    limit: 50,
    offset: 0,
    extra_params: { account_id: 12345 }
  })
});
const campaigns = listRes.data.items;
```

---

### 附录C：开发工具

- **Swagger UI**: http://localhost:8000/docs (自动生成API文档)
- **后端源码**: 
  - 小米专属路由: `app/routers/platforms/mi.py`
  - 通用平台路由: `app/routers/platform_ops.py`
  - 适配器实现: `app/services/platform/mi.py`

---

**文档维护**: 如有接口变更，请同步更新此文档和后端 Swagger 注释。
