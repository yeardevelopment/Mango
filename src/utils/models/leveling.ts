import { Schema, model } from 'mongoose';

export default model(
  'leveling',
  new Schema({
    Guild: { type: String },
    Toggled: { type: Boolean },
  })
);
