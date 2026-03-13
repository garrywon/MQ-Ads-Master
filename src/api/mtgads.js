import request from "@/utils/request";

const MTGADS_BASE_URL = "/api/v1/mtg";

// ==================== 常量定义 ====================

// 状态枚举
export const MTG_STATUS = {
  ACTIVE: "0",
  PAUSED: "1",
};

// 创意组装方式
export const ASSEMBLY_TYPE = {
  SINGLE_IMAGE: 1, // 单图
  MULTI_IMAGE: 2, // 多图
  VIDEO: 3, // 视频
};

// ==================== API 方法 ====================

const MTGAdsAPI = {
  /**
   * 获取MTG广告账户列表（暂未实现）
   */
  getAccountList() {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 查询广告列表（广告层级）
   * @param {Object} params - 查询参数
   * @param {string[]} params.ids - 广告ID列表（可选）
   * @param {string} params.name - 广告名称（可选）
   * @param {string} params.status - 状态（可选）
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页大小，默认10
   */
  queryCampaigns(params) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 查询广告单元列表（广告单元层级）
   * @param {Object} params - 查询参数
   * @param {number[]} params.group_ids - 单元ID列表（可选）
   * @param {string} params.status - 状态（可选）
   * @param {number[]} params.campaign_ids - 广告ID列表（可选）
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页大小
   */
  queryGroups(params) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 查询创意组列表（创意组层级）
   * @param {Object} params - 查询参数
   * @param {number[]} params.group_ids - 单元ID列表（可选）
   * @param {number[]} params.creative_ids - 创意组ID列表（可选）
   * @param {string} params.status - 状态（可选）
   * @param {number[]} params.campaign_ids - 广告ID列表（可选）
   * @param {number} params.page - 页码
   * @param {number} params.page_size - 每页大小
   */
  queryCreatives(params) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 获取广告详情（暂未实现）
   */
  getCampaignDetail(id, extraParams = {}) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 获取广告单元详情（暂未实现）
   */
  getGroupDetail(id, extraParams = {}) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 获取创意组详情（暂未实现）
   */
  getCreativeDetail(id, extraParams = {}) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 创建广告（暂未实现）
   */
  createCampaign(data) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 创建广告单元（暂未实现）
   */
  createGroup(data) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 创建创意组（暂未实现）
   */
  createCreative(data) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 获取指定账户的所有广告基础数据（暂未实现）
   */
  getAllCampaignsBasic(accountId) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 获取指定账户的所有广告单元基础数据（暂未实现）
   */
  getAllGroupsBasic(accountId) {
    return Promise.reject(new Error("Not implemented"));
  },

  /**
   * 批量获取指定单元ID列表下的所有创意组基础数据（暂未实现）
   */
  getAllCreativesBasic(groupIds) {
    return Promise.reject(new Error("Not implemented"));
  },
};

export default MTGAdsAPI;
