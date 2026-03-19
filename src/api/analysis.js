import request from "@/utils/request";

const ANALYSIS_BASE_URL = "/api";

const AnalysisAPI = {
  /**
   * 查询分析数据
   * @param {Object} params - 查询参数
   * @param {Object} params.date_range - 日期范围
   * @param {string} params.date_range.start - 开始日期
   * @param {string} params.date_range.end - 结束日期
   * @param {Object} params.filters - 过滤条件
   * @param {string} params.filters.business_type - 业务类型
   * @param {string} params.filters.keyword - 关键词
   * @param {Array<string>} params.group_by - 分组字段
   * @param {Array<string>} params.metrics - 指标字段
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   */
  queryAnalytics(params) {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/query`,
      method: "post",
      data: params,
      // 使用特殊标记，让拦截器知道这是特殊格式的API
      customHandleResponse: true,
    });
  },
  /**
   * 查询ROI数据
   * @param {Object} params - 查询参数
   * @param {Object} params.date_range - 日期范围
   * @param {string} params.date_range.start - 开始日期
   * @param {string} params.date_range.end - 结束日期
   * @param {Array<number>} params.game_ids - 游戏ID数组
   * @param {Array<number>} params.channel_ids - 渠道ID数组
   * @param {Array<number>} params.ua_platform_ids - 投放平台ID数组
   * @param {Array<number>} params.mon_platform_ids - 变现平台ID数组
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @returns {Promise<Object>} 响应数据包含 total, page, size, summary, details
   */
  queryROI(params) {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/roi`,
      method: "post",
      data: params,
      customHandleResponse: true,
    });
  },
  /**
   * 获取消耗平台列表
   * @param {string} type - 平台类型
   * @returns {Promise} 平台列表
   */
  getPlatformOptionsUA(type = "UA") {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/options/platforms`,
      method: "get",
      params: {
        type,
      },
      customHandleResponse: true,
    });
  },
  /**
   * 获取变现平台列表
   * @param {string} type - 平台类型
   * @returns {Promise} 平台列表
   */
  getPlatformOptionsMON(type = "MON") {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/options/platforms`,
      method: "get",
      params: {
        type,
      },
      customHandleResponse: true,
    });
  },
  /**
   * 获取渠道列表
   * @returns {Promise} 渠道列表
   */
  getChannelOptions() {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/options/channels`,
      method: "get",
      customHandleResponse: true,
    });
  },
  /**
   * 获取游戏列表
   * @returns {Promise} 游戏列表
   */
  getGameOptions() {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/options/games`,
      method: "get",
      customHandleResponse: true,
    });
  },
  /**
   * 根据渠道获取游戏列表（卡片模式用）
   * @param {number} channelId - 渠道ID
   * @returns {Promise} 游戏列表
   */
  getGamesByChannel(channelId) {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/options/games`,
      method: "get",
      params: { channel_id: channelId },
      customHandleResponse: true,
    });
  },
  /**
   * 根据渠道获取平台列表（卡片模式用）
   * @param {string} type - 平台类型，如'UA'
   * @param {number} channelId - 渠道ID
   * @returns {Promise} 平台列表
   */
  getPlatformsByChannel(type = "UA", channelId) {
    return request({
      url: `${ANALYSIS_BASE_URL}/analytics/options/platforms`,
      method: "get",
      params: {
        type,
        channel_id: channelId,
      },
      customHandleResponse: true,
    });
  },
};

export default AnalysisAPI;
