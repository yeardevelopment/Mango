// Mango Bot - multifunctional Discord application service.
// Copyright (C) 2024  YEAR Development

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

import { Schema, model } from 'mongoose';

export default model(
  'tickets',
  new Schema({
    ID: String,
    ClaimedBy: String,
    Member: String,
    Guild: String,
    OpenReason: String,
    Members: [String],
    Closed: Boolean,
    Claimed: Boolean,
    Locked: Boolean,
  })
);
