import { RepairData } from '../types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/**
 * GIẢI PHÁP CHO DATA LỚN (100-200k dòng):
 * 
 * 1. PRE-AGGREGATION: Tính toán thống kê TRƯỚC, không gửi raw data
 *    - Tổng, trung bình, phân bố theo các dimensions
 *    - Group by: tháng, phân xưởng, loại xe, loại sửa chữa...
 * 
 * 2. SMART CONTEXT: Chỉ gửi ~3-5k tokens thay vì hàng triệu
 *    - Summary statistics
 *    - Top N items cho mỗi category
 *    - Aggregated data theo các góc nhìn
 * 
 * 3. QUERY-SPECIFIC CONTEXT: Mở rộng trong tương lai
 *    - Phân tích câu hỏi để lấy relevant data
 *    - RAG với vector database
 *    - SQL generation
 */

// Cache for computed statistics
interface DataStatistics {
  // Tổng quan
  totalRecords: number;
  totalCost: number;
  totalLaborCost: number;
  totalMaterialCost: number;
  avgCost: number;
  minCost: number;
  maxCost: number;
  uniqueVehicles: number;
  rejectedCount: number;
  rejectedRate: number;
  
  // Phân bố theo thời gian
  byMonth: Array<{ month: string; count: number; cost: number }>;
  byQuarter: Array<{ quarter: string; count: number; cost: number }>;
  
  // Phân bố theo category
  byRepairType: Array<{ type: string; count: number; cost: number; percentage: number }>;
  byWorkshop: Array<{ workshop: string; count: number; cost: number; percentage: number }>;
  
  // Top items
  topVehiclesByCost: Array<{ vehicle: string; cost: number; count: number }>;
  topVehiclesByCount: Array<{ vehicle: string; count: number; cost: number }>;
  
  // Chi phí
  laborVsMaterial: { labor: number; material: number; laborPercent: number };
  costDistribution: { under1M: number; from1Mto5M: number; from5Mto10M: number; over10M: number };
}

