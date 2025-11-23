const Sponsor = require('../models/Sponsor');

// Create new sponsor
const createSponsor = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, notes } = req.body;

        // Validate input
        if (!name || !contactPerson || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, contact person, email, and phone are required'
            });
        }

        // Check if sponsor already exists
        const existingSponsor = await Sponsor.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (existingSponsor) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor with this email or phone already exists'
            });
        }

        // Create sponsor
        const sponsor = new Sponsor({
            name,
            contactPerson,
            email,
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
        const sponsors = await Sponsor.find().sort({ registrationDate: -1 });
        
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