import { Schema, model } from 'mongoose';

export default model(
  'config',
  new Schema({
    Guild: String,
    WelcomeChannel: String,
    MessageLogsChannel: String,
    MuteRole: String,
  })
);
