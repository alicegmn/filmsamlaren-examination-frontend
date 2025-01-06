// Define the API key for accessing the movie database API
const apiKey = 'cff5b2ddfbe3a8666237b019e68daa70';

// Initialize variables to keep track of the current page and total pages
let currentPage = 1; // Keeps track of the current page
let totalPages = 1; // Total number of pages returned from the API

// Define an asynchronous function to fetch data from the API
async function fetchFromApi(endpoint, params = {}) {
    // Construct the URL for the API request
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    // Append the API key and any additional parameters to the URL
    url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();

    try {
        // Make the API request using the Fetch API
        const response = await fetch(url);
        // Check if the response is not OK (status code outside the range 200-299)
        if (!response.ok) {
            handleHttpError(response.status, url); // Handle the HTTP error
            throw new Error(`HTTP error! status: ${response.status}`); // Throw an error with the status
        }
        // Parse the JSON response and return it
        return await response.json();
    } catch (error) {
        // Log any errors that occur during the fetch process
        console.error(`Error fetching data from ${url}:`, error);
        showNotification('Ett fel inträffade när data skulle hämtas. Vänligen försök igen genom att ladda om sidan.', true); // Show user-friendly error notification
        throw error; // Rethrow the error for further handling
    }
}

// Handle HTTP errors based on the status code
function handleHttpError(status, url) {
    let message; // Variable to hold the error message
    // Determine the error message based on the status code
    switch (status) {
        case 400:
            message = `Ogiltig begäran från källan: ${url} - Felkod: "Bad Request (400)"`; // Bad request error
            break;
        case 401:
            message = `Du är inte behörig att besöka: ${url}. Kontrollera din API-nyckel. - Felkod: "Unauthorized (401)"`; // Unauthorized error
            break;
        case 403:
            message = `Du saknar behörighet för få åtkomst till ${url} - Felkod: "Forbidden (403)"`; // Forbidden error
            break;
        case 404:
            message = `Den begärda resursen hittades inte (${url}). - Felkod: "Not Found (404)"`; // Not found error
            break;
        case 500:
            message = `Servern stötte på ett fel vid bearbetning av ${url}. - Felkod: "Internal Server Error (500)"`; // Internal server error
            break;
        case 503:
            message = `Tjänsten är tillfälligt otillgänglig för ${url}. - Felkod: "Service Unavailable (503)"`; // Service unavailable error
            break;
        default:
            message = `Ett oväntat fel inträffade för ${url}. - Felkod: "HTTP Error (${status})"`; // General error message
    }
    // Log the error message to the console
    console.error(message);
    showNotification(message, true); // Show the error message to the user
}

// Wait until the DOM content has loaded before executing the code
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch trending movies from the API
        const trendingMovies = await fetchFromApi('trending/movie/week');
        console.log('Trending Movies:', trendingMovies); // Log the trending movies

        // Get the element where the top ten movies will be displayed
        const topTenMoviesList = document.getElementById('topTen');
        if (!topTenMoviesList) {
            console.error('Elementet för topplista hittades inte.');
            return;
        }
        // Get the top ten movies from the trending movies results
        const topTenMovies = trendingMovies.results.slice(0, 10);

        // Loop through each movie in the top ten movies
        topTenMovies.forEach((movie, index) => {
            console.log(movie); // Log the entire movie object to see its structure
            console.log('Genres:', movie.genres); // Log the genres to see what is returned
            
            // Get fallback values for the movie
            const fallbacks = getFallbacks(movie, {}); // Använd getFallbacks för att hämta fallback-värden
            
            const movieElement = document.createElement('div'); // Create a new div for the movie
            movieElement.classList.add('movie'); // Add the 'movie' class to the div
            movieElement.setAttribute('aria-label', `Film: ${fallbacks.title}, Betyg: ${fallbacks.voteAverage}/10`); // Lägg till aria-label

            // Set the inner HTML of the movie element with movie details in Swedish
            movieElement.innerHTML = `
                <div class="movie-overlay" aria-hidden="true">${index + 1}</div>
                <img src="${fallbacks.posterPath}" alt="${fallbacks.title} poster" aria-label="${fallbacks.title} poster">
                <h3 aria-label="Filmtitel: ${fallbacks.title}">${fallbacks.title}</h3>
                <p aria-label="Utgivningsår: ${fallbacks.releaseYear}, Betyg: ${fallbacks.voteAverage}/10, Röster: ${fallbacks.voteCount}">${fallbacks.releaseYear} | Betyg: ${fallbacks.voteAverage}/10 (${fallbacks.voteCount} röster)</p>
            `;

            // Add a click event listener to show movie details in a modal
            movieElement.addEventListener('click', async () => {
                await showMovieDetails(movie.id); // Call the function to show movie details
            });

            // Append the movie element to the top ten movies list
            topTenMoviesList.appendChild(movieElement);
        });
    } catch (error) {
        // Log any errors that occur during initialization
        console.error('Error during initialization:', error);
        showNotification('Ett fel inträffade när filmerna skulle hämtas. Vänligen försök igen genom att ladda om sidan.', true); // Show user-friendly error message
    }

    // Add event listener for the search input field
    document.getElementById('searchInput').addEventListener('input', async function () {
        const query = this.value.trim(); // Get the trimmed value of the search input
        if (!query) {
            showNotification('Ange ett sökord för att fortsätta.', false);
            return;
        }
        currentPage = 1; // Reset to the first page
        await searchMovies(query, currentPage); // Call the search function
    });

    // Add event listener for the genre filter
    document.getElementById('genreFilter').addEventListener('change', async function () {
        currentPage = 1; // Reset to the first page
        const query = document.getElementById('searchInput').value.trim(); // Get the current search query
        await searchMovies(query, currentPage); // Call the search function
    });

    // Add event listener for the year filter
    document.getElementById('yearFilter').addEventListener('change', async function () {
        currentPage = 1; // Reset to the first page
        const query = document.getElementById('searchInput').value.trim(); // Get the current search query
        await searchMovies(query, currentPage); // Call the search function
    });
});

