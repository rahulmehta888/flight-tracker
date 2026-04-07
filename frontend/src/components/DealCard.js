import React from 'react';
import { format } from 'date-fns';
import { FaPlane, FaClock, FaSuitcase } from 'react-icons/fa';
import { dealsAPI } from '../services/api';

const DealCard = ({ deal, onClick }) => {
  const { flight } = deal;

  const handleBookClick = async (e) => {
    e.stopPropagation();
    try {
      await dealsAPI.trackClick(deal._id);
      window.open(flight.bookingUrl, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
      window.open(flight.bookingUrl, '_blank');
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'exceptional':
        return '#ff6b6b';
      case 'excellent':
        return '#ff8c42';
      case 'good':
      default:
        return '#28a745';
    }
  };

  return (
    <div className="deal-card" onClick={onClick}>
      <div className="deal-header">
        <div
          className="deal-badge"
          style={{ backgroundColor: getQualityColor(deal.quality) }}
        >
          {deal.discountPercentage.toFixed(0)}% OFF
        </div>
        <div className="deal-route">
          {flight.originCity} <FaPlane /> {flight.destinationCity}
        </div>
        <p>{deal.dealType === 'mistake_fare' && '🔥 Mistake Fare!'}</p>
      </div>

      <div className="deal-body">
        <div className="deal-details">
          <div className="detail-item">
            <span><strong>Departure:</strong></span>
            <span>{format(new Date(flight.departureDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="detail-item">
            <span><strong>Airline:</strong></span>
            <span>{flight.airline}</span>
          </div>
          <div className="detail-item">
            <span><strong>Stops:</strong></span>
            <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
          </div>
          <div className="detail-item">
            <span><strong>Class:</strong></span>
            <span>{flight.cabinClass.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', justifyContent: 'center' }}>
          {flight.checkedBaggage && (
            <span style={{ color: '#28a745' }}>
              <FaSuitcase /> Baggage Included
            </span>
          )}
          {flight.duration && (
            <span style={{ color: '#6c757d' }}>
              <FaClock /> {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
            </span>
          )}
        </div>

        <div className="price-section">
          <div className="old-price">₹{deal.originalPrice.toLocaleString('en-IN')}</div>
          <div className="new-price">₹{deal.dealPrice.toLocaleString('en-IN')}</div>
          <div className="savings">Save ₹{deal.savings.toLocaleString('en-IN')}</div>
        </div>

        <button onClick={handleBookClick} className="btn btn-primary" style={{ width: '100%' }}>
          Book on Google Flights
        </button>

        {deal.membershipRequired === 'premium' && (
          <p style={{ marginTop: '1rem', textAlign: 'center', color: '#ffc107', fontWeight: 'bold' }}>
            ⭐ Premium Deal
          </p>
        )}
      </div>
    </div>
  );
};

export default DealCard;
