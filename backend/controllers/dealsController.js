const Deal = require('../models/Deal');
const Flight = require('../models/Flight');

// @desc    Get all active deals
// @route   GET /api/deals
// @access  Private
exports.getDeals = async (req, res) => {
  try {
    const {
      origin,
      destination,
      minDiscount,
      dealType,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    // Build query based on filters
    if (minDiscount) {
      query.discountPercentage = { $gte: parseInt(minDiscount) };
    }

    if (dealType) {
      query.dealType = dealType;
    }

    // Check membership tier for premium deals
    if (req.user.membershipTier === 'free') {
      query.membershipRequired = 'free';
    }

    const deals = await Deal.find(query)
      .populate({
        path: 'flight',
        match: origin || destination ? {
          ...(origin && { origin }),
          ...(destination && { destination }),
        } : {},
      })
      .sort({ discountPercentage: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out deals where flight didn't match the populate filter
    const filteredDeals = deals.filter(deal => deal.flight);

    const count = await Deal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredDeals.length,
      total: count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      data: filteredDeals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Private
exports.getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).populate('flight');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    // Check if user has access to this deal
    if (deal.membershipRequired === 'premium' && req.user.membershipTier === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Premium membership required to access this deal',
      });
    }

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Track deal click
// @route   POST /api/deals/:id/click
// @access  Private
exports.trackClick = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get deal statistics
// @route   GET /api/deals/stats
// @access  Private
exports.getDealStats = async (req, res) => {
  try {
    const stats = await Deal.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          avgDiscount: { $avg: '$discountPercentage' },
          totalSavings: { $sum: '$savings' },
          maxDiscount: { $max: '$discountPercentage' },
        }
      }
    ]);

    const dealsByType = await Deal.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$dealType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        byType: dealsByType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