// Function to populate the genre filter dropdown
async function populateGenreFilter() {
    try {
        // Fetch genre data from the API
        const genreData = await fetchFromApi('genre/movie/list');
        const genreSelect = document.getElementById('genreFilter'); // Get the genre filter element
        // Loop through each genre and create an option element
        genreData.genres.forEach(genre => {
            const option = document.createElement('option'); // Create a new option element
            option.value = genre.id; // Set the value to the genre ID
            option.textContent = genre.name; // Set the text to the genre name
            option.setAttribute('aria-label', `Genre: ${genre.name}`); // Lagt till aria-label för genrealternativet
            genreSelect.appendChild(option); // Append the option to the genre select element
        });
    } catch (error) {
        // Log any errors that occur while fetching genres
        console.error('Error fetching genres:', error);
        showNotification('Ett fel inträffade när genrer skulle hämtas. Vänligen försök igen genom att ladda om sidan.', true); // Show user-friendly error notification
    }
}

// Call the function to populate the genre filter when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await populateGenreFilter(); // Populate the genre filter
});

// Handle the search form submission
document.getElementById('searchForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    const query = document.getElementById('searchInput').value; // Get the search input value
    currentPage = 1; // Start from the first page
    await searchMovies(query, currentPage); // Call the search function
});

