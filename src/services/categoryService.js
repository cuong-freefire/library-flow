import axiosApi from '../api/axios';

export const categoryService = {
  async getAll() {
    const response = await axiosApi.get('/categories');
    return response.data;
  },

  async create(payload) {
    const response = await axiosApi.post('/categories', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await axiosApi.patch(`/categories/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    await axiosApi.delete(`/categories/${id}`);
  },
};
