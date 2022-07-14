import { Schema, model } from 'mongoose';

export default model(
  'tickets',
  new Schema({
    Category: String,
    ID: String,
    ClaimedBy: String,
    Member: String,
    Members: [String],
    Closed: Boolean,
    Claimed: Boolean,
    Locked: Boolean,
  })
);
