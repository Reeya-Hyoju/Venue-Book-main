import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowRight, FaCalendarAlt, FaSignOutAlt, FaSearch } from "react-icons/fa";
import "../styles/Home.css";

function Home() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/venue/");
        setVenues(response.data);
        setLoading(false);
        console.log(response.data);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleVenueClick = (venueId) => {
    navigate(`/venue-details/${venueId}`);
  };

  const filteredVenues = venues.filter(venue => 
    venue.venuename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.venueaddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentVenues = filteredVenues.slice(0, indexOfLastItem);
  const hasMore = filteredVenues.length > indexOfLastItem;

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading stunning venues...</p></div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-logo">Event<span>Sphere</span></h1>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search venues by name or location..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        <div className="header-actions">
          <button className="my-venues-btn" onClick={() => navigate("/booked")}>
            <FaCalendarAlt /> My Bookings
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <section className="hero-sectionn">
        <h1 className="section-title">Discover Stunning Venues</h1>
      </section>

      <div className="venue-grid">
        {currentVenues.map((venue) => (
          <div
            key={venue.venueid}
            className="venue-card"
            onClick={() => handleVenueClick(venue.venueid)}
          >
            <div className="image-container">
              <img
                src={
                  venue.imageurl?.[0] || "https://via.placeholder.com/350x240"
                }
                alt={venue.venuename}
                className="venue-image"
              />
              <div className="price-badge">From Rs.35000{venue.starting_price}</div>
              <div className="venue-overlay">
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
            <div className="venue-content">
              <div className="text-container">
                <h3 className="venue-title">{venue.venuename}</h3>
                <p className="venue-address">{venue.venueaddress}</p>
                <div className="venue-features">
                  <span className="feature-tag">Wedding</span>
                  <span className="feature-tag">Corporate</span>
                </div>
              </div>
              <div className="button-container">
                <button className="book-now-btn">
                  Book Now <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredVenues.length === 0 && (
        <div className="no-results">
          <h3>No venues found matching "{searchTerm}"</h3>
          <p>Try adjusting your search terms or browse all venues</p>
        </div>
      )}
      
      {hasMore && (
        <button
          className="show-more-btn"
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Show More Venues
        </button>
      )}
      
     
    </div>
  );
}

export default Home;