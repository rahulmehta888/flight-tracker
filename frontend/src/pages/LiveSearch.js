import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EnhancedDealCard from '../components/EnhancedDealCard';

const API_URL = process.env.REACT_APP_API_URL;

const LiveSearch = () => {
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: ''
  });
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);

  // Load airports on mount
  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      const response = await axios.get(`${API_URL}/search/airports`);
      setOrigins(response.data.data.origins);
      setDestinations(response.data.data.destinations);
    } catch (error) {
      console.error('Error loading airports:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!formData.origin || !formData.destination || !formData.departureDate || !formData.returnDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setSearching(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/search/live`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResult(response.data.data);
      toast.success('Search complete! 🎉');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed');
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  // Set default dates (4 weeks out, 7 day trip)
  useEffect(() => {
    const today = new Date();
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + 28);
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);

    setFormData(prev => ({
      ...prev,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0]
    }));
  }, []);

  return (
    <div className="container">
      <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✈️ Live Flight Search</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Search ANY route in real-time across Google Flights, Kayak & Skyscanner
          </p>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '1rem' }}>
            🌍 10 Indian cities → 100+ global destinations
          </div>
        </div>

        {/* Search Form */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Search Flights</h2>

          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

              {/* Origin */}
              <div className="form-group">
                <label className="form-label">From (Origin)</label>
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Origin</option>
                  {origins.map(city => (
                    <option key={city.code} value={city.code}>
                      {city.city} ({city.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div className="form-group">
                <label className="form-label">To (Destination)</label>
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Destination</option>
                  {destinations.map(dest => (
                    <option key={dest.code} value={dest.code}>
                      {dest.city}, {dest.country} ({dest.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Departure Date */}
              <div className="form-group">
                <label className="form-label">Departure</label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              {/* Return Date */}
              <div className="form-group">
                <label className="form-label">Return</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem' }}
              disabled={searching}
            >
              {searching ? '🔍 Searching across 3 sources...' : '🚀 Search Flights'}
            </button>
          </form>

          {/* Info */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#0369a1'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 How it works:</div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Searches Google Flights, Kayak, and Skyscanner simultaneously</li>
              <li>Finds the absolute cheapest price across all sources</li>
              <li>Shows price comparison and AI deal score</li>
              <li>Takes 10-30 seconds per search</li>
            </ul>
          </div>
        </div>

        {/* Loading */}
        {searching && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '16px',
            marginTop: '2rem'
          }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <div style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#667eea' }}>
              Searching for best prices...
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
              Checking Google Flights, Kayak & Skyscanner
            </div>
          </div>
        )}

        {/* Results */}
        {result && !searching && (
          <div style={{ marginTop: '2rem' }}>

            {/* Price Comparison */}
            <div className="card" style={{
              background: result.isDeal
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {result.origin} → {result.destination}
                  </div>
                  <div style={{ opacity: 0.95 }}>
                    {result.destinationCountry} • {result.departureDate} to {result.returnDate}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cheapest Price</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    ₹{result.cheapestPrice.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.95 }}>
                    via {result.cheapestSource}
                  </div>
                </div>
              </div>

              {result.isDeal && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    🔥 GREAT DEAL! {result.discountPercentage.toFixed(0)}% OFF
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    Save ₹{result.savings.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>

            {/* Price Comparison Table */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📊 Price Comparison</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {result.priceComparison.google && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: result.cheapestSource === 'Google Flights' ? '#f0fdf4' : '#f9fafb',
                    borderRadius: '8px',
                    border: result.cheapestSource === 'Google Flights' ? '2px solid #10b981' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: '600' }}>🌐 Google Flights</div>
                    <div style={{ fontWeight: 'bold', color: result.cheapestSource === 'Google Flights' ? '#10b981' : '#1f2937' }}>
                      ₹{result.priceComparison.google.toLocaleString('en-IN')}
                      {result.cheapestSource === 'Google Flights' && ' ✓ CHEAPEST'}
                    </div>
                  </div>
                )}
                {result.priceComparison.kayak && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: result.cheapestSource === 'Kayak' ? '#f0fdf4' : '#f9fafb',
                    borderRadius: '8px',
                    border: result.cheapestSource === 'Kayak' ? '2px solid #10b981' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: '600' }}>✈️ Kayak</div>
                    <div style={{ fontWeight: 'bold', color: result.cheapestSource === 'Kayak' ? '#10b981' : '#1f2937' }}>
                      ₹{result.priceComparison.kayak.toLocaleString('en-IN')}
                      {result.cheapestSource === 'Kayak' && ' ✓ CHEAPEST'}
                    </div>
                  </div>
                )}
                {result.priceComparison.skyscanner && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: result.cheapestSource === 'Skyscanner' ? '#f0fdf4' : '#f9fafb',
                    borderRadius: '8px',
                    border: result.cheapestSource === 'Skyscanner' ? '2px solid #10b981' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: '600' }}>🔍 Skyscanner</div>
                    <div style={{ fontWeight: 'bold', color: result.cheapestSource === 'Skyscanner' ? '#10b981' : '#1f2937' }}>
                      ₹{result.priceComparison.skyscanner.toLocaleString('en-IN')}
                      {result.cheapestSource === 'Skyscanner' && ' ✓ CHEAPEST'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={() => window.open(result.bookingUrl, '_blank')}
              className="btn btn-success"
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem' }}
            >
              🎯 Book This Flight
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LiveSearch;
