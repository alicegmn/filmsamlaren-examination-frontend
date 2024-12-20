// const apiKey = 'cff5b2ddfbe3a8666237b019e68daa70';

// // Definiera en asynkron funktion för att hämta data från API:et
// async function fetchFromApi(endpoint, params = {}) {
//     // Skapa en URL med korrekt hantering av query-parametrar
//     const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
//     url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();

//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error(`Error fetching data from ${url}:`, error);
//         throw error;
//     }
// }

// // Vänta tills DOM-innehållet har laddats innan koden körs
// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         // Hämta trending-filmer med API-nyckeln som query-param
//         const trendingMovies = await fetchFromApi('trending/movie/week');
//         console.log('Trending Movies:', trendingMovies);

//         const topTenMoviesList = document.getElementById('topTen');
//         const topTenMovies = trendingMovies.results.slice(0, 10);

//         topTenMovies.forEach(movie => {
//             const listItem = document.createElement('li');
//             listItem.textContent = movie.title;
//             topTenMoviesList.appendChild(listItem);
//         });
//     } catch (error) {
//         console.error('Error during initialization:', error);
//     }
// });

// // Hantera sökformulär
// document.getElementById('searchForm').addEventListener('submit', async function (event) {
//     event.preventDefault();
//     const query = document.getElementById('searchInput').value;
//     await searchMovies(query);
// });

// // Definiera funktionen för att söka efter filmer
// async function searchMovies(query) {
//     try {
//         console.log('Search Query:', query);

//         const searchData = await fetchFromApi('search/movie', { query: encodeURIComponent(query) });
//         console.log('Search Data:', searchData);

//         const resultsSection = document.querySelector('.results');
//         resultsSection.innerHTML = '';

//         if (!searchData || !searchData.results.length) {
//             resultsSection.innerHTML = '<p>No results found.</p>';
//             return;
//         }

//         searchData.results.forEach(movie => {
//             if (!movie.poster_path) return;

//             const movieElement = document.createElement('div');
//             movieElement.classList.add('movie');

//             movieElement.innerHTML = `
//                 <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} poster">
//                 <h2>${movie.title}</h2>
//                 <p>Year: ${new Date(movie.release_date).getFullYear()}</p>
//                 <p>Rating: ${(movie.vote_average)}/10 (${movie.vote_count} votes)</p>
//             `;
//             resultsSection.appendChild(movieElement);
//         });
//     } catch (error) {
//         console.error('Error fetching search results:', error);
//     }
// }

const apiKey = 'cff5b2ddfbe3a8666237b019e68daa70';

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
            listItem.textContent = movie.title;
            topTenMoviesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Hantera sökformulär
document.getElementById('searchForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    await searchMovies(query);
});

// Definiera funktionen för att söka efter filmer
async function searchMovies(query) {
    try {
        console.log('Search Query:', query);

        const searchData = await fetchFromApi('search/movie', { query: encodeURIComponent(query) });
        console.log('Search Data:', searchData);

        const resultsSection = document.querySelector('.results');
        resultsSection.innerHTML = '';

        if (!searchData || !searchData.results.length) {
            resultsSection.innerHTML = '<p>No results found.</p>';
            return;
        }

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
            resultsSection.appendChild(movieElement);
        });
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}
