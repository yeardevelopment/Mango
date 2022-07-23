import { Schema, model } from 'mongoose';

export default model(
  'premium-guilds',
  new Schema({
    Guild: String,
    Expire: Number,
  })
);
