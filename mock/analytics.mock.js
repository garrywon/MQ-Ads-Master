import { defineMock2 } from "./base";

export default defineMock2([
  {
    url: "analytics/query",
    method: ["POST"],
    body: ({ body }) => {
      // 根据请求参数生成模拟数据
      const { date_range, filters, group_by = [], metrics = [], page = 1, size = 50 } = body || {};

      // 模拟数据生成
      const mockItems = Array.from({ length: size }, (_, index) => {
        const item = {
          report_date: date_range?.start || "2026-02-20",
          game_id: (page - 1) * size + index + 1,
          game_name: `Game ${String.fromCharCode(65 + (((page - 1) * size + index) % 26))}`,
        };

        // 根据请求的指标添加对应的值
        if (metrics.includes("spend")) {
          item.spend = Math.floor(Math.random() * 100000) / 100; // 例如: 1234.56
        }
        if (metrics.includes("installs")) {
          item.installs = Math.floor(Math.random() * 1000); // 例如: 150
        }
        if (metrics.includes("roas")) {
          item.roas = Math.floor(Math.random() * 1000) / 100; // 例如: 2.35
        }

        // 如果有按game_id分组，可以生成更真实的模拟数据
        if (group_by.includes("game_id")) {
          item.game_name = `Game ${item.game_id}`;
        }

        return item;
      });

      return {
        total: 1000, // 模拟总记录数
        page: page,
        size: size,
        items: mockItems,
      };
    },
  },
]);
