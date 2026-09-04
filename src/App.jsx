import { useState } from "react";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

import "./App.css";
import destinations from "./data/destinations";

function App() {
  const [selectedDestination, setSelectedDestination] = useState(
    destinations[0],
  );
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const handleSearch = () => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      alert("Please enter a destination.");
      return;
    }

    const foundDestination = destinations.find(
      (destination) =>
        destination.name.toLowerCase().includes(searchText) ||
        destination.country.toLowerCase().includes(searchText) ||
        destination.continent.toLowerCase().includes(searchText),
    );

    if (foundDestination) {
      setSelectedDestination(foundDestination);
      setWeather(null);
      setWeatherError("");

      document
        .getElementById("destinations")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("Destination not found");
    }
  };
  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by your browser.");
      return;
    }

    setLocationMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationMessage("Your location detected successfully.");
      },
      () => {
        setLocationMessage(
          "Location permission denied. Please search manually.",
        );
      },
    );
  };

  const getWeather = async (destination) => {
    setWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${destination.latitude}&lon=${destination.longitude}&appid=${API_KEY}&units=metric`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Weather data could not be loaded.");
      }

      setWeather(data);
    } catch (error) {
      setWeatherError(error.message);
    } finally {
      setWeatherLoading(false);
    }
  };
  const [continent, setContinent] = useState("All");
  const [favorite, setFavorite] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredDestinations =
    continent === "All"
      ? destinations
      : destinations.filter(
          (destination) => destination.continent === continent,
        );
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">WANDER</div>

        <div className={`nav-links ${menuOpen ? "menu-open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="#destinations" onClick={() => setMenuOpen(false)}>
            Destinations
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
        </div>

        <a
          href="#destinations"
          className="explore-btn"
          onClick={() => setMenuOpen(false)}
        >
          Explore
        </a>

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-small">DISCOVER THE WORLD</p>

          <h1>
            Your next
            <br />
            adventure starts here.
          </h1>

          <p className="hero-description">
            Explore beautiful destinations, discover famous places, check
            real-time weather and plan your perfect trip.
          </p>
          <div className="search-box">
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button onClick={handleSearch}>🔍 Search</button>

            <button onClick={getMyLocation}>📍 Use My Location</button>
          </div>

          {locationMessage && (
            <p className="location-message">{locationMessage}</p>
          )}

          {userLocation && (
            <div className="user-location">
              <p>📍 Your Location</p>
              <p>Latitude: {userLocation.latitude.toFixed(4)}</p>
              <p>Longitude: {userLocation.longitude.toFixed(4)}</p>
            </div>
          )}
        </div>
      </section>

      {/* Destinations */}
      <section className="destinations" id="destinations">
        <div className="section-heading">
          <p>EXPLORE</p>
          <h2>Popular destinations</h2>
          <p className="destination-count">
            {filteredDestinations.length} destinations available
          </p>
          <div className="filters">
            <button onClick={() => setContinent("All")}>All</button>
            <button onClick={() => setContinent("Europe")}>Europe</button>
            <button onClick={() => setContinent("Asia")}>Asia</button>
          </div>
        </div>

        <div className="destination-grid">
          {filteredDestinations.map((destination) => (
            <div
              className={`destination-card ${
                selectedDestination.id === destination.id ? "selected-card" : ""
              }`}
              key={destination.id}
              onClick={() => {
                setSelectedDestination(destination);
                setWeather(null);
                setWeatherError("");
              }}
            >
              <div
                className="destination-image"
                style={{
                  backgroundImage: `linear-gradient(transparent, rgba(0,0,0,.6)), url(${destination.image})`,
                }}
              >
                <span>{destination.name.toUpperCase()}</span>
              </div>

              <h3>{destination.name}</h3>

              <p>
                {destination.country} · {destination.continent}
              </p>

              <button
                className="favorite-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setFavorite(
                    favorite === destination.id ? null : destination.id,
                  );
                }}
              >
                {favorite === destination.id ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>

        <div className="weather-section">
          <button onClick={() => getWeather(selectedDestination)}>
            🌤️ Get Weather
          </button>

          {weatherLoading && <p>Loading weather...</p>}

          {weatherError && <p>{weatherError}</p>}

          {weather && (
            <div className="weather-card">
              <h3>Current Weather</h3>

              <div className="weather-main">
                <span className="weather-icon">🌤️</span>

                <div>
                  <h2>{Math.round(weather.main.temp)}°C</h2>
                  <p>{weather.weather[0].description}</p>
                </div>
              </div>

              <div className="weather-details">
                <div>
                  <span>💧</span>
                  <p>Humidity</p>
                  <strong>{weather.main.humidity}%</strong>
                </div>

                <div>
                  <span>💨</span>
                  <p>Wind</p>
                  <strong>{weather.wind.speed} m/s</strong>
                </div>

                <div>
                  <span>🌡️</span>
                  <p>Feels Like</p>
                  <strong>{Math.round(weather.main.feels_like)}°C</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="selected-destination">
          <div className="selected-image">
            <img
              src={selectedDestination.image}
              alt={selectedDestination.name}
            />
          </div>

          <div className="selected-info">
            <p className="selected-label">SELECTED DESTINATION</p>

            <h2>{selectedDestination.name}</h2>

            <p>
              {selectedDestination.country} · {selectedDestination.continent}
            </p>

            <p className="selected-description">
              {selectedDestination.description}
            </p>

            <h3>Famous Places</h3>

            <div className="places-grid">
              {selectedDestination.places.map((place) => (
                <div className="place-card" key={place.name}>
                  <img src={place.image} alt={place.name} />
                  <h4>{place.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {favorite && (
        <div className="favorite-section">
          <p className="favorite-label">YOUR FAVORITE</p>

          {(() => {
            const favoriteDestination = destinations.find(
              (destination) => destination.id === favorite,
            );

            return (
              <>
                <h2>❤️ {favoriteDestination?.name}</h2>

                <p className="favorite-country">
                  {favoriteDestination?.country} ·{" "}
                  {favoriteDestination?.continent}
                </p>

                <button
                  className="favorite-explore-btn"
                  onClick={() => {
                    setSelectedDestination(favoriteDestination);

                    document
                      .getElementById("destinations")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore Destination
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* About */}
      <section className="about" id="about">
        <div className="about-content">
          <p className="about-label">ABOUT WANDER</p>

          <h2>Travel smarter. Explore more.</h2>

          <p>
            WANDER helps travelers discover beautiful destinations, explore
            famous places, check real-time weather and find inspiration for
            their next adventure.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
