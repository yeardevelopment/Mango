import { Schema, model } from 'mongoose';

export default model(
  'buttons-data',
  new Schema({
    User: String,
    Guild: String,
    Interaction: String,
    Button: String,
    Success: Boolean,
    Error: String,
    Timestamp: { type: Number, default: Date.now() },
  })
);
