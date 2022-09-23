import { Schema, model } from 'mongoose';

export default model(
  'errors',
  new Schema({
    Timestamp: { type: Number, default: Date.now() },
    Error: String,
    User: String,
  })
);
