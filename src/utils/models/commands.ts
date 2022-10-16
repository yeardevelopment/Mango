import { Schema, model } from 'mongoose';

export default model(
  'commands-data',
  new Schema({
    User: String,
    Guild: String,
    Interaction: String,
    Command: String,
    Parameters: Array,
    Success: Boolean,
    Error: String,
    Timestamp: { type: Number, default: Date.now() },
  })
);
