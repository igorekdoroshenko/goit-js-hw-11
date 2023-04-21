import axios from 'axios';

export default class PixabayApiService {
  static POINTHTTP = 'https://pixabay.com/api/';
  static API_KEY = '35547387-1d51a37224883657f5a5d5cc8';

  constructor() {
    this.query = '';
    this.page = 1;
    this.per_page = 40;
  }

  async getPictures() {
    const url = `${PixabayApiService.POINTHTTP}?key=${PixabayApiService.API_KEY}&q=${this.query}&per_page=${this.per_page}&page=${this.page}&image_type=photo&orientation=horizontal&safesearch=true`;

    const { data } = await axios.get(url);
    this.incrementPage();

    return data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}
