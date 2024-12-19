const apiKey = 'cff5b2ddfbe3a8666237b019e68daa70';

// Definiera en asynkron funktion för att hämta data från API:et
async function fetchFromApi(endpoint) {
    // Lägg automatiskt till API-nyckeln i URL:en
    const fullUrl = `https://api.themoviedb.org/3/${endpoint}&api_key=${apiKey}`;
    try {
        const response = await fetch(fullUrl); // Utför fetch-anropet
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${fullUrl}:`, error);
        throw error;
    }
}


// Vänta tills DOM-innehållet har laddats innan koden körs

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Lägg till korrekt query-struktur för trending-filmer
        const trendingMovies = await fetchFromApi('trending/movie/week?'); // Lägg till frågetecken för att separera query-parametrar
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


document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    await searchMovies(query);
});

async function searchMovies(query) {
    try {
        console.log('Search URL:', query);

        const searchData = await fetchFromApi(`search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`);
        console.log('Search Data:', searchData);

        const resultsSection = document.querySelector('.results');
        resultsSection.innerHTML = '';

        if (!searchData || !searchData.results) {
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
                <p>${new Date(movie.release_date).getFullYear()}</p>
                <p>Rating: ${(movie.vote_average)}/10 (${(movie.vote_count)} votes)</p>
            `;
            resultsSection.appendChild(movieElement);
        });
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}