// Define the function to search for movies with pagination
async function searchMovies(query, page) {
    try {
        console.log(`Search Query: ${query}, Page: ${page}`); // Log the search query and page number

        // Get values for year and genre filters
        const year = document.getElementById('yearFilter').value; // Get the selected year
        const genre = document.getElementById('genreFilter').value; // Get the selected genre

        // Determine the endpoint based on the input
        let endpoint = ''; // Variable to hold the endpoint
        const params = { page, api_key: apiKey }; // Parameters for the API request

        if (query.trim()) {
            // Use `search/movie` if only a query is provided
            endpoint = 'search/movie';
            params.query = query.trim(); // Add the query to the parameters
        } else {
            // Use `discover/movie` if genre or year is selected
            endpoint = 'discover/movie';
            if (year) params.primary_release_year = year; // Add the year to the parameters if selected
            if (genre) params.with_genres = genre; // Add the genre to the parameters if selected
        }

        // Check that at least one parameter is provided
        if (!params.query && !params.with_genres && !params.primary_release_year) {
            const searchMessageElement = document.getElementById('searchMessage'); // Hämta meddelandelementet
            searchMessageElement.textContent = 'Ange ett sökord, välj en genre och/eller ett årtal för att söka efter en film.'; // Sätt meddelandet
            searchMessageElement.classList.remove('hidden'); // Ta bort 'hidden' klassen för att visa meddelandet
            return; // Exit the function
        } else {
            // Dölja meddelandet om sökparametrar finns
            const searchMessageElement = document.getElementById('searchMessage');
            searchMessageElement.classList.add('hidden'); // Dölja meddelandet
        }

        // Fetch search data from the API
        const searchData = await fetchFromApi(endpoint, params);
        console.log('Search Data:', searchData); // Log the search data

        totalPages = searchData.total_pages; // Set the total number of pages

        const resultsSection = document.querySelector('.results'); // Get the results section element
        resultsSection.innerHTML = ''; // Clear previous results

        // Check if there are no results
        if (!searchData || !searchData.results || searchData.results.length === 0) {
            showNotification('Inga resultat hittades.', false);
            return;
        }

        // Display movies in the results section
        searchData.results.forEach(movie => {
            // Get fallback values for the movie
            const fallbacks = getFallbacks(movie, {}); // Använd getFallbacks för att hämta fallback-värden

            const movieElement = document.createElement('div'); // Create a new div for the movie
            movieElement.classList.add('movie'); // Add the 'movie' class to the div
            movieElement.setAttribute('aria-label', `Film: ${fallbacks.title}, Betyg: ${fallbacks.voteAverage}/10`); // Lägg till aria-label

            // Set the inner HTML of the movie element with movie details in Swedish
            movieElement.innerHTML = `
                <img src="${fallbacks.posterPath}" alt="${fallbacks.title} poster" aria-label="${fallbacks.title} filmplakat">
                <h3 aria-label="Filmtitel: ${fallbacks.title}">${fallbacks.title}</h3>
                <p aria-label="Utgivningsår: ${fallbacks.releaseYear}, Betyg: ${fallbacks.voteAverage}/10, Röster: ${fallbacks.voteCount}">${fallbacks.releaseYear} | Betyg: ${fallbacks.voteAverage}/10 (${fallbacks.voteCount} röster)</p>
            `;

            // Add a click event listener to show movie details in a modal
            movieElement.addEventListener('click', async () => {
                await showMovieDetails(movie.id); // Call the function to show movie details
            });

            resultsSection.appendChild(movieElement); // Append the movie element to the results section
        });

        // Scroll to the top of the results section
        window.scrollTo({ top: document.querySelector('.results').offsetTop, behavior: 'smooth' });

        // Update pagination controls with the total number of movies
        updatePaginationControls(query, searchData.total_results);
    } catch (error) {
        // Log any errors that occur while fetching search results
        console.error('Error fetching search results:', error);
        showNotification('Ett fel inträffade när sökresultatet skulle hämtas. Vänligen försök igen genom att ladda om sidan.', true); // Show user-friendly error notification
    }
}

// Globala fallback-värden

function getFallbacks(movieDetails, watchProviders) {
    return {
        posterPath: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : '/img/poster.jpeg',
        title: movieDetails.title || 'Ingen titel tillgänglig',
        overview: movieDetails.overview || 'Vi saknar en beskrivning av filmen',
        genres: movieDetails.genres && movieDetails.genres.length > 0 ? movieDetails.genres.map(genre => genre.name).join(', ') : 'Inga genrer tillgängliga.',
        voteAverage: movieDetails.vote_average || 'Inget betyg tillgängligt',
        voteCount: movieDetails.vote_count || 0,
        releaseYear: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'Okänt utgivningsår',
        director: movieDetails.credits && movieDetails.credits.crew ? 
            (movieDetails.credits.crew.find(member => member.job === 'Director') ? 
            movieDetails.credits.crew.find(member => member.job === 'Director').name : 'Okänd regissör') : 
            'Okänd regissör',
        originalLanguage: movieDetails.original_language ? movieDetails.original_language.toUpperCase() : 'Okänt originalspråk',
        streamingProviders: watchProviders.results && watchProviders.results.SE && watchProviders.results.SE.flatrate ? 
            watchProviders.results.SE.flatrate.map(provider => provider.provider_name).join(', ') : 
            'Information om streaming saknas'
    };
}

