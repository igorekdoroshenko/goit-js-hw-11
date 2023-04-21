import './css/styles.css';

import PixabayApiService from './PixabayApiService.js';
import LoadMoreBtn from './LoadMoreBtn.js';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import Notiflix from 'notiflix';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const refs = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
};

const pixabayApiService = new PixabayApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

refs.form.addEventListener('submit', onSubmit);

refs.gallery.addEventListener('click', event => {
  event.preventDefault(); // Забороняємо дію за замовчуванням
  if (event.target.tagName === 'IMG') {
    const imgUrl = event.target.dataset.largeImage; // Отримуємо URL великого зображення з атрибута data-large-image
    new SimpleLightbox({ source: imgUrl }).show(); // Показуємо велике зображення в модальному вікні
  }
});

loadMoreBtn.button.addEventListener('click', fetchArticles);

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  console.log(scrollTop, scrollHeight, clientHeight);
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    fetchArticles();
  }
}

window.addEventListener("scroll", handleScroll);


//Функція submit
function onSubmit(e) {
  e.preventDefault();
  loadMoreBtn.show();

  const form = e.currentTarget;
  pixabayApiService.query = form.elements.searchQuery.value;

  pixabayApiService.resetPage();

  clearGalleryList();
  fetchArticles().finally(() => form.reset());
}
//Функція fetch

async function fetchArticles() {
  loadMoreBtn.disable();

  try {
    const markup = await getArticlesMarkup();
    updateGalleryList(markup);
    loadMoreBtn.enable();
    
        const hitsCount = refs.gallery.querySelectorAll('.photo-card').length;
        const totalCount = pixabayApiService.totalHits;
        if (hitsCount >= totalCount) {
          loadMoreBtn.hide();
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          
        }
  } catch (err) {
    onError(err);
  }
}
//Функція отримання данних
async function getArticlesMarkup() {
  try {
    const data = await pixabayApiService.getPictures();
    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      throw new Error('No data!');
    }
        const up = data.hits.reduce(
          (markup, hit) => markup + createMarkup(hit),
          ''
        );
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        return up;
  } catch (err) {
    onError(err);
  }
}
//Функція створення галереї с заповненими полями
function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  const cardMarkup = `
    <div class="photo-card">
        <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${
    (largeImageURL, tags)
  }" loading="lazy" />
        <div class="info">
            <p class="info-item">
                <b>Likes</b>${likes}
            </p>
            <p class="info-item">
                <b>Views</b>${views}
            </p>
            <p class="info-item">
                <b>Comments</b>${comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>${downloads}
            </p>
        </div>
        </a>
    </div>
`;

  return cardMarkup;
}

//Функция оновлення плейл-листа
function updateGalleryList(markup) {
  if (markup !== undefined) {
    refs.gallery.insertAdjacentHTML('beforeend', markup);
  }
  lightbox.refresh();
}
//Функція очистки плейл-листа
function clearGalleryList() {
  refs.gallery.innerHTML = '';
}
//Функція помилки
function onError(err) {
  console.error(err);
  loadMoreBtn.hide();

  clearGalleryList();
  updateGalleryList('<p>Not found!</p>');
}


