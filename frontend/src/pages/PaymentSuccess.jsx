import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCESS_TOKEN } from "../constants";

function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBooking = async () => {
      try {
        const userToken = localStorage.getItem(ACCESS_TOKEN);

        if (!userToken) {
          alert("Please log in to book a venue.");
          return;
        }

        const response = await axios.post(
          "http://127.0.0.1:8000/api/bookings/",
          {
            user: localStorage.getItem("userId"),
            venue: localStorage.getItem("venueId"),
            start_date: localStorage.getItem("start_date"),
            end_date: localStorage.getItem("end_date"),
          },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        alert("Payment successful, booking confirmed!");
        navigate("/payment-success");
      } catch (error) {
        console.error(error);
      }
    };

    handleBooking(); // <-- CALL IT here
  }, [navigate]); // include navigate in dependencies to avoid React warnings

  return <div>Verifying Payment and Booking Venue...</div>;
}

export default PaymentSuccess;
