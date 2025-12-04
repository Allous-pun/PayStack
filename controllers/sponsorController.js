const Sponsor = require('../models/Sponsor');

// Create new sponsor
const createSponsor = async (req, res) => {
    try {
        const { name, contactPerson, phone, notes } = req.body;

        // Validate input - NO EMAIL
        if (!name || !contactPerson || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, contact person, and phone are required'
            });
        }

        // Check if sponsor already exists by phone only
        const existingSponsor = await Sponsor.findOne({ phone });

        if (existingSponsor) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor with this phone number already exists'
            });
        }

        // Create sponsor WITHOUT EMAIL
        const sponsor = new Sponsor({
            name,
            contactPerson,
            phone,
            notes
        });

        await sponsor.save();

        res.status(201).json({
            success: true,
            message: 'Sponsor created successfully',
            data: sponsor
        });

    } catch (error) {
        console.error('Create sponsor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create sponsor',
            error: error.message
        });
    }
};

// Get all sponsors
const getSponsors = async (req, res) => {
    try {
        const { phone } = req.query;
        let query = {};
        
        if (phone) {
            // Handle URL encoding of plus signs
            let searchPhone = phone;
            if (phone.startsWith(' ')) {
                // If the plus was converted to space by URL parsing
                searchPhone = '+' + phone.substring(1);
            }
            query.phone = searchPhone;
        }
        
        const sponsors = await Sponsor.find(query).sort({ registrationDate: -1 });
        
        res.json({
            success: true,
            count: sponsors.length,
            data: sponsors
        });
    } catch (error) {
        console.error('Get sponsors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sponsors'
        });
    }
};

// Get single sponsor
const getSponsor = async (req, res) => {
    try {
        const sponsor = await Sponsor.findById(req.params.id);

        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
        }

        res.json({
            success: true,
            data: sponsor
        });
    } catch (error) {
        console.error('Get sponsor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sponsor'
        });
    }
};

// Update sponsor
const updateSponsor = async (req, res) => {
    try {
        const sponsor = await Sponsor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor not found'
            });
        }

        res.json({
            success: true,
            message: 'Sponsor updated successfully',
            data: sponsor
        });
    } catch (error) {
        console.error('Update sponsor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update sponsor',
            error: error.message
        });
    }
};

module.exports = {
    createSponsor,
    getSponsors,
    getSponsor,
    updateSponsor
};