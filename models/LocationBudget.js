import mongoose from 'mongoose';

const { Schema } = mongoose;

const budgetSchema = new Schema(
	{
		min: Number,
		max: Number,
		label: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{
		timestamps: true,
	}
);

const LocationBudget = mongoose.model('Budget', budgetSchema);
export default LocationBudget;
