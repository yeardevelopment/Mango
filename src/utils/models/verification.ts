import { Schema, model } from 'mongoose';

export default model(
  'verification',
  new Schema({
    Guild: String,
    Toggled: Boolean,
    Role: String,
    Age: Number,
  })
);
