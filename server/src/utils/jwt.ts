import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateToken = (driverId: string): string => {
	return jwt.sign({ id: driverId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { id: string } => {
	return jwt.verify(token, JWT_SECRET) as { id: string };
};