import { Schema, model } from 'mongoose';

export default model(
  'welcome-messages',
  new Schema({
    Guild: String,
    Text: String,
    Image: { type: Boolean, default: false },
    Toggled: { type: Boolean, default: false },
    Channel: String,
  })
);
