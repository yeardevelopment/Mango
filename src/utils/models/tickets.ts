import { Schema, model } from 'mongoose';

export default model(
  'tickets',
  new Schema({
    ID: String,
    ClaimedBy: String,
    Member: String,
    Guild: String,
    Members: [String],
    Closed: Boolean,
    Claimed: Boolean,
    Locked: Boolean,
  })
);
