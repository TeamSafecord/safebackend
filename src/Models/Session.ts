import * as mongoose from 'mongoose';

interface Guild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

interface Session {
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
    default: Date.now,
    expires: 7200,
  },
});

export default mongoose.models.Sessions || mongoose.model<Session>('Sessions', sessionSchema);