// Funktion för att visa filmens detaljer
async function showMovieDetails(movieId) {
    try {
        // Fetch movie details, credits, and watch providers
        const [movieDetails, credits, watchProviders] = await Promise.all([
            fetchFromApi(`movie/${movieId}`), // Movie details
            fetchFromApi(`movie/${movieId}/credits`), // Credits to find the director
            fetchFromApi(`movie/${movieId}/watch/providers`) // Watch providers
        ]);

        // Check for streaming providers in the SE region
        const regionCode = 'SE'; // Update to the desired region
        const streamingProviders = watchProviders.results[regionCode]?.flatrate || [];

        // Add credits data to movieDetails for fallbacks
        movieDetails.credits = credits;

        // Get fallback values
        const fallbacks = getFallbacks(movieDetails, watchProviders);

        // Use streaming providers if available
        const streamingText = streamingProviders.length > 0
            ? streamingProviders.map(provider => provider.provider_name).join(', ')
            : 'Inte tillgänglig i din region.';

        // Build the modal content
        const modal = document.getElementById('movieModal');
        modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button" aria-label="Stäng ner sidan som visar detaljer om filmen.">Stäng</button>
            <div class="modal-columns">
                <div class="modalDetailsImg">
                    <img src="${fallbacks.posterPath}" alt="${fallbacks.title} poster" aria-label="${fallbacks.title} poster">
                </div>
                <div class="modalDetailsText">
                    <h3>${fallbacks.title}</h3>
                    <p>${fallbacks.overview}</p>
                    <p><strong>Genrer:</strong> ${fallbacks.genres}</p>
                    <p><strong>Betyg:</strong> ${fallbacks.voteAverage}/10 (${fallbacks.voteCount} röster)</p>
                    <p><strong>År:</strong> ${fallbacks.releaseYear}</p>
                    <p><strong>Regissör:</strong> ${fallbacks.director}</p>
                    <p><strong>Originalspråk:</strong> ${fallbacks.originalLanguage}</p>
                    <p><strong>Streama filmen här:</strong> ${streamingText}</p>
                    <p><a href="https://www.themoviedb.org/movie/${movieId}" target="_blank" aria-label="Läs mer om ${fallbacks.title} på TMDB">Läs mer på tmdb.org</a></p>
                </div>
            </div>
        </div>`;

        // Show the modal
        modal.classList.remove('hidden');
        modal.style.display = 'block';

        // Add event listeners for closing the modal
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
            }
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error fetching movie details or watch providers:', error);
        showNotification('Ett fel inträffade när filmens detaljer skulle hämtas.', true);
    }
}



// Update pagination controls based on the current query and total results
function updatePaginationControls(query, totalResults) {
    const paginationSections = document.querySelectorAll('.pagination'); // Get all pagination sections
    paginationSections.forEach(paginationSection => {
        paginationSection.innerHTML = ''; // Clear previous pagination content

        // Display the number of pages and movies
        const infoText = document.createElement('p'); // Create a new paragraph element
        infoText.textContent = `Sida ${currentPage} av ${totalPages} | Totalt antal filmer: ${totalResults}`; // Set the text content
        infoText.classList.add('pagination-info'); // Add a class for styling
        paginationSection.appendChild(infoText); // Append the info text to the pagination section

        // If the current page is greater than 1, show the previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button'); // Create a new button element
            prevButton.textContent = 'Föregående'; // Set the button text
            prevButton.setAttribute('aria-label', 'Gå till föregående sida'); // Lagt till aria-label för föregående knapp
            // Add an event listener to go to the previous page when clicked
            prevButton.addEventListener('click', async () => {
                currentPage--; // Decrement the current page
                await searchMovies(query, currentPage); // Call the search function for the previous page
            });
            paginationSection.appendChild(prevButton); // Append the previous button to the pagination section
        }

        // If the current page is less than the total pages, show the next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button'); // Create a new button element
            nextButton.textContent = 'Nästa'; // Set the button text
            nextButton.setAttribute('aria-label', 'Gå till nästa sida'); // Lagt till aria-label för nästa knapp
            // Add an event listener to go to the next page when clicked
            nextButton.addEventListener('click', async () => {
                currentPage++; // Increment the current page
                await searchMovies(query, currentPage); // Call the search function for the next page
            });
            paginationSection.appendChild(nextButton); // Append the next button to the pagination section
        }
    });
}

// Show notification message to the user
function showNotification(message, isError = false) {
    const notificationMessageElement = document.getElementById('errorMessage'); // Get the notification message element
    notificationMessageElement.textContent = message; // Set the message text
    const notificationElement = document.getElementById('errorNotification'); // Get the notification element
    notificationElement.classList.remove('hidden'); // Remove the 'hidden' class to show the notification

    // Change the background color based on whether it's an error message or not
    if (isError) {
        notificationElement.style.backgroundColor = '#f44336'; // Red for error
    } else {
        notificationElement.style.backgroundColor = '#E93BAC'; // Orange for search message
    }
}

// Close the notification box
function closeNotification() {
    const notificationElement = document.getElementById('errorNotification'); // Get the notification element
    notificationElement.classList.add('hidden'); // Add the 'hidden' class to hide the notification
}