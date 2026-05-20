export function formatCurrency(value: number, decimals = 0): string {
  if (value >= 1e8) {
    return `${(value / 1e8).toFixed(2)}亿元`;
  }
  if (value >= 1e4) {
    return `${(value / 1e4).toFixed(decimals)}万元`;
  }
  return `${value.toFixed(decimals)}元`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function formatArea(value: number): string {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}平方公里`;
  }
  return `${(value / 1e4).toFixed(2)}万平方米`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatPeriod(period: string): string {
  if (period.includes('Q')) {
    const [year, q] = period.split('-Q');
    return `${year}年第${q}季度`;
  }
  if (period.includes('-')) {
    const [year, month] = period.split('-');
    return `${year}年${parseInt(month)}月`;
  }
  return period;
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}
