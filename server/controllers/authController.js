import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Public registration: always creates a citizen account.
// Role is not accepted from the client to prevent privilege escalation.
export const registerValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
];

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, fullName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ email, password, fullName, role: 'citizen' });
    const token = signToken(user);
    const profile = { id: user._id, email: user.email, fullName: user.fullName, role: user.role };
    res.status(201).json({ token, user: profile });
  } catch (err) {
    next(err);
  }
}

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    const profile = { id: user._id, email: user.email, fullName: user.fullName, role: user.role };
    res.json({ token, user: profile });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  const profile = {
    id: req.user._id,
    email: req.user.email,
    fullName: req.user.fullName,
    role: req.user.role,
  };
  res.json(profile);
}

// Super-admin-only: create official accounts (not exposed on public registration).
export const createOfficialValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
];

export async function createOfficial(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, fullName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ email, password, fullName, role: 'official' });
    const profile = { id: user._id, email: user.email, fullName: user.fullName, role: user.role };
    res.status(201).json({ user: profile });
  } catch (err) {
    next(err);
  }
}
