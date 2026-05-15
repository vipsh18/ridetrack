import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Driver from '../models/Driver';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, vehicleNumber } = req.body;

    if (!name || !email || !password || !vehicleNumber) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existing = await Driver.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const driver = await Driver.create({
      name,
      email,
      password: hashed,
      vehicleNumber
    });

    res.status(201).json({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      vehicleNumber: driver.vehicleNumber,
      token: generateToken(driver._id.toString())
    });
  } catch (error) {
	console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const driver = await Driver.findOne({ email });
    if (!driver) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      vehicleNumber: driver.vehicleNumber,
      token: generateToken(driver._id.toString())
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};