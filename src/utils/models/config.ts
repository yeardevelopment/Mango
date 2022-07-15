import { Schema, model } from 'mongoose';

export default model(
  'config',
  new Schema({
    Guild: String,
    MuteRole: String,
    StaffRole: String,
    CaseCount: {
      default: 0,
      type: String,
    },
  })
);
