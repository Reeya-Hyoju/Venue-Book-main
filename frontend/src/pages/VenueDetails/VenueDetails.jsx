import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaMapMarkerAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "./VenueDetails.css";
import { ACCESS_TOKEN } from "../../constants";

function VenueDetails() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem(ACCESS_TOKEN);
  const decoded = jwtDecode(token);
  const userId = decoded.user_id;
  

 const handleBooking = async () => {
  try {
    const userToken = localStorage.getItem("access");
    localStorage.setItem("userId", userId);
    localStorage.setItem("venueId", venueId);
    localStorage.setItem("start_date", start_date);
    localStorage.setItem("end_date", end_date);
    if (!userToken) {
      alert("Please log in to book a venue.");
      return;
    }
    console.log(userToken)
    const amount = 10000; // 100 Rs in paisa (you can make dynamic)

    const response = await axios.post(
      "http://127.0.0.1:8000/api/create-khalti-payment/",
      {
        user: userId,
        venue: venueId,
        start_date: start_date,
        end_date: end_date,
        amount: amount,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    window.location.href = response.data.payment_url;
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.detail || "Failed to initiate payment!");
  }
};


  
  
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/venue/${venueId}/`
        );
        setVenue(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchVenue();
  }, [venueId]);

  if (loading) return <div>Loading venue details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!venue) return <div>Venue not found</div>;

  return (
    <div className="venue-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Venues
      </button>

      <div className="venues-content">
        <div className="venue-image-gallery">
          {venue.imageurl?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${venue.venuename} image ${index + 1}`}
              className="venue-image"
            />
          ))}
        </div>

        <div className="venue-info">
          <h1 className="venue-name">{venue.venuename}</h1>
          <div className="venues-address">
            <FaMapMarkerAlt />
            <span>{venue.venueaddress}</span>
          </div>

          <div className="amenities-section">
            <h2 className="amenities-title">Amenities</h2>
            <div className="amenities-list">
              {venue.features?.split(",").map((feature, index) => (
                <div key={index} className="amenity-item">
                  <FaCheckCircle />
                  <span>{feature.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="booking-section">
        <h2 className="booking-title">Book This Venue</h2>
        <div className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Number of Guests:</label>
            <input type="number" placeholder="Enter number of guests" />
            <small>(Max Capacity: {venue.capacity})</small>
          </div>

          <button className="submit-button" onClick={handleBooking}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default VenueDetails;
