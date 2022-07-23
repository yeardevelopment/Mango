import { Schema, model } from 'mongoose';

export default model(
  'ticket-system',
  new Schema({
    Guild: String,
    Toggled: { type: Boolean, default: false },
    StaffRole: String,
    LogsChannel: String,
    Category: String,
  })
);
