import { z } from 'zod';
import { ReportDepth, PropertyType } from '../types/enums';

export const reportConfigSchema = z.object({
  title: z.string().min(1, '报告标题不能为空').max(200),
  cities: z.array(z.string()).min(1, '至少选择一个城市'),
  propertyTypes: z.array(z.nativeEnum(PropertyType)).min(1),
  sections: z.array(z.object({
    id: z.string(),
    enabled: z.boolean(),
    order: z.number().int().min(0),
  })),
  depth: z.nativeEnum(ReportDepth),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export const generateReportSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

export const refreshDataSchema = z.object({
  sources: z.array(z.string()).optional(),
  force: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50),
  password: z.string().min(1, '密码不能为空'),
});

export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(50),
  password: z.string().min(6, '密码至少6个字符').max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码输入不一致',
  path: ['confirmPassword'],
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
