import * as mongoose from 'mongoose';

interface Guild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

export interface Session {
  nonce: string;
  accessToken: string;
  guilds: Guild[];
}

const sessionSchema = new mongoose.Schema({
  accessToken: String,
  nonce: String,
  guilds: Array,
  expires_at: {
    type: Date,
    default: function () {
      return Date.now() + 1000 * 60 * 60 * 2;
    },
    expires: 7200,
  },
});

export const Session =
  mongoose.models.Sessions || mongoose.model<Session>('Sessions', sessionSchema);
