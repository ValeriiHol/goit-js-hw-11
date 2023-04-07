import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '35098687-e9db65cd1d1af185f37419a74';
const BASE_URL = 'https://pixabay.com/api/';
const perPage = 40;
let pageNumber = 0;

const formInput = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');

formInput.addEventListener('submit', onSearchSmt);
buttonLoadMore.addEventListener('click', onLoadMoreBtn);

let lightbox = new SimpleLightbox('.photo-card a', {
  captionDelay: 250,
});

async function onSearchSmt(ev) {
  ev.preventDefault();
  pageNumber = 0;
  gallery.innerHTML = '';
  buttonLoadMore.classList.add('is-hidden');
  const formData = new FormData(formInput);
  const queryValue = formData.get('searchQuery').trim();
  if (!queryValue) {
    alertEmptyQuery();
    return;
  }
  try {
    pageNumber += 1;
    // console.log(pageNumber);
    const { data } = await fetchImages(queryValue, pageNumber, perPage);
    if (data.totalHits === 0) {
      alertNoImagesFound();
    } else {
      createMarkup(data);
      alertTotalImagesFound(data);
      buttonLoadMore.classList.remove('is-hidden');
    }
    gallery.insertAdjacentHTML('beforeend', createMarkup(data));
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMoreBtn() {
  pageNumber += 1;
  const formData = new FormData(formInput);
  const queryValue = formData.get('searchQuery').trim();
  try {
    const { data } = await fetchImages(queryValue, pageNumber, perPage);
    createMarkup(data);
    if (pageNumber * perPage > data.totalHits) {
      buttonLoadMore.classList.add('is-hidden');
      alertReachedImages();
    }
    gallery.insertAdjacentHTML('beforeend', createMarkup(data));
    lightbox.refresh();
  } catch (error) {}
}

async function fetchImages(queryValue, pageNumber, perPage) {
  const response = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${queryValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNumber}&per_page=${perPage}`
  );
  return response;
}

const galleryElement = document.querySelector('.gallery').firstElementChild;
if (galleryElement) {
  const { height: cardHeight } = galleryElement.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function createMarkup(data) {
  const markup = data.hits
    .map(
      ({
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <div class="photo-card">
      <a class="gallery__link" href="${largeImageURL}">
            <div class="gallery-item" id="${id}">
              <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
              </div>
            </div>
          </a>
          </div>`;
      }
    )
    .join('');
  return markup;
}

function alertTotalImagesFound(data) {
  Notiflix.Notify.success(`'Hooray! We found ${data.totalHits} images.'`);
}

function alertNoImagesFound() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function alertReachedImages() {
  Notiflix.Notify.failure(
    "We're sorry, but you've reached the end of search results."
  );
}

function alertEmptyQuery() {
  Notiflix.Notify.failure('Please write something and try again.');
}
