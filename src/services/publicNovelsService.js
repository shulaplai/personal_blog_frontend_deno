import api from './base';

const publicNovelsService = {
  getAll(params) {
    return api.get('/novels', { params });
  },
  getBySlug(slug) {
    return api.get(`/novels/${slug}`);
  },
  getChapter(novelSlug, chapterNumber) {
    return api.get(`/novels/${novelSlug}/chapters/${chapterNumber}`);
  },
};

export default publicNovelsService;
