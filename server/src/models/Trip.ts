import mongoose, { Document, Schema } from 'mongoose';

export type TripStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface ITrip extends Document {
  driver: mongoose.Types.ObjectId;
  passengerName: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
  };
  status: TripStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    passengerName: { type: String, required: true, trim: true },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    dropoff: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending'
    },
    startedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>('Trip', TripSchema);