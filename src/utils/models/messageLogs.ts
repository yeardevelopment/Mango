import { Schema, model } from 'mongoose';

export default model(
  'message-logs',
  new Schema({
    Guild: String,
    Channel: String,
  })
);
