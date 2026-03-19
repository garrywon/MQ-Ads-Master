import request from "@/utils/request";

const MIADS_BASE_URL = "/api/v1/mi";

// ==================== 常量定义 ====================

// 状态枚举
export const MI_STATUS = {
  ACTIVE: 0,
  PAUSED: 1,
};

// 计划类型
export const CAMPAIGN_TYPE = {
  APP_DOWNLOAD: 1, // 应用下载
  H5: 2, // H5
  REMARKETING: 3, // 再营销
};

// 出价类型
export const BILLING_TYPE = {
  CPA: 11,
  CPC: 2,
};

// 优化目标
export const OPTIMIZE_GOAL = {
  ACTIVATION: 1,
  CLICK: 2,
  IN_APP_EVENT: 3,
  CONVERSION_VALUE: 4,
  WEBSITE_EVENT: 5,
};

// ==================== API 方法 ====================

const MiAdsAPI = {
  /**
   * 获取小米广告账户列表
   * @returns {Promise<Array>} 账户列表 [{accountId, accountName}]
   */
  getAccountList() {
    return request({
      url: `${MIADS_BASE_URL}/create/accounts/list`,
      method: "post",
    });
  },

  /**
   * 查询广告计划列表
   * @param {Object} params - 查询参数
   * @param {number[]} params.account_ids - 账户ID列表
   * @param {number[]} params.campaign_ids - 计划ID列表（可选）
   * @param {number} params.campaign_type - 计划类型（可选）
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页大小，默认10
   * @returns {Promise} 响应包含 {records, total, size}
   */
  queryCampaigns(params) {
    return request({
      url: `${MIADS_BASE_URL}/query/campaigns`,
      method: "post",
      data: params,
    });
  },

  /**
   * 查询广告组列表
   * @param {Object} params
   * @param {number[]} params.account_ids - 账户ID列表
   * @param {number[]} params.campaign_ids - 计划ID列表（可选）
   * @param {number[]} params.group_ids - 组ID列表（可选）
   * @param {number} params.page
   * @param {number} params.page_size
   */
  queryGroups(params) {
    return request({
      url: `${MIADS_BASE_URL}/query/groups`,
      method: "post",
      data: params,
    });
  },

  /**
   * 查询广告创意列表
   * @param {Object} params
   * @param {number[]} params.group_ids - 组ID列表
   * @param {number} params.campaign_id - 计划ID（可选）
   * @param {number} params.creative_id - 创意ID（可选）
   * @param {number} params.page
   * @param {number} params.page_size
   */
  queryCreatives(params) {
    return request({
      url: `${MIADS_BASE_URL}/query/creatives`,
      method: "post",
      data: params,
    });
  },

  /**
   * 获取计划详情（通用平台接口）
   * @param {string|number} id - 计划ID
   * @param {Object} extraParams - 平台特有参数（如account_id）
   */
  getCampaignDetail(id, extraParams = {}) {
    return request({
      url: `/api/v1/platform/MI/campaigns/get`,
      method: "post",
      data: { id, extra_params: extraParams },
    });
  },

  /**
   * 获取组详情（通用平台接口）
   * @param {string|number} id - 组ID
   * @param {Object} extraParams - 平台特有参数
   */
  getGroupDetail(id, extraParams = {}) {
    return request({
      url: `/api/v1/platform/MI/groups/get`,
      method: "post",
      data: { id, extra_params: extraParams },
    });
  },

  /**
   * 获取创意详情（通用平台接口）
   * @param {string|number} id - 创意ID
   * @param {Object} extraParams - 平台特有参数
   */
  getCreativeDetail(id, extraParams = {}) {
    return request({
      url: `/api/v1/platform/MI/creatives/get`,
      method: "post",
      data: { id, extra_params: extraParams },
    });
  },

  /**
   * 创建广告计划
   * @param {Object} data
   * @param {number} data.account_id - 广告账户ID
   * @param {string} data.campaign_name - 计划名称
   * @param {number} data.day_budget - 日预算 (USD × 100000)
   * @param {number} data.campaign_type - 计划类型，默认1
   */
  createCampaign(data) {
    return request({
      url: `${MIADS_BASE_URL}/create/campaigns`,
      method: "post",
      data,
    });
  },

  /**
   * 创建广告组
   * @param {Object} data
   * @param {number} data.account_id - 广告账户ID
   * @param {number} data.campaign_id - 所属计划ID
   * @param {string} data.group_name - 广告组名称
   * @param {string} data.package_name - 应用包名
   * @param {number} data.product_type - 推广产品，默认2
   * @param {number} data.placement_choice - 版位选择，默认1
   * @param {number} data.display_type - 细分版位类型，默认13
   * @param {string[]} data.regions - 投放国家/地区代码
   * @param {number} data.billing_type - 出价类型，默认2
   * @param {number} data.bid - 目标成本 (USD × 100000)
   * @param {number} data.day_budget - 日预算 (USD × 100000)
   * @param {number} data.total_budget - 总预算 (USD × 100000)
   * @param {number} data.begin_time - 投放起始时间 (毫秒时间戳)
   * @param {number} data.end_time - 投放结束时间 (毫秒时间戳)
   * @param {number} data.optimize_goal - 优化目标，默认1
   * @param {number} data.optimize_event - 优化事件ID（可选）
   */
  createGroup(data) {
    return request({
      url: `${MIADS_BASE_URL}/create/groups`,
      method: "post",
      data,
    });
  },

  /**
   * 获取投放国家/地区列表
   */
  getCreateRegionsList() {
    return request({
      url: `${MIADS_BASE_URL}/create/regions/list`,
      method: "get",
    });
  },

  /**
   * 获取媒体/版位列表
   * @param {number[]} campaignIds - 计划ID列表
   * @param {number} displayType - 版位类型 (1=信息流, 2=图标, 3=开屏, 6=banner, 7=插屏, 8=激励视频, 9=PUSH, 12=锁屏画报, 13=通投智选)
   */
  getCreateMediaList(campaignIds, displayType = 13) {
    return request({
      url: `${MIADS_BASE_URL}/create/media/list`,
      method: "post",
      data: {
        campaign_ids: campaignIds,
        display_type: displayType,
      },
    });
  },

  /**
   * 创建广告创意
   * @param {Object} data
   * @param {number} data.account_id - 广告账户ID
   * @param {number} data.group_id - 广告组ID
   * @param {string} data.creative_name - 创意名称
   * @param {string} data.title - 广告标题
   * @param {string} data.description - 广告描述
   * @param {string} data.button - 按钮文字
   * @param {string} data.landing_url - 点击地址/落地页
   * @param {object} data.icon_url - 图标配置（可选）
   * @param {string[]} data.img_urls - 图片URL列表（可选）
   * @param {string[]} data.video_urls - 视频URL列表（可选）
   * @param {string} data.deeplink_url - Deeplink（可选）
   * @param {string} data.expose_monitor_url - 曝光监测URL（可选）
   */
  createCreative(data) {
    return request({
      url: `${MIADS_BASE_URL}/create/creatives`,
      method: "post",
      data,
    });
  },

  /**
   * 获取指定账户的所有计划基础数据
   * @param {number|string} accountId
   */
  getAllCampaignsBasic(accountId) {
    return request({
      url: `${MIADS_BASE_URL}/query/campaigns`,
      method: "post",
      data: {
        account_ids: [Number(accountId)],
        page: 1,
        page_size: 1000,
      },
    }).then((res) => {
      const records = res?.records || [];
      console.log("[MiAdsAPI] getAllCampaignsBasic 返回记录数:", records.length);
      return records.map((item) => ({
        value: String(item.campaignId),
        label: item.name,
        accountId: item.accountId,
      }));
    });
  },

  /**
   * 获取指定账户的所有组基础数据
   * @param {number|string} accountId
   */
  getAllGroupsBasic(accountId) {
    return request({
      url: `${MIADS_BASE_URL}/query/groups`,
      method: "post",
      data: {
        account_ids: [Number(accountId)],
        page: 1,
        page_size: 1000,
      },
    }).then((res) => {
      const records = res?.records || [];
      console.log("[MiAdsAPI] getAllGroupsBasic 返回记录数:", records.length);
      return records.map((item) => ({
        value: String(item.groupId),
        label: item.name,
        campaignId: item.campaignId,
        accountId: item.accountId,
      }));
    });
  },

  /**
   * 批量获取指定组ID列表下的所有创意基础数据
   * @param {number[]} groupIds
   */
  getAllCreativesBasic(groupIds) {
    if (!groupIds || groupIds.length === 0) return Promise.resolve([]);

    const batchSize = 100;
    const allRecords = [];
    const promises = [];

    for (let i = 0; i < groupIds.length; i += batchSize) {
      const batch = groupIds.slice(i, i + batchSize);
      promises.push(
        request({
          url: `${MIADS_BASE_URL}/query/creatives`,
          method: "post",
          data: {
            group_ids: batch,
            page: 1,
            page_size: 1000,
          },
        }).then((res) => {
          const records = res?.records || [];
          allRecords.push(...records);
        })
      );
    }

    return Promise.all(promises).then(() => {
      console.log("[MiAdsAPI] getAllCreativesBasic 返回记录数:", allRecords.length);
      return allRecords.map((item) => ({
        value: String(item.creativeId),
        label: item.name,
        groupId: item.groupId,
        campaignId: item.campaignId,
      }));
    });
  },

  /**
   * 根据广告ID列表查询广告状态
   * @param {number} businessType - 业务类型：1=广告计划, 2=广告组, 3=广告创意
   * @param {number[]} ids - 广告ID列表
   */
  queryAdStatus(businessType, ids) {
    return request({
      url: `${MIADS_BASE_URL}/query/ads/by-ids`,
      method: "post",
      data: {
        business_type: businessType,
        ids: ids,
      },
    });
  },

  /**
   * 更新广告计划状态
   * @param {string} campaignId - 计划ID
   * @param {boolean} status - 状态：true=投放中，false=未投放
   * @param {number} accountId - 账户ID
   */
  updateCampaignStatus(campaignId, status, accountId) {
    return request({
      url: `${MIADS_BASE_URL}/update/campaigns/status`,
      method: "post",
      data: {
        campaign_id: campaignId,
        status: status,
        account_id: accountId,
      },
    });
  },

  /**
   * 更新广告组状态
   * @param {string} groupId - 组ID
   * @param {boolean} status - 状态：true=投放中，false=未投放
   * @param {number} accountId - 账户ID
   */
  updateGroupStatus(groupId, status, accountId) {
    return request({
      url: `${MIADS_BASE_URL}/update/groups/status`,
      method: "post",
      data: {
        group_id: groupId,
        status: status,
        account_id: accountId,
      },
    });
  },

  /**
   * 更新广告创意状态
   * @param {string} creativeId - 创意ID
   * @param {boolean} status - 状态：true=投放中，false=未投放
   * @param {number} accountId - 账户ID
   */
  updateCreativeStatus(creativeId, status, accountId) {
    return request({
      url: `${MIADS_BASE_URL}/update/creatives/status`,
      method: "post",
      data: {
        creative_id: creativeId,
        status: status,
        account_id: accountId,
      },
    });
  },

  /**
   * 更新广告计划日预算
   * @param {string} campaignId - 计划ID
   * @param {number} budget - 预算值（USD × 100000），0表示不限
   * @param {number} accountId - 账户ID
   */
  updateCampaignBudget(campaignId, budget, accountId) {
    return request({
      url: `${MIADS_BASE_URL}/update/campaigns/budget`,
      method: "post",
      data: {
        campaign_id: campaignId,
        budget: budget,
        account_id: accountId,
      },
    });
  },

  /**
   * 删除广告（计划/组/创意）
   * @param {number} businessType - 业务类型：1=广告计划, 2=广告组, 3=广告创意
   * @param {number[]} ids - 广告ID列表
   * @param {number} accountId - 账户ID
   */
  deleteAds(businessType, ids, accountId) {
    return request({
      url: `${MIADS_BASE_URL}/delete/ads`,
      method: "post",
      data: {
        business_type: businessType,
        ids: ids,
        account_id: accountId,
      },
    });
  },
};
export default MiAdsAPI;
