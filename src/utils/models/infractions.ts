import { Schema, model } from 'mongoose';

export default model(
  'infractions',
  new Schema({
    Guild: String,
    User: String,
    WarnData: Array,
    MuteData: Array,
    BanData: Array,
    KickData: Array,
    ReportData: Array,
    MuteRemovalData: Array,
    WarnRemovalData: Array,
    BanRemovalData: Array,
  })
);
