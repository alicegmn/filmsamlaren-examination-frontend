# filmsamlaren-examination-frontend

# 1. Kortfattad beskrivning av projektet och hur man kör igång det lokalt.
Inne i GitHub-repot så klicka på knappen "Code" och välja Download Zip. Packa upp den på din dator och öppna sedan index.html i din webbläsare. Du kan också hämta ner det genom "Open with github desktop" och sedan visa det i din code editor. Om det är tex VS Code högerklickar du sedan på indexfilen och väljer "Open with Live Server" om du har det tillägget installerat.

# 2. Länk till din Figma-skiss
https://www.figma.com/design/0gUVU90HaH1ZjSIqTpdFnG/Filmsamlaren-fr%C3%A5n-Hemmakv%C3%A4ll?node-id=0-1&t=o79jxJMzlkX9O28v-1

# 3. Kortfattad förklaring av hur du uppfyllt JSON-, HTTP/HTTPS-, asynkronitets- och UX/UI-kraven.

UX/UI:
Tydlig och intuitiv design, responsivitet, tänkt på tillgänglighet genom tex "aria-attribut, semtantisk html-element,fokusindikatorer, alt-texter med mera, visuella hierarki (stort till litet i logisk följd) och kontrast. Även genom interaktivitet och feedback vid hovringar osv. Även felprevention och tydliga felmeddelanden som syns för användaren och förklarar vad som händer. Jag har försökt hålla nere på informationen och förtydliga det viktigaste.

Hämta och Presentera JSON-data:
Jag har använt fetch()-metoden för att hämta data i JSON-format från ett offentligt API. Genom att göra en GET-förfrågan till API:et får jag tillbaka strukturerad data som jag sedan tolkar med hjälp av response.json(). Denna data presenteras på webbsidan genom att jag dynamiskt uppdaterar DOM-element med relevant information, vilket gör att användarna enkelt kan se de filmer de är intresserade av.

HTTP/HTTPS & Asynkronitet:
Jag har implementerat asynkronitet med async/await. Genom att använda try/catch-block kan jag fånga eventuella fel som kan uppstå under nätverksförfrågningar, såsom nätverksfel eller ogiltiga svar från API:et. Funktionen handleHttpError med switchcase för felkoder förtydligar för användaren genom att anropa showNotification() och ger en visuell notis på sidan (med beskrivning)


# 4. Beskriv hur du hämtar data från API:et (Vilket API? URL/enpoint, parametrar, API nyckel?).'
I min applikation hämtar jag data från "The Movie Database (TMDB)" API. Man behövde ett konto och en personlig key som ligger högst upp i min javascript i en variabel (vet dock att man inte ska göra så). Efter det kan man göra unlimited förfrågningar om det gäller ickekommersiella/privata projekt.

Jag har definierat API-nyckeln i början av koden så att den kan användas i hela projektet. Jag har skapat en asynkron funkton (fetchFromApi) som tar emot en endpoint och eventuella parametrar. Inuti denna funktion används fetch() för att göra en GET-förfrågan till API:et. URL:en konstrueras genom att kombinera bas-URL:en med den specifika endpointen och lägger till API-nyckeln och eventuella andra saker som parameter.

Inuti fetchFromApi-funktionen används try/catch för att fånga eventuella fel som kan uppstå under datainhämtningen

När jag vill hämta data, till exempel för att få trendande filmer, anropar jag fetchFromApi med den specifika endpointen. Jag använder await för att vänta på att datan ska hämtas innan jag fortsätter med att bearbeta den.

Efter att ha hämtat och tolkat datan som JSON, använder jag DOM-manipulation för att presentera informationen på webbsidan. Jag loopar igenom resultaten och skapar HTML-element för att visa filmerna, vilket gör det enkelt för användarna att se och interagera med datan.

Bas-URL: https://api.themoviedb.org/3/

Endpoints:
- /movie/popular
- /trending/movie/week
- /search/movie
- /movie/{movie_id} (för mer detaljer om filmen)
– /movie/{movie_id}/credits (för regissörens namn)
– /genre/movie/list (genrer)
– /movie/{movie_id}/watch/providers (för att se vilka streamingtjänster som har filmen)

Parametrar:
– min api-nyckeln (i alla hämtningar)
– "query" för sökfrågan (filmtitlar) (för/search/movie)
- "page"antal sidor det finns att hämta (för: /search/movie)
– include_adult: vuxeninnehåll (true/false). (för: /search/movie)
– "region": (valfritt) För att specificera regionen för streamingtjänster (för: /movie/{movie_id}/watch/providers)

# 5. Hur man navigerar/använder applikationen.
Jag hoppas att den är så pass intuitiv att man förstår det när man går in på sidan. Man kan också navigera med tabb och det syns vart på sidan man står med tangentbordet också. Man kan se en topplista med de populäraste filmerna denna vecka högst upp och sedan kan man söka på filmtitlar, genrer och utgivnignsår. Tanken var att göra så att man kunde spara filmer till två olika listor "Att se/watchlist" och en "favoritlista" men jag hann inte få det klart innan deadlie tyvärr.