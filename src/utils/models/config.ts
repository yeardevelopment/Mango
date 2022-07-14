import { Schema, model } from 'mongoose';

export default model(
  'config',
  new Schema({
    Guild: String,
    WelcomeChannel: String,
    MessageLogsChannel: String,
    ModerationLogsChannel: String,
    TicketLogsChannel: String,
    TicketsCategory: String,
    MuteRole: String,
    StaffRole: String,
    CaseCount: {
      default: 0,
      type: String,
    },
  })
);
