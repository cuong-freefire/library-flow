import { z } from 'zod';

const requiredText = (message) => z.string().trim().min(1, message);
const nonNegativeInteger = (message) => z.coerce.number().int(message).min(0, message);

export const bookSchema = z.object({
  title: requiredText('Vui lòng nhập tên sách.').max(120, 'Tên sách tối đa 120 ký tự.'),
  author: requiredText('Vui lòng nhập tác giả.').max(80, 'Tác giả tối đa 80 ký tự.'),
  categoryId: z.coerce.number().int().positive('Vui lòng chọn thể loại.'),
  description: z.string().trim().optional(),
  totalCopies: z.coerce.number().int('Tổng bản phải là số nguyên.').min(1, 'Tổng bản phải ít nhất là 1.'),
  damagedCopies: nonNegativeInteger('Số bản hỏng phải là số nguyên không âm.'),
  lostCopies: nonNegativeInteger('Số bản mất phải là số nguyên không âm.'),
  coverImage: z.string().trim().optional(),
});
