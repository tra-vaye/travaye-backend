import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.js';
import sendVerifyEmail from '../services/index.service.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { sendEmail } from '../services/mail/mail.service.js';
import { render } from 'pug';
import { dirname } from '../lib/index.js';
import { readFileSync } from 'fs';

export const registerUser = async (req, res, next) => {
	const username = req.body?.username;
	const email = req.body?.email;
	const password = req.body?.password;
	const fullName = req.body?.fullName;

	// Encryption
	const salt = await bcrypt.genSalt(13);
	const hashedPassword = await bcrypt.hash(password, salt);
	// Random Four digit code
	// Generates a random 4-digit code
	let verificationCode = Math.floor(Math.random() * 9000) + 1000;
	User.register(
		{
			username: username,
			email: email,
			fullName: fullName,
			password: hashedPassword,
			verificationCode: verificationCode,
		},
		password,
		async function (err, user) {
			if (err) {
				console.log(err);
				return res.status(400).json({
					error: 'A User with the given username or email exists',
				});
			}
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
				expiresIn: '1d',
			});
			req.headers.authorization = `Bearer ${token}`;

			try {
				const mail = render(
					readFileSync(
						path.resolve(dirname(import.meta.url), "../views/email/verification-code.pug")
					),
					{
						code: verificationCode,
						filename: 'verification-code'
					}
				);
	
				await sendEmail(email, mail, 'E-mail Verification');
			} catch (error) {
				console.error(error)
			}
			return next();
		}
	);
};

export const loginUser = async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	const user = await User.findOne({ username: username });

	if (!user) {
		return res.status(400).json({
			error: 'Invalid username or password',
		});
	}

	const check = await bcrypt.compare(password, user.password);
	if (!check) {
		return res.status(400).json({
			error: 'Invalid username or password',
		});
	}

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: '1d',
	});
	user.password = undefined;
	user.verificationCode = undefined;
	return res.status(200).json({ token, user });
};
// Logout
export const logUserOut = (req, res) => {
	req.logOut();
	res.redirect('/login');
};
// Verify
export const verifyUser = async (req, res) => {
	const verificationCode = req.body?.code;

	const user = req.user;
	const isMatch = +verificationCode === user.verificationCode;
	if (!isMatch) {
		return res.status(400).json({ error: 'Invalid Code' });
	}
	// const verifiedUser = await User.findByIdAndUpdate(
	//   { _id: _id },
	//   { verified: true },
	//   { new: true }
	// );
	user.emailVerified = true;
	await user.save();
	res.status(200).json({ user });
};

export const getUser = async (req, res) => {
	const user = req.user;
	user.password = undefined;
	user.verificationCode = undefined;
	return res.status(200).json({ user });
};

/**
 *
 * @param {Express.Request} req
 * @param {*} res
 */
export const updateProfilePhoto = async (req, res) => {
	const file = req.file;
	const user = req.user;

	if (!file)
		return res.status(400).json({ message: 'Please submit a picture' });

	if (['.jpg', '.png', '.jpeg'].includes(path.extname(file.originalname))) {
		user.profilePhoto = file.path;
		await user.save();

		return res.json({ message: 'Upload successful' });
	}

	return res.status(400).json({ message: 'Invalid file type.' });
};

export const resendVerification = async (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	if (req.user.emailVerified) {
		return res.status(403).json({ message: 'Already verified' });
	}

	await sendVerifyEmail(req.user.email, req.user.verificationCode);
	return res.status(200).json({ message: 'Successful' });
};
