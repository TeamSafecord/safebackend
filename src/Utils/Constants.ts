/* eslint-disable */

export const URL = `https://discord.com/api/oauth2/authorize?client_id=908904270978494514&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI as string)}&response_type=code&scope=identify`;