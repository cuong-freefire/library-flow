import axiosApi from '../api/axios';

export const userService = {
  async getAll() {
    const response = await axiosApi.get('/users');
    return response.data;
  },

  async update(id, payload) {
    const response = await axiosApi.patch(`/users/${id}`, payload);
    return response.data;
  },
};
