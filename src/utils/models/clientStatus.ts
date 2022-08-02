import { Schema, model } from 'mongoose';

export default model(
  'clientDB',
  new Schema({
    Client: Boolean,
    Memory: Array,
  })
);
