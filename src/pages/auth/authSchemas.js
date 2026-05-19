import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự.'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Vui lòng nhập họ tên.').max(50, 'Họ tên tối đa 50 ký tự.'),
    email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không đúng định dạng.'),
    phone: z.string().trim().optional(),
    password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự.'),
    confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });
