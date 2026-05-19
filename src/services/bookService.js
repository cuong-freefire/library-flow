import axiosApi from '../api/axios';

export const bookService = {
  async getAll() {
    const response = await axiosApi.get('/books');
    return response.data;
  },

  async getById(id) {
    const response = await axiosApi.get(`/books/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await axiosApi.post('/books', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await axiosApi.patch(`/books/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    await axiosApi.delete(`/books/${id}`);
  },
};
