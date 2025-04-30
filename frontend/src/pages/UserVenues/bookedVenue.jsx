import { useEffect, useState } from "react";
import api from "../../api";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../../constants";
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfo,
  FaChevronRight,
  FaBuilding,
  FaUsers,
  FaRupeeSign,
  FaSearch
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./bookedVenue.css";

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const token = localStorage.getItem(ACCESS_TOKEN);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.user_id;
        
        // Get all bookings
        const response = await api.get(`http://localhost:8000/api/userbookings/${userId}/`);

        // Filter bookings for current user
        const userBookings = response.data.filter(booking => booking.user === userId);

        // For each booking, fetch venue details
        const bookingsWithVenueDetails = await Promise.all(
          userBookings.map(async (booking) => {
            try {
              const venueResponse = await api.get(`http://localhost:8000/api/venues/id/${booking.venue}/`);
              return {
                ...booking,
                venueDetails: venueResponse.data,
              };
            } catch (error) {
              console.error(`Error fetching venue ${booking.venue}:`, error);
              return {
                ...booking,
                venueDetails: {
                  venuename: "Unknown Venue",
                  venueaddress: "Address unavailable",
                },
              };
            }
          })
        );

        setBookings(bookingsWithVenueDetails);

        // Get canceled bookings
        const canceledResponse = await api.get(`http://localhost:8000/api/canceled/${userId}/`);
        const canceledBookingsWithVenueDetails = canceledResponse.data.map((booking) => ({
          ...booking,
          venueDetails: {
            venuename: booking.venue_name,
            venueaddress: booking.venue_address,
          },
        }));
        
        setCanceledBookings(canceledBookingsWithVenueDetails);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [token]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate booking duration in days
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        // First get the booking details
        const bookingToCancel = bookings.find(b => b.id === bookingId);
        
        // Delete the booking
        await api.delete(`http://localhost:8000/api/bookings/${bookingId}/`);
        
        // Create notification
        await api.post('/api/notifications/', {
          recipient: bookingToCancel.venueDetails.venueownerid,
          message: `Booking canceled for ${bookingToCancel.venueDetails.venuename} (${formatDate(bookingToCancel.start_date)} - ${formatDate(bookingToCancel.end_date)})`,
          booking: bookingId
        });
  
        // Update state
        setBookings(bookings.filter(b => b.id !== bookingId));
      } catch (error) {
        console.error("Error canceling booking:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const filteredBookings = filterStatus === "all" 
    ? [...bookings, ...canceledBookings] 
    : filterStatus === "canceled"
    ? canceledBookings
    : bookings.filter(booking => 
        filterStatus === "confirmed" ? booking.verified : !booking.verified
      );

  if (loading) {
    return (
      <div className="ub-loading-container">
        <div className="ub-loader"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <motion.div 
        className="ub-auth-required"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="ub-auth-content">
          <h2>Authentication Required</h2>
          <p>Please log in to view your bookings.</p>
          <motion.button 
            onClick={() => navigate("/login")} 
            className="ub-auth-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="ub-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="ub-header">
        <motion.h1 
          className="ub-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          My Bookings
        </motion.h1>
        
        <motion.div 
          className="ub-filter-controls"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button 
            className={`ub-filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button 
            className={`ub-filter-btn ${filterStatus === "confirmed" ? "active" : ""}`}
            onClick={() => setFilterStatus("confirmed")}
          >
            Confirmed
          </button>
          <button 
            className={`ub-filter-btn ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button 
            className={`ub-filter-btn ${filterStatus === "canceled" ? "active" : ""}`}
            onClick={() => setFilterStatus("canceled")}
          >
            Canceled
          </button>
        </motion.div>
      </div>

      {filteredBookings.length > 0 ? (
        <motion.div 
          className="ub-bookings-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AnimatePresence>
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                className={`ub-booking-card ${booking.verified ? "verified" : "pending"}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
              >
                <div className="ub-booking-card-main" onClick={() => toggleBookingDetails(booking.id)}>
                  <div className="ub-venue-image-container">
                    <div className="ub-venue-image">
                      <FaBuilding className="ub-venue-icon" />
                    </div>
                    <div className="ub-status-indicator">
                      {booking.verified ? (
                        <span className="ub-status-badge confirmed">
                          <FaCheckCircle /> Confirmed
                        </span>
                      ) : booking.canceled_at ? (
                        <span className="ub-status-badge canceled">
                          <FaTimesCircle /> Canceled
                        </span>
                      ) : (
                        <span className="ub-status-badge pending">
                          <FaInfo /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ub-booking-info">
                    <h3>{booking.venueDetails?.venuename || "Unknown Venue"}</h3>
                    <p className="ub-venue-address">
                      <FaMapMarkerAlt />
                      {booking.venueDetails?.venueaddress || "Address not available"}
                    </p>
                    
                    <div className="ub-booking-dates">
                      <div className="ub-date-info">
                        <FaCalendarAlt className="ub-calendar-icon" />
                        <div>
                          <span>{formatDate(booking.start_date)}</span>
                          <span className="ub-date-separator">→</span>
                          <span>{formatDate(booking.end_date)}</span>
                        </div>
                      </div>
                      <div className="ub-booking-duration">
                        {calculateDuration(booking.start_date, booking.end_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ub-booking-toggle">
                    <motion.div
                      animate={{ rotate: expandedBooking === booking.id ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronRight />
                    </motion.div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedBooking === booking.id && (
                    <motion.div 
                      className="ub-booking-details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >

                      
                      {booking.canceled_at ? (
                        <div className="ub-canceled-info">
                          <p>Booking was canceled on {formatDate(booking.canceled_at)}</p>
                          <p>Reason: {booking.reason || "No reason provided"}</p>
                        </div>
                      ) : (
                        <motion.button 
                          className="ub-cancel-booking-btn"
                          onClick={() => handleCancelBooking(booking.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTimesCircle /> Cancel Booking
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          className="ub-no-bookings"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="ub-no-bookings-icon">
            <FaSearch />
          </div>
          <h3>No Bookings Found</h3>
          <p>You haven't booked any venues yet.</p>
          <motion.button 
            className="ub-explore-venues-btn"
            onClick={() => navigate("/home")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Venues
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default UserBookings;
