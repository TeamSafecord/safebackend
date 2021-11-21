import mongoose from 'mongoose';

export interface Guild extends mongoose.Document {
  _id: string;
  verificationRole: string;
}

const guildSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  verificationRole: {
    type: String,
    required: true,
  },
  verificationMessageId: {
    type: String,
    required: true,
  },
  verificationEmbed: {
    title: String,
    description: String,
    footer: String,
    color: String,
  },
});

export const Guild = mongoose.model<Guild>('guilds', guildSchema);
