import React, { useState, useEffect } from 'react';
import { dealsAPI } from '../services/api';
import DealCard from '../components/DealCard';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    minDiscount: '',
    dealType: '',
  });

  useEffect(() => {
    fetchDeals();
    fetchStats();
  }, []);

  const fetchDeals = async (filterParams = {}) => {
    try {
      setLoading(true);
      const response = await dealsAPI.getDeals({ ...filters, ...filterParams });
      setDeals(response.data.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dealsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchDeals();
  };

  const resetFilters = () => {
    setFilters({
      origin: '',
      destination: '',
      minDiscount: '',
      dealType: '',
    });
    fetchDeals({});
  };

  const indianAirports = [
    { code: 'DEL', name: 'Delhi' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'BLR', name: 'Bengaluru' },
    { code: 'HYD', name: 'Hyderabad' },
    { code: 'MAA', name: 'Chennai' },
    { code: 'COK', name: 'Kochi' },
    { code: 'CCU', name: 'Kolkata' },
  ];

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>
        🔥 Hot Flight Deals
      </h1>

      {/* Stats Section */}
      {stats && stats.overview && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-label">Active Deals</div>
            <div className="stat-value">{stats.overview.totalDeals || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Savings</div>
            <div className="stat-value">
              {stats.overview.avgDiscount ? `${stats.overview.avgDiscount.toFixed(0)}%` : 'N/A'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Best Deal</div>
            <div className="stat-value">
              {stats.overview.maxDiscount ? `${stats.overview.maxDiscount.toFixed(0)}%` : 'N/A'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Savings</div>
            <div className="stat-value">
              ₹{stats.overview.totalSavings ? (stats.overview.totalSavings / 1000).toFixed(0) + 'K' : '0'}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <h3 style={{ marginBottom: '1rem' }}>Filter Deals</h3>
        <div className="filters-row">
          <div className="form-group">
            <label className="form-label">Origin</label>
            <select
              name="origin"
              value={filters.origin}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Origins</option>
              {indianAirports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.name} ({airport.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Discount</label>
            <select
              name="minDiscount"
              value={filters.minDiscount}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">Any Discount</option>
              <option value="40">40%+</option>
              <option value="50">50%+</option>
              <option value="60">60%+</option>
              <option value="70">70%+</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Deal Type</label>
            <select
              name="dealType"
              value={filters.dealType}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="mistake_fare">Mistake Fare</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : deals.length > 0 ? (
        <div className="deals-grid">
          {deals.map((deal) => (
            <DealCard key={deal._id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>No deals found</h2>
          <p>Try adjusting your filters or check back later for new deals!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
