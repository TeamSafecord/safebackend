export interface IQuerystring {
  state: string;
  code: string;
}

export interface IAuthQuerystring {
  redirect: string;
}
export interface Guild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
}

export interface Details {
  [key: string]: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  redirect_uri: string;
  code: string;
}

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

export interface GuildId {
  gid: string;
}

export interface VerifiedBody {
  guild_id: string;
  user_id: string;
}

export interface GuildMember {
  guildId: string;
  joinedTimestamp: number;
  premiumSinceTimestamp: null;
  deleted: boolean;
  nickname: null;
  pending: boolean;
  userId: string;
  avatar: null;
  displayName: string;
  roles: string[];
  avatarURL: null;
  displayAvatarURL: string;
}

export interface SimpleGuild {
  avatar_url?: string;
  guild_id: string;
  name: string;
}

export interface VerifyResponse {
  member?: GuildMember;
  guild: SimpleGuild;
}
