const apiKey = 'cff5b2ddfbe3a8666237b019e68daa70';
// Definiera alternativ för fetch-anropet
const options = {
    method: 'GET', // HTTP-metod som används för anropet
    headers: {
      accept: 'application/json', // Acceptera JSON-svar
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZmY1YjJkZGZiZTNhODY2NjIzN2IwMTllNjhkYWE3MCIsIm5iZiI6MTczNDUxNzY2MC4yMTcsInN1YiI6IjY3NjJhMzljYTBjYzNkZTY0N2ZmZTdlZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zQazy-gPTuM6vRTL_01hsQkQxX7_EeiDoZNkHCLmPGs', // Bearer-token för autentisering
    //   apiKey: 'cff5b2ddfbe3a8666237b019e68daa70', // API-nyckel för att autentisera mot The Movie Database API
    }
};

// Gör ett fetch-anrop till API:et för autentisering
fetch('https://api.themoviedb.org/3/authentication', options)
    .then(res => res.json()) // Konvertera svaret till JSON
    .then(res => console.log(res)) // Logga svaret
    .catch(err => console.error(err)); // Logga eventuella fel

// // Gör ett fetch-anrop till API:et för autentisering
// fetch('https://api.themoviedb.org/3/movie', options)
//     .then(res => res.json()) // Konvertera svaret till JSON
//     .then(res => console.log(res)) // Logga svaret
//     .catch(err => console.error(err)); // Logga eventuella fel


// Definiera en asynkron funktion för att hämta data från API:et
async function fetchFromApi(endpoint) {
    try {
        // Gör ett fetch-anrop till den angivna endpointen med API-nyckeln
        const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); // Kasta ett fel om svaret inte är OK
        }
        return await response.json(); // Returnera svaret som JSON
        console.log(response.json());
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error); // Logga eventuella fel
        throw error; // Kasta felet vidare
    }
}

// Vänta tills DOM-innehållet har laddats innan koden körs
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Hämta de mest populära filmerna
        const trendingMovies = await fetchFromApi('trending/movie/week');
        console.log('Trending Movies:', trendingMovies); // Logga de hämtade filmerna

        // Visa de mest populära filmerna i listan
        const topTenMoviesList = document.getElementById('topTen'); // Hämta listan för att visa filmer
        const topTenMovies = trendingMovies.results.slice(0, 10); // Ta de 10 mest populära filmerna
        topTenMovies.forEach(movie => {
            const listItem = document.createElement('li'); // Skapa ett listobjekt för varje film
            listItem.textContent = movie.title; // Sätt filmens titel som textinnehåll
            topTenMoviesList.appendChild(listItem); // Lägg till listobjektet i listan
        });
    } catch (error) {
        console.error('Error during initialization:', error); // Logga eventuella fel under initialisering
    }
});

document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    await searchMovies(query);
});

async function searchMovies(query) {
    try {
        // Skapa en sök-URL med den angivna frågan, kodad för att hantera specialtecken
        let searchUrl = `search/movie?query=${encodeURIComponent(query)}`;
        // Lägg till API-nyckeln till sök-URL:en
        searchUrl += `&api_key=${apiKey}`; // Lägg till API-nyckeln här

        // Logga den fullständiga sök-URL:en för felsökning
        console.log('Search URL:', searchUrl); // Logga sök-URL:n

        // Anropa fetchFromApi-funktionen med den skapade sök-URL:en för att hämta data
        const searchData = await fetchFromApi(searchUrl);
        // Logga svaret från API:et för att se vad som returnerades
        console.log('Search Data:', searchData); // Logga svaret från API:et

        // Hämta sektionen där sökresultaten ska visas
        const resultsSection = document.querySelector('.results');
        // Rensa tidigare resultat i sektionen
        resultsSection.innerHTML = '';

        // Kontrollera om det inte finns några resultat från API:et
        if (!searchData || !searchData.results) {
            // Visa ett meddelande om att inga resultat hittades
            resultsSection.innerHTML = '<p>No results found.</p>'; // Meddela om inga resultat hittades
            return; // Avsluta funktionen om inga resultat finns
        }

        // Loopar igenom varje film i resultaten
        searchData.results.forEach(movie => {
            // Om filmen inte har en poster, hoppa över den
            if (!movie.poster_path) return;

            // Skapa ett div-element för att visa filmens information
            const movieElement = document.createElement('div');
            // Lägg till en klass för styling
            movieElement.classList.add('movie');

            // Sätt in filmens information i div-elementet
            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} poster">
                <h2>${movie.title}</h2>
                <p>${new Date(movie.release_date).getFullYear()}</p>
                <p>${(movie.vote_average)}</p>
            `;
            // Lägg till filmens element i resultatsektionen
            resultsSection.appendChild(movieElement);
        });
    } catch (error) {
        // Logga eventuella fel som inträffar under hämtningen av sökresultat
        console.error('Error fetching search results:', error);
    }
}