import { Schema, model } from 'mongoose';

export default model(
  'verification',
  new Schema({
    Guild: String,
    Toggled: { type: Boolean, default: false },
    Role: String,
    Age: Number,
  })
);
