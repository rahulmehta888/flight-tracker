import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaPlane, FaClock, FaSuitcase, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { dealsAPI } from '../services/api';

const EnhancedDealCard = ({ deal, onClick }) => {
  const { flight, aiScore, priceContext, trueCost } = deal;
  const [showTrueCost, setShowTrueCost] = useState(false);

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

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#6b7280';
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'exceptional':
        return '#ef4444';
      case 'excellent':
        return '#f59e0b';
      case 'good':
      default:
        return '#10b981';
    }
  };

  return (
    <div className="deal-card enhanced-deal-card" onClick={onClick}>
      {/* Header with gradient */}
      <div className="deal-header">
        {/* AI Score Badge - Top Right */}
        <div
          className="ai-score-badge"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'white',
            color: getScoreColor(aiScore.total),
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 2
          }}
        >
          <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{aiScore.total}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>/100</div>
        </div>

        {/* Discount Badge - Top Left */}
        <div
          className="deal-badge"
          style={{ backgroundColor: getQualityColor(deal.quality) }}
        >
          {deal.discountPercentage.toFixed(0)}% OFF
        </div>

        {/* Route */}
        <div className="deal-route" style={{ paddingRight: '100px' }}>
          {flight.originCity} <FaPlane /> {flight.destinationCity}
        </div>

        {/* Rating Label */}
        <div style={{
          fontSize: '0.95rem',
          opacity: 0.95,
          marginTop: '0.25rem'
        }}>
          {aiScore.rating} Deal
        </div>
      </div>

      <div className="deal-body">
        {/* Quality Badges */}
        {aiScore.badges && aiScore.badges.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            {aiScore.badges.map((badge, idx) => (
              <span
                key={idx}
                style={{
                  background: badge.color,
                  color: 'white',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* Price Context */}
        <div style={{
          background: '#f0fdf4',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #86efac'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#15803d',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaChartLine />
            {priceContext.context}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.25rem' }}>
            Usually ₹{priceContext.avgPrice.toLocaleString('en-IN')} • {priceContext.percentBelow}% below average
          </div>
        </div>

        {/* Flight Details */}
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

        {/* Perks */}
        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0', justifyContent: 'center' }}>
          {flight.checkedBaggage && (
            <span style={{ color: '#10b981', fontSize: '0.9rem' }}>
              <FaSuitcase /> Baggage Included
            </span>
          )}
          {flight.duration && (
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              <FaClock /> {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
            </span>
          )}
        </div>

        {/* Price Section with True Cost Toggle */}
        <div className="price-section">
          {!showTrueCost ? (
            <>
              <div className="old-price">₹{deal.originalPrice.toLocaleString('en-IN')}</div>
              <div className="new-price">₹{deal.dealPrice.toLocaleString('en-IN')}</div>
              <div className="savings">Save ₹{deal.savings.toLocaleString('en-IN')}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTrueCost(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  margin: '0.5rem auto 0'
                }}
              >
                <FaInfoCircle /> See true cost
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                True Cost Calculator
              </div>
              <div style={{
                background: '#fef3c7',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '0.75rem'
              }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Advertised:</strong> ₹{trueCost.advertisedPrice.toLocaleString('en-IN')}
                </div>
                {trueCost.potentialAddons.map((addon, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: '#92400e' }}>
                    + {addon.item}: ₹{addon.cost.toLocaleString('en-IN')}
                  </div>
                ))}
                <div style={{
                  borderTop: '1px solid #fbbf24',
                  marginTop: '0.5rem',
                  paddingTop: '0.5rem',
                  fontWeight: 'bold',
                  color: '#b45309'
                }}>
                  Likely Total: ₹{trueCost.trueCost.toLocaleString('en-IN')} - ₹{trueCost.maxCost.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTrueCost(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Show advertised price
              </button>
            </>
          )}
        </div>

        {/* AI Explanation */}
        <div style={{
          fontSize: '0.85rem',
          color: '#6b7280',
          textAlign: 'center',
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          💡 {aiScore.explanation}
        </div>

        {/* Book Button */}
        <button onClick={handleBookClick} className="btn btn-primary" style={{ width: '100%' }}>
          Book on Google Flights
        </button>
      </div>
    </div>
  );
};

export default EnhancedDealCard;
