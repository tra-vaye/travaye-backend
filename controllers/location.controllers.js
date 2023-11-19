import dotenv from 'dotenv';
import { Location } from '../models/Location.model.js';

// This function works as an organizer for multiple images to avoid images having same name
dotenv.config();

const saveImagesWithModifiedName = async (files) => {
	const imageUrls = [];
	// console.log(files);
	try {
		files.map((file) => imageUrls.push(file.path));
	} catch (err) {
		console.error(err);
		throw new Error(`Error uploading images: ${err.message}`);
	}
	return imageUrls;
};

export const createLocation = async (req, res) => {
	const {
		locationName,
		locationAddress,
		locationRating,
		locationContact,
		locationDescription,
		locationCategory,
		locationCity,
		locationAddedBy,
		locationSubCategory,
	} = req.body;

	const existingLocation = await Location.findOne({
		locationName: locationName,
	}).then((err, location) => {
		if (err) {
			console.error(err.message);
			return err;
		} else if (location) {
			return location;
		}
	});

	try {
		const files = req.files;

		if (!files || files.length === 0) {
			throw new Error('No files uploaded!');
		}
		const images = req.files;

		if (existingLocation) {
			console.log(existingLocation);
			return res.status(400).json({ message: 'Location already exist.' });
		} else {
			if (!existingLocation) {
				const newLocation = new Location({
					locationName: locationName,
					locationAddress: locationAddress,
					locationContact: locationContact,
					locationDescription: locationDescription,
					locationRating: locationRating,
					locationImagePath: await saveImagesWithModifiedName(images),
					locationCategory: locationCategory.toLowerCase().replace(/\s+/g, '-'),
					locationSubCategory: locationSubCategory
						.toLowerCase()
						.replace(/\s+/g, '-'),
					locationAddedBy: locationAddedBy,
					locationCity,
				});
				const savedLocation = await newLocation.save();
				return res.status(200).json(savedLocation);
			}
		}
	} catch (error) {
		console.log(error.message);
		return res.status(400).json({ error: 'Failed to add location' });
	}
};

// export const getAllLocations = async (req, res) => {
//   let { page, count } = req.query;

//   page = parseInt(page) || 1;
//   count = parseInt(count) || 10;

//   try {
//     const locations = await Location.find()
//       .limit(count)
//       .skip((page - 1) * count);

//     const meta = {
//       prev: page > 1 ? page - 1 : null,
//       next: locations.length < count ? null : page + 1,
//       from: (page - 1) * count + 1,
//       to: (page - 1) * count + locations.length,
//       page,
//       count,
//       total: await Location.countDocuments(),
//     };
//     return res.status(200).json({ data: locations, meta });
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// };
export const getAllLocations = async (req, res) => {
	const { page = 1, count = 10, filters, location } = req.query;
	try {
		const query = {};

		// Using split() method allows to send multiple filters and location in one  query parameter
		// The Frontend guys should join() the array with "," to make it a comma seperated string
		// Using regex for case insensitve (whether capitalized or not returns a match if the string of the filter entails same characters)

		if (filters && filters.toLowerCase() !== 'all') {
			query.locationCategory = {
				$in: filters
					.split(',')
					.map((category) => new RegExp(category.trim(), 'i')),
			};
		}

		if (location) {
			query.locationCity = {
				$in: location.split(',').map((loc) => new RegExp(loc.trim(), 'i')),
			};
		}

		const totalLocations = await Location.countDocuments(query);
		const locations = await Location.find(query)
			.limit(Number(count))
			.skip((Number(page) - 1) * Number(count));

		const meta = {
			prev: page > 1 ? page - 1 : null,
			next: locations.length < count ? null : Number(page) + 1,
			from: (Number(page) - 1) * Number(count) + 1,
			to: (Number(page) - 1) * Number(count) + locations.length,
			page: Number(page),
			count: Number(count),
			total: totalLocations,
		};

		return res.status(200).json({ data: locations, meta });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

export const getLocationById = async (req, res) => {
	const { id } = req.params;

	try {
		const location = await Location.findById(id);
		return res.status(200).json(location);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

export const planTrip = async (req, res) => {
	const {
		city,
		state,
		lga,
		category,
		budget,
		page = 1,
		count = 10,
	} = req.query;

	try {
		// let { city, state, lga } = address ? address : {};

		let query = Location.find();

		if (city) {
			query.or([{ locationCity: { $regex: new RegExp(city, 'i') } }]);
		}

		if (state) {
			query.or([{ locationCity: { $regex: new RegExp(state, 'i') } }]);
		}

		if (lga) {
			query.or([{ locationAddress: { $regex: new RegExp(lga, 'i') } }]);
		}

		if (category) {
			query.or([{ locationCategory: category }]);
		}

		const locations = await query
			.skip((page - 1) * count)
			.limit(count)
			.exec();

		const meta = {
			prev: page > 1 ? page - 1 : null,
			next: locations.length < count ? null : page + 1,
			from: (page - 1) * count + 1,
			to: (page - 1) * count + locations.length,
			page,
			count,
			total: await Location.countDocuments(),
		};

		return res.status(200).json({ data: locations, meta });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ error: err.message });
	}
};
