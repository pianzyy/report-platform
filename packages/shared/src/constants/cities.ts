export interface CityInfo {
  code: string;
  name: string;
  province: string;
  tier: 1 | 2 | 3 | 4;
  region: 'east' | 'central' | 'west' | 'northeast';
}

export const SUPPORTED_CITIES: CityInfo[] = [
  { code: 'beijing', name: '北京', province: '北京市', tier: 1, region: 'east' },
  { code: 'shanghai', name: '上海', province: '上海市', tier: 1, region: 'east' },
  { code: 'guangzhou', name: '广州', province: '广东省', tier: 1, region: 'east' },
  { code: 'shenzhen', name: '深圳', province: '广东省', tier: 1, region: 'east' },
  { code: 'chengdu', name: '成都', province: '四川省', tier: 2, region: 'west' },
  { code: 'hangzhou', name: '杭州', province: '浙江省', tier: 2, region: 'east' },
  { code: 'ningbo', name: '宁波', province: '浙江省', tier: 2, region: 'east' },
  { code: 'wuhan', name: '武汉', province: '湖北省', tier: 2, region: 'central' },
  { code: 'nanjing', name: '南京', province: '江苏省', tier: 2, region: 'east' },
  { code: 'chongqing', name: '重庆', province: '重庆市', tier: 2, region: 'west' },
  { code: 'suzhou', name: '苏州', province: '江苏省', tier: 2, region: 'east' },
  { code: 'xian', name: '西安', province: '陕西省', tier: 2, region: 'west' },
  { code: 'changsha', name: '长沙', province: '湖南省', tier: 2, region: 'central' },
  { code: 'tianjin', name: '天津', province: '天津市', tier: 2, region: 'east' },
  { code: 'zhengzhou', name: '郑州', province: '河南省', tier: 2, region: 'central' },
  { code: 'jinan', name: '济南', province: '山东省', tier: 2, region: 'east' },
  { code: 'dongguan', name: '东莞', province: '广东省', tier: 2, region: 'east' },
  { code: 'qingdao', name: '青岛', province: '山东省', tier: 2, region: 'east' },
  { code: 'xiamen', name: '厦门', province: '福建省', tier: 2, region: 'east' },
  { code: 'hefei', name: '合肥', province: '安徽省', tier: 2, region: 'central' },
  { code: 'foshan', name: '佛山', province: '广东省', tier: 2, region: 'east' },
  { code: 'zhuhai', name: '珠海', province: '广东省', tier: 2, region: 'east' },
  { code: 'huizhou', name: '惠州', province: '广东省', tier: 2, region: 'east' },
  { code: 'zhongshan', name: '中山', province: '广东省', tier: 2, region: 'east' },
  { code: 'kunming', name: '昆明', province: '云南省', tier: 2, region: 'west' },
  { code: 'jiangmen', name: '江门', province: '广东省', tier: 3, region: 'east' },
  { code: 'zhaoqing', name: '肇庆', province: '广东省', tier: 3, region: 'east' },
];

export const DEFAULT_CITIES = ['beijing', 'shanghai', 'guangzhou', 'shenzhen'];

export function getCityByCode(code: string): CityInfo | undefined {
  return SUPPORTED_CITIES.find(c => c.code === code);
}

export function getCitiesByTier(tier: number): CityInfo[] {
  return SUPPORTED_CITIES.filter(c => c.tier === tier);
}
