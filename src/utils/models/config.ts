import { Schema, model } from 'mongoose';

export default model(
  'config',
  new Schema({
    Guild: String,
    CaseCount: {
      default: 0,
      type: Number,
    },
  })
);
