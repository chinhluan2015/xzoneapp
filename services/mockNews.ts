import { NewsEvent } from "../types";

/**
 * Mock news data for testing when API quota is exhausted
 * Based on real HPG events from 2024
 */
export const getMockNews = (symbol: string, startDate: string, endDate: string): NewsEvent[] => {
  // Sample news events for HPG (Hoa Phat Group) - Updated to match 2025 data
  const mockHPGNews: NewsEvent[] = [
    {
      id: "mock-1",
      date: "2025-09-15",
      title: "Hòa Phát công bố KQKD Q3/2025: Doanh thu 58.000 tỷ đồng, lợi nhuận tăng 22% YoY",
      source: "CafeF",
      summary: "Tập đoàn Hòa Phát ghi nhận doanh thu thuần đạt 58.000 tỷ đồng trong quý 3/2025, tăng 22% so với cùng kỳ năm trước. Lợi nhuận sau thuế đạt 8.200 tỷ đồng nhờ giá thép phục hồi.",
      url: "https://cafef.vn/hoa-phat-q3-2025"
    },
    {
      id: "mock-2",
      date: "2025-10-20",
      title: "HPG ký hợp đồng xuất khẩu thép sang Mỹ trị giá 350 triệu USD",
      source: "VnExpress",
      summary: "Hòa Phát ký kết hợp đồng xuất khẩu 800.000 tấn thép xây dựng sang thị trường Hoa Kỳ, đánh dấu mở rộng thị trường xuất khẩu chiến lược.",
      url: "https://vnexpress.net/hpg-xuat-khau-my-2025"
    },
    {
      id: "mock-3",
      date: "2025-11-18",
      title: "MB Securities nâng giá mục tiêu HPG lên 35.000đ, khuyến nghị 'Mua mạnh'",
      source: "Bloomberg Vietnam",
      summary: "Bộ phận phân tích MB Securities nâng giá mục tiêu cổ phiếu HPG lên 35.000 đồng/cp (+32% từ giá hiện tại), duy trì khuyến nghị 'Mua mạnh'.",
      url: "https://bloomberg.com/mb-hpg-target-2025"
    },
    {
      id: "mock-4",
      date: "2025-12-05",
      title: "Hòa Phát công bố kế hoạch đầu tư 1.5 tỷ USD mở rộng Dung Quất giai đoạn 3",
      source: "Reuters Vietnam",
      summary: "Tập đoàn Hòa Phát thông báo kế hoạch đầu tư bổ sung 1.5 tỷ USD vào dự án mở rộng Khu liên hợp gang thép Dung Quất giai đoạn 3, nâng tổng công suất lên 10 triệu tấn/năm.",
      url: "https://reuters.com/hpg-expansion-2025"
    },
    {
      id: "mock-5",
      date: "2025-12-26",
      title: "HPG đạt sản lượng thép kỷ lục 4.2 triệu tấn trong tháng 12/2025",
      source: "Đầu tư Chứng khoán",
      summary: "Hòa Phát thông báo sản lượng thép tháng 12/2025 đạt kỷ lục 4.2 triệu tấn, tăng 18% so với tháng trước nhờ các lò cao hoạt động hết công suất.",
      url: "https://dautuchungkhoan.vn/hpg-san-luong-ky-luc"
    }
  ];

  // Generic fallback for other symbols - Updated to 2025
  const mockGenericNews: NewsEvent[] = [
    {
      id: "mock-generic-1",
      date: "2025-10-15",
      title: `${symbol}: Công bố kết quả kinh doanh quý 3/2025`,
      source: "HNX/HOSE",
      summary: `Công ty cổ phần ${symbol} công bố báo cáo tài chính quý 3/2025 với kết quả kinh doanh tích cực, doanh thu tăng trưởng 12% so với cùng kỳ.`,
      url: "https://vsd.vn"
    },
    {
      id: "mock-generic-2",
      date: "2025-11-20",
      title: `${symbol}: Đại hội đồng cổ đông bất thường thông qua phương án phát hành thêm cổ phiếu`,
      source: "VnDirect",
      summary: `ĐHĐCĐ bất thường thông qua nghị quyết phát hành 50 triệu cổ phiếu để huy động vốn cho dự án mở rộng sản xuất và đầu tư công nghệ.`,
      url: "https://vndirect.com.vn"
    },
    {
      id: "mock-generic-3",
      date: "2025-12-10",
      title: `${symbol}: Ký hợp đồng hợp tác chiến lược với đối tác nước ngoài`,
      source: "CafeF",
      summary: `${symbol} ký kết hợp đồng hợp tác với đối tác quốc tế, mở rộng thị trường xuất khẩu và chuyển giao công nghệ.`,
      url: "https://cafef.vn"
    }
  ];

  // Return HPG-specific data if symbol is HPG, otherwise generic
  return symbol.toUpperCase() === 'HPG' ? mockHPGNews : mockGenericNews;
};