export class AIService {
  private config: OpenAIConfig;
  private conversationHistory: ChatMessage[] = [];
  private cachedStats: DataStatistics | null = null;
  private lastDataHash: string = '';

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      maxTokens: Number(import.meta.env.VITE_OPENAI_MAX_TOKENS) || 16384,
      temperature: Number(import.meta.env.VITE_OPENAI_TEMPERATURE) || 0.1
    };
  }

  /**
   * Kiểm tra API key có được cấu hình chưa
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey !== '';
  }

  /**
   * Helper: Parse cost string to number
   */
  private parseCost(cost: any): number {
    if (typeof cost === 'string') {
      return parseFloat(cost.replace(/,/g, '')) || 0;
    }
    return Number(cost) || 0;
  }

  /**
   * Helper: Format currency
   */
  private formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)} tỷ đ`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} triệu đ`;
    }
    return `${value.toLocaleString('vi-VN')} đ`;
  }

  /**
   * Helper: Create data hash for cache invalidation
   */
  private createDataHash(data: RepairData[]): string {
    return `${data.length}_${data[0]?.repair_no || ''}_${data[data.length - 1]?.repair_no || ''}`;
  }

  /**
   * CORE: Tính toán toàn bộ thống kê từ raw data
   * Chạy 1 lần khi data thay đổi, cache kết quả
   */
  private computeStatistics(data: RepairData[]): DataStatistics {
    const dataHash = this.createDataHash(data);
    
    // Return cached if data unchanged
    if (this.cachedStats && this.lastDataHash === dataHash) {
      return this.cachedStats;
    }

    console.log(`📊 Computing statistics for ${data.length} records...`);
    const startTime = performance.now();

    // === TÍNH TOÁN TỔNG QUAN ===
    let totalCost = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;
    let minCost = Infinity;
    let maxCost = 0;
    let rejectedCount = 0;

    // Cost distribution
    let under1M = 0, from1Mto5M = 0, from5Mto10M = 0, over10M = 0;

    // Aggregation maps
    const vehicleMap = new Map<string, { count: number; cost: number }>();
    const repairTypeMap = new Map<string, { count: number; cost: number }>();
    const workshopMap = new Map<string, { count: number; cost: number }>();
    const monthMap = new Map<string, { count: number; cost: number }>();
    const quarterMap = new Map<string, { count: number; cost: number }>();

    // Single pass through data (O(n) - hiệu quả cho data lớn)
    for (const item of data) {
      const cost = this.parseCost(item.tong_chi_phi_sau_vat);
      const laborCost = this.parseCost(item.chi_phi_nhan_cong);
      const materialCost = this.parseCost(item.thanh_toan_vat_tu_xnk);
      
      // Totals
      totalCost += cost;
      totalLaborCost += laborCost;
      totalMaterialCost += materialCost;
      if (cost < minCost) minCost = cost;
      if (cost > maxCost) maxCost = cost;
      
      // Rejection
      if (item.tu_choi_yeu_cau === true) rejectedCount++;
      
      // Cost distribution
      if (cost < 1_000_000) under1M++;
      else if (cost < 5_000_000) from1Mto5M++;
      else if (cost < 10_000_000) from5Mto10M++;
      else over10M++;

      // Group by vehicle
      const vehicle = item.phuong_tien_can_sua_chua || 'N/A';
      const vehicleData = vehicleMap.get(vehicle) || { count: 0, cost: 0 };
      vehicleData.count++;
      vehicleData.cost += cost;
      vehicleMap.set(vehicle, vehicleData);

      // Group by repair type
      const repairType = item.phan_loai_sua_chua || 'Khác';
      const repairData = repairTypeMap.get(repairType) || { count: 0, cost: 0 };
      repairData.count++;
      repairData.cost += cost;
      repairTypeMap.set(repairType, repairData);

      // Group by workshop
      const workshop = item.phan_xuong || 'N/A';
      const workshopData = workshopMap.get(workshop) || { count: 0, cost: 0 };
      workshopData.count++;
      workshopData.cost += cost;
      workshopMap.set(workshop, workshopData);

      // Group by month
      const dateStr = item.ngay_gio_yeu_cau;
      if (dateStr) {
        const match = String(dateStr).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
          const monthKey = `${match[2]}/${match[3]}`; // MM/YYYY
          const monthData = monthMap.get(monthKey) || { count: 0, cost: 0 };
          monthData.count++;
          monthData.cost += cost;
          monthMap.set(monthKey, monthData);

          // Quarter
          const month = parseInt(match[2]);
          const quarterNum = Math.ceil(month / 3);
          const quarterKey = `Q${quarterNum}/${match[3]}`;
          const quarterData = quarterMap.get(quarterKey) || { count: 0, cost: 0 };
          quarterData.count++;
          quarterData.cost += cost;
          quarterMap.set(quarterKey, quarterData);
        }
      }
    }

    const totalRecords = data.length;

    // === BUILD RESULT ===
    const stats: DataStatistics = {
      totalRecords,
      totalCost,
      totalLaborCost,
      totalMaterialCost,
      avgCost: totalCost / totalRecords,
      minCost: minCost === Infinity ? 0 : minCost,
      maxCost,
      uniqueVehicles: vehicleMap.size,
      rejectedCount,
      rejectedRate: (rejectedCount / totalRecords) * 100,

      // By month (sorted)
      byMonth: Array.from(monthMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => {
          const [mA, yA] = a.month.split('/').map(Number);
          const [mB, yB] = b.month.split('/').map(Number);
          return yA !== yB ? yA - yB : mA - mB;
        }),

      // By quarter
      byQuarter: Array.from(quarterMap.entries())
        .map(([quarter, data]) => ({ quarter, ...data }))
        .sort((a, b) => a.quarter.localeCompare(b.quarter)),

      // By repair type (top 10)
      byRepairType: Array.from(repairTypeMap.entries())
        .map(([type, data]) => ({
          type,
          ...data,
          percentage: (data.count / totalRecords) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),

      // By workshop
      byWorkshop: Array.from(workshopMap.entries())
        .map(([workshop, data]) => ({
          workshop,
          ...data,
          percentage: (data.cost / totalCost) * 100
        }))
        .sort((a, b) => b.cost - a.cost),

      // Top vehicles by cost
      topVehiclesByCost: Array.from(vehicleMap.entries())
        .map(([vehicle, data]) => ({ vehicle, ...data }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 15),

      // Top vehicles by count
      topVehiclesByCount: Array.from(vehicleMap.entries())
        .map(([vehicle, data]) => ({ vehicle, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),

      // Labor vs Material
      laborVsMaterial: {
        labor: totalLaborCost,
        material: totalMaterialCost,
        laborPercent: totalCost > 0 ? (totalLaborCost / totalCost) * 100 : 0
      },

      // Cost distribution
      costDistribution: { under1M, from1Mto5M, from5Mto10M, over10M }
    };

    // Cache result
    this.cachedStats = stats;
    this.lastDataHash = dataHash;

    const elapsed = (performance.now() - startTime).toFixed(0);
    console.log(`✅ Statistics computed in ${elapsed}ms`);

    return stats;
  }

  /**
   * Tạo system prompt với AGGREGATED statistics (không phải raw data)
   * Đây là key để xử lý data lớn: chỉ gửi ~3-5k tokens
   */
  private createSystemPrompt(data: RepairData[]): string {
    if (data.length === 0) {
      return 'Bạn là trợ lý AI của VLA. Hiện chưa có dữ liệu được import.';
    }

    const stats = this.computeStatistics(data);
    
    // Build compact but comprehensive summary
    const summary = this.buildCompactSummary(stats);
    
    return `Bạn là trợ lý AI chuyên phân tích dữ liệu sửa chữa phương tiện của VLA.

📊 DỮ LIỆU ĐÃ ĐƯỢC TỔNG HỢP (${stats.totalRecords.toLocaleString('vi-VN')} records):

${summary}

📋 NHIỆM VỤ:
- Trả lời câu hỏi dựa trên dữ liệu thống kê đã tổng hợp ở trên
- Phân tích chi phí, xu hướng, so sánh các metrics
- Đưa ra insights và gợi ý tối ưu
- Trả lời tiếng Việt, ngắn gọn, dùng emoji phù hợp
- Format số: dùng "triệu đ", "tỷ đ" cho số lớn

⚠️ LƯU Ý:
- Dữ liệu đã được pre-aggregated, bạn có đầy đủ thống kê
- Nếu cần chi tiết không có trong summary, thông báo cho user
- Luôn làm tròn số cho dễ đọc`;
  }

  /**
   * Build compact summary from statistics
   */
  private buildCompactSummary(stats: DataStatistics): string {
    const lines: string[] = [];

    // === TỔNG QUAN ===
    lines.push('【TỔNG QUAN】');
    lines.push(`• Tổng yêu cầu: ${stats.totalRecords.toLocaleString('vi-VN')}`);
    lines.push(`• Số phương tiện: ${stats.uniqueVehicles.toLocaleString('vi-VN')}`);
    lines.push(`• Tổng chi phí: ${this.formatCurrency(stats.totalCost)}`);
    lines.push(`• Chi phí TB/yêu cầu: ${this.formatCurrency(stats.avgCost)}`);
    lines.push(`• Min: ${this.formatCurrency(stats.minCost)} | Max: ${this.formatCurrency(stats.maxCost)}`);
    lines.push(`• Từ chối: ${stats.rejectedCount} (${stats.rejectedRate.toFixed(1)}%)`);

    // === CHI PHÍ NHÂN CÔNG VS VẬT TƯ ===
    lines.push('\n【CHI PHÍ NHÂN CÔNG VS VẬT TƯ】');
    lines.push(`• Nhân công: ${this.formatCurrency(stats.laborVsMaterial.labor)} (${stats.laborVsMaterial.laborPercent.toFixed(1)}%)`);
    lines.push(`• Vật tư: ${this.formatCurrency(stats.laborVsMaterial.material)} (${(100 - stats.laborVsMaterial.laborPercent).toFixed(1)}%)`);

    // === PHÂN BỐ CHI PHÍ ===
    lines.push('\n【PHÂN BỐ THEO MỨC CHI PHÍ】');
    const cd = stats.costDistribution;
    const total = stats.totalRecords;
    lines.push(`• <1 triệu: ${cd.under1M} (${((cd.under1M/total)*100).toFixed(1)}%)`);
    lines.push(`• 1-5 triệu: ${cd.from1Mto5M} (${((cd.from1Mto5M/total)*100).toFixed(1)}%)`);
    lines.push(`• 5-10 triệu: ${cd.from5Mto10M} (${((cd.from5Mto10M/total)*100).toFixed(1)}%)`);
    lines.push(`• >10 triệu: ${cd.over10M} (${((cd.over10M/total)*100).toFixed(1)}%)`);

    // === THEO THÁNG (last 6 months) ===
    if (stats.byMonth.length > 0) {
      lines.push('\n【CHI PHÍ THEO THÁNG】');
      const recentMonths = stats.byMonth.slice(-6);
      for (const m of recentMonths) {
        lines.push(`• ${m.month}: ${m.count} yêu cầu, ${this.formatCurrency(m.cost)}`);
      }
    }

    // === THEO PHÂN XƯỞNG ===
    if (stats.byWorkshop.length > 0) {
      lines.push('\n【THEO PHÂN XƯỞNG】');
      for (const w of stats.byWorkshop.slice(0, 5)) {
        lines.push(`• ${w.workshop}: ${w.count} yêu cầu, ${this.formatCurrency(w.cost)} (${w.percentage.toFixed(1)}%)`);
      }
    }

    // === LOẠI SỬA CHỮA ===
    if (stats.byRepairType.length > 0) {
      lines.push('\n【LOẠI SỬA CHỮA PHỔ BIẾN】');
      for (const r of stats.byRepairType.slice(0, 7)) {
        lines.push(`• ${r.type}: ${r.count} (${r.percentage.toFixed(1)}%), ${this.formatCurrency(r.cost)}`);
      }
    }

    // === TOP XE ===
    if (stats.topVehiclesByCost.length > 0) {
      lines.push('\n【TOP 10 XE CHI PHÍ CAO NHẤT】');
      for (const v of stats.topVehiclesByCost.slice(0, 10)) {
        lines.push(`• ${v.vehicle}: ${this.formatCurrency(v.cost)} (${v.count} lần sửa)`);
      }
    }

    if (stats.topVehiclesByCount.length > 0) {
      lines.push('\n【TOP 10 XE SỬA NHIỀU NHẤT】');
      for (const v of stats.topVehiclesByCount.slice(0, 10)) {
        lines.push(`• ${v.vehicle}: ${v.count} lần, ${this.formatCurrency(v.cost)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Gửi tin nhắn đến OpenAI
   */
  async sendMessage(userMessage: string, repairData: RepairData[]): Promise<string> {
    if (!this.isConfigured()) {
      return '⚠️ API Key chưa được cấu hình. Vui lòng thêm VITE_OPENAI_API_KEY vào file .env.local';
    }

    try {
      // Nếu là tin nhắn đầu tiên, thêm system prompt
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: this.createSystemPrompt(repairData)
        });
      }

      // Thêm tin nhắn user
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Gọi OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.conversationHistory,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Lưu response vào history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Giới hạn history (giữ system prompt + 10 tin nhắn gần nhất)
      if (this.conversationHistory.length > 21) {
        this.conversationHistory = [
          this.conversationHistory[0], // System prompt
          ...this.conversationHistory.slice(-20) // 10 cặp user-assistant gần nhất
        ];
      }

      return assistantMessage;

    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      return `❌ Lỗi: ${error.message}`;
    }
  }

  /**
   * Get current statistics (for debugging/display)
   */
  getStatistics(data: RepairData[]): DataStatistics | null {
    if (data.length === 0) return null;
    return this.computeStatistics(data);
  }

  /**
   * Get token estimate for current context
   * Rough estimate: 1 token ≈ 4 characters
   */
  estimateTokens(data: RepairData[]): { statsTokens: number; rawDataTokens: number; savings: string } {
    const stats = this.computeStatistics(data);
    const summary = this.buildCompactSummary(stats);
    
    // Estimate tokens for aggregated summary
    const statsTokens = Math.ceil(summary.length / 4);
    
    // Estimate tokens if we sent raw data (rough: 300 tokens per record)
    const rawDataTokens = data.length * 300;
    
    const savingsPercent = (((rawDataTokens - statsTokens) / rawDataTokens) * 100).toFixed(2);
    
    return {
      statsTokens,
      rawDataTokens,
      savings: `${savingsPercent}% (${rawDataTokens.toLocaleString()} → ${statsTokens.toLocaleString()} tokens)`
    };
  }

  /**
   * Reset conversation
   */
  reset(): void {
    this.conversationHistory = [];
  }

  /**
   * Clear statistics cache
   */
  clearCache(): void {
    this.cachedStats = null;
    this.lastDataHash = '';
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export type for external use
export type { DataStatistics };
