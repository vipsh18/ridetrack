import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  email: string;
  password: string;
  vehicleNumber: string;
  isActive: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  createdAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    vehicleNumber: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: false },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IDriver>('Driver', DriverSchema);