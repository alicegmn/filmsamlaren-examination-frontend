const apiKey = '4a4b630c'; // Din OMDB API-nyckel

function fetchFromApi(endpoint) {
    // Gör ett fetch-anrop till den angivna endpointen med API-nyckeln
    fetch(`http://www.omdbapi.com/?${endpoint}apikey=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // Kasta ett fel om svaret inte är OK
            }
            return response.json(); // Returnera svaret som JSON
        })
        .then(data => {
            console.log(data); // Logga svaret
            return data; // Returnera data för vidare användning
        })
        .catch(error => {
            console.error('Error during initialization:', error); // Logga eventuella fel under initialisering
        });
}

// Vänta tills DOM-innehållet har laddats innan koden körs
document.addEventListener('DOMContentLoaded', () => {
    // Hämta de mest populära filmerna (anpassa endpointen för OMDB)
    fetchFromApi('s=batman&type=movie&').then(trendingMovies => { // Exempel på sökning
        console.log('Trending Movies:', trendingMovies); // Logga de hämtade filmerna
        // Visa de mest populära filmerna i listan
        const topTenMoviesList = document.getElementById('topTen'); // Hämta listan för att visa filmer
        const topTenMovies = trendingMovies.Search.slice(0, 10); // Ta de 10 mest populära filmerna
        topTenMovies.forEach(movie => {
            const listItem = document.createElement('li'); // Skapa ett listobjekt för varje film
            listItem.textContent = movie.Title; // Sätt filmens titel som textinnehåll
            topTenMoviesList.appendChild(listItem); // Lägg till listobjektet i listan
        });
    }).catch(error => {
        console.error('Error during initialization:', error); // Logga eventuella fel under initialisering
    });
});

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    searchMovies(query);
});

function searchMovies(query) {
    // Skapa en sök-URL med den angivna frågan, kodad för att hantera specialtecken
    let searchUrl = `s=${encodeURIComponent(query)}&`; // Lagt till sökparameter
    // Logga den fullständiga sök-URL:en för felsökning
    console.log('Search URL:', searchUrl); // Logga sök-URL:n

    // Anropa fetchFromApi-funktionen med den skapade sök-URL:en för att hämta data
    fetchFromApi(searchUrl).then(searchData => {
        console.log('Search Data:', searchData); // Logga svaret från API:et

        // Hämta sektionen där sökresultaten ska visas
        const resultsSection = document.querySelector('.results');
        // Rensa tidigare resultat i sektionen
        resultsSection.innerHTML = '';

        // Kontrollera om det inte finns några resultat från API:et
        if (!searchData || !searchData.Search) {
            // Visa ett meddelande om att inga resultat hittades
            resultsSection.innerHTML = '<p>No results found.</p>'; // Meddela om inga resultat hittades
            return; // Avsluta funktionen om inga resultat finns
        }

        // Loopar igenom varje film i resultaten
        searchData.Search.forEach(movie => {
            // Om filmen inte har en poster, hoppa över den
            if (movie.Poster === "N/A") return;

            // Skapa ett div-element för att visa filmens information
            const movieElement = document.createElement('div');
            // Lägg till en klass för styling
            movieElement.classList.add('movie');

            // Sätt in filmens information i div-elementet
            movieElement.innerHTML = `
                <img src="http://img.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}" alt="${movie.Title} poster">
                <h2>${movie.Title}</h2>
                <p>${movie.Year}</p>
                <p>${movie.imdbRating}</p>
            `;
            // Lägg till filmens element i resultatsektionen
            resultsSection.appendChild(movieElement);
        });
    }).catch(error => {
        // Logga eventuella fel som inträffar under hämtningen av sökresultat
        console.error('Error fetching search results:', error);
    });
}