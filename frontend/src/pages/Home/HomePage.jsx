import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import heroBackground from '../../assets/banner.jpg';
import './HomePage.css';

// Add this features array before the HomePage component
const features = [
    {
        icon: <FaCalendarAlt size={30} color="#e63946" />,
        title: "Easy Booking",
        description: "Book your perfect venue in just a few clicks"
    },
    {
        icon: <FaMapMarkerAlt size={30} color="#e63946" />,
        title: "Prime Locations",
        description: "Find venues in the most sought-after locations"
    },

    {
        icon: <FaSearch size={30} color="#e63946" />,
        title: "Smart Search",
        description: "Find exactly what you need with our filters"
    }
];

const HomePage = () => {
    const [venues, setVenues] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/venue/");
                setVenues(response.data);
            } catch (err) {
                console.error("Error fetching venues:", err);
            }
        };
        fetchVenues();
    }, []);

    const handleVenueClick = (venueId) => {
        const isAuthenticated = localStorage.getItem('access');
        
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { 
                    message: 'Please sign in first to view venue details.' 
                } 
            });
        } else {
            navigate(`/venue-details/${venueId}`);
        }
    }; 

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="homepage-container">
            {/* Navigation Bar */}
            <nav className="main-nav">
                <div className="nav-logo">
                    <img src={heroBackground} alt="Logo" className="logo-image" />
                    <span className="logo-text">EventSpace</span>
                </div>
                
                <div className="nav-links">
                    <Link to="/venues">Venues</Link>
                    <Link to="/blogs">Blogs</Link>
                    <Link to="/about">About Us</Link>
                </div>
                
                <div className="nav-buttons">
                    <Link to="/login" className="signin-btn">
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section with Search */}
            <div className="hero-section">
                <div className="hero-image" style={{ backgroundImage: `url(${heroBackground})` }}></div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content"
                >
                    <h1>Find Your Perfect Venue</h1>
                    <p>Discover perfect spaces for your perfect moments</p>
                </motion.div>

                {/* Moved Search Section inside hero-section */}
                <motion.div 
                    className="search-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="search-bar">
                        <div className="search-input-group">
                            <FaMapMarkerAlt className="search-icon" />
                            <input type="text" placeholder="Where to?" />
                        </div>
                        <div className="search-input-group">
                            <FaCalendarAlt className="search-icon" />
                            <input type="text" placeholder="Event Type" />
                        </div>
                        <div className="search-input-group">
                            <FaUsers className="search-icon" />
                            <input type="number" placeholder="Number of Guests" />
                        </div>
                        <button className="search-button">
                            <FaSearch /> Find Venues
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Enhanced Venue Cards Section */}
            <section className="venue-list">
                <h2 className="section-title">Popular Venues</h2>
                <div className="venue-grid">
                    {venues.slice(0, 3).map((venue) => (
                        <motion.div
                            key={venue.venueid}
                            className="venue-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleVenueClick(venue.venueid)}
                        >
                            <div className="image-container">
                                <img
                                    src={venue.imageurl?.[0] || heroBackground}
                                    alt={venue.venuename}
                                    className="venue-image"
                                />
                                <div className="price-badge">
                                    From Rs.{venue.starting_price}
                                </div>
                            </div>

                            <div className="venue-content">
                                <div className="text-container">
                                    <h3 className="venue-title">{venue.venuename}</h3>
                                    <p className="venue-address">
                                        <FaMapMarkerAlt /> {venue.venueaddress}
                                    </p>
                                </div>
                                <div className="button-container">
                                    <button className="book-now-btn">
                                        Book Now <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Add Features Section */}
            <section className="features-section">
                <motion.div 
                    className="features-container"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2>Why Choose EventSpace</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div 
                                className="feature-card"
                                key={index}
                                whileHover={{ scale: 1.05 }}
                            >
                                {feature.icon}
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;