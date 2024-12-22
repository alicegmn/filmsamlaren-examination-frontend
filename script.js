const apiKey = 'cff5b2ddfbe3a8666237b019e68daa70';

let currentPage = 1; // Håller reda på aktuell sida
let totalPages = 1; // Total antal sidor från API:et

// Definiera en asynkron funktion för att hämta data från API:et
async function fetchFromApi(endpoint, params = {}) {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            handleHttpError(response.status, url);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

// Hantera HTTP-fel baserat på statuskod
function handleHttpError(status, url) {
    switch (status) {
        case 400:
            console.error(`Bad Request (400): The request to ${url} was invalid.`);
            break;
        case 401:
            console.error(`Unauthorized (401): Access to ${url} is unauthorized. Check your API key.`);
            break;
        case 403:
            console.error(`Forbidden (403): You do not have permission to access ${url}.`);
            break;
        case 404:
            console.error(`Not Found (404): The requested resource ${url} was not found.`);
            break;
        case 500:
            console.error(`Internal Server Error (500): The server encountered an error processing ${url}.`);
            break;
        case 503:
            console.error(`Service Unavailable (503): The service is temporarily unavailable for ${url}.`);
            break;
        default:
            console.error(`HTTP Error (${status}): An unexpected error occurred for ${url}.`);
    }
}

// Vänta tills DOM-innehållet har laddats innan koden körs
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const trendingMovies = await fetchFromApi('trending/movie/week');
        console.log('Trending Movies:', trendingMovies);

        const topTenMoviesList = document.getElementById('topTen');
        const topTenMovies = trendingMovies.results.slice(0, 10);

        topTenMovies.forEach(movie => {
            const listItem = document.createElement('li');

            // Skapa en länk för varje film
            const movieLink = document.createElement('a');
            movieLink.textContent = movie.title;
            movieLink.href = '#';
            movieLink.classList.add('movie-link');

            // Lägg till klickhändelse för att visa modal
            movieLink.addEventListener('click', async (event) => {
                event.preventDefault(); // Förhindrar sidladdning
                await showMovieDetails(movie.id);
            });

            listItem.appendChild(movieLink);
            topTenMoviesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

async function populateGenreFilter() {
    try {
        const genreData = await fetchFromApi('genre/movie/list');
        const genreSelect = document.getElementById('genreFilter');
        genreData.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

// Kör funktionen när sidan laddas
document.addEventListener('DOMContentLoaded', async () => {
    await populateGenreFilter();
});


// Hantera sökformulär
document.getElementById('searchForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    currentPage = 1; // Starta från första sidan
    await searchMovies(query, currentPage);
});

// Definiera funktionen för att söka efter filmer med paginering
async function searchMovies(query, page) {
    try {
        console.log(`Search Query: ${query}, Page: ${page}`);

        // Hämta värden för årtal och genre
        const year = document.getElementById('yearFilter').value;
        const genre = document.getElementById('genreFilter').value;

        // Välj endpoint baserat på inmatningen
        let endpoint = '';
        const params = { page, api_key: apiKey };

        if (query.trim()) {
            // Använd `search/movie` om endast query används
            endpoint = 'search/movie';
            params.query = query.trim();
        } else {
            // Använd `discover/movie` om genre eller år används
            endpoint = 'discover/movie';
            if (year) params.primary_release_year = year;
            if (genre) params.with_genres = genre;
        }

        // Kontrollera att minst en parameter är angiven
        if (!params.query && !params.with_genres && !params.primary_release_year) {
            alert('Please enter a search term, select a genre, or specify a year.');
            return;
        }

        const searchData = await fetchFromApi(endpoint, params);
        console.log('Search Data:', searchData);

        totalPages = searchData.total_pages; // Sätt total antal sidor

        const resultsSection = document.querySelector('.results');
        resultsSection.innerHTML = '';

        if (!searchData || !searchData.results.length) {
            resultsSection.innerHTML = '<p>No results found.</p>';
            return;
        }

        // Visa filmer i resultatsektionen
        searchData.results.forEach(movie => {
            if (!movie.poster_path) return;

            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');
            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} poster">
                <h2>${movie.title}</h2>
                <p>Year: ${new Date(movie.release_date).getFullYear()}</p>
                <p>Rating: ${(movie.vote_average)}/10 (${movie.vote_count} votes)</p>
            `;

            // Lägg till klickhändelse för att visa modal
            movieElement.addEventListener('click', async () => {
                await showMovieDetails(movie.id);
            });

            resultsSection.appendChild(movieElement);
        });

        // Scrolla till toppen av sidan
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Uppdatera pagineringsknappar med totalt antal filmer
        updatePaginationControls(query, searchData.total_results);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}




// Funktion för att visa modal med filmens detaljer
async function showMovieDetails(movieId) {
    try {
        const movieDetails = await fetchFromApi(`movie/${movieId}`);
        const watchProviders = await fetchFromApi(`movie/${movieId}/watch/providers`);

        const modal = document.getElementById('movieModal');
        
        // Rensa tidigare innehåll
        modal.innerHTML = '';

        // Hämta streamingtjänster (endast för Sverige som exempel)
        const providers = watchProviders.results.SE || {};
        const streamingProviders = providers.flatrate || [];
        const tmdbLink = `https://www.themoviedb.org/movie/${movieId}/watch`;

        // Skapa dynamiskt innehåll för modalen
        modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button"><span>&times;</span> Close</button>
            <div class="modal-columns">
                <div class="modalDetailsImg">
                    <img src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" alt="${movieDetails.title} poster">
                </div>
                <div class="modalDetailsText">
                    <h2>${movieDetails.title}</h2>
                    <p>${movieDetails.overview}</p>
                    <p><strong>Genres:</strong> ${movieDetails.genres.map(genre => genre.name).join(', ')}</p>
                    <p><strong>Rating:</strong> ${movieDetails.vote_average}/10 (${movieDetails.vote_count} votes)</p>
                    <p><strong>Year:</strong> ${new Date(movieDetails.release_date).getFullYear()}</p>
                    ${
                        streamingProviders.length > 0
                            ? `<p><strong>Available on:</strong> ${streamingProviders.map(provider => provider.provider_name).join(', ')}</p>`
                            : `<p><strong>Streaming:</strong> Not available in your region.</p>`
                    }
                    <p><a href="${tmdbLink}" target="_blank" class="tmdb-link">Learn more on tmdb.org</a></p>
                </div>
            </div>
        </div>`;

        // Visa modalen
        modal.classList.remove('hidden');
        modal.style.display = 'block';

        // Stäng modalen när man klickar på kryss
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Stäng modalen när man trycker på Escape
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
            }
        });

        // Stäng modalen när man klickar utanför den
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error fetching movie details or watch providers:', error);
    }
}

// Uppdatera pagineringsknappar
function updatePaginationControls(query, totalResults) {
    const paginationSections = document.querySelectorAll('.pagination');
    paginationSections.forEach(paginationSection => {
        paginationSection.innerHTML = '';

        // Visa antal sidor och filmer
        const infoText = document.createElement('p');
        infoText.textContent = `Page ${currentPage} of ${totalPages} | Total movies: ${totalResults}`;
        infoText.classList.add('pagination-info');
        paginationSection.appendChild(infoText);

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', async () => {
                currentPage--;
                await searchMovies(query, currentPage);
            });
            paginationSection.appendChild(prevButton);
        }

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', async () => {
                currentPage++;
                await searchMovies(query, currentPage);
            });
            paginationSection.appendChild(nextButton);
        }
    });
}
