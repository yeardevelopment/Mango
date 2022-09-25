import { Schema, model } from 'mongoose';

export default model(
  'reporting',
  new Schema({
    Guild: String,
    Toggled: { type: Boolean, default: false },
    Channel: String,
  })
);
