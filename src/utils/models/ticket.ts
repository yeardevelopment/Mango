import { Schema, model } from 'mongoose';

export default model(
  'ticket-system',
  new Schema({
    Guild: String,
    Toggled: Boolean,
  })
);
