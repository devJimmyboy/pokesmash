// Passport Strategy for Twitch

import OAuth2, { InternalOAuthError, Strategy as OAuth2Strategy, StrategyOptions } from 'passport-oauth2';
import { } from "passport"

namespace TwitchStrategy {
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[] | string;
  }
  export type VerifyFunction = OAuth2.VerifyFunction

  export interface UserProfile {
    id: string;
    login: string;
    displayName: string;
    description: string;
    broadcasterType: string;
    profileImageUrl: string;
    offlineImageUrl: string;
    viewCount: number;
    email?: string;
    createdAt: string;
    type: string;
    _raw?: {
      broadcaster_type: string;
      description: string;
      email: string;
      id: string;
      login: string;
      display_name: string;
      created_at: string;
      offline_image_url: string;
      profile_image_url: string;
      type: string;
      view_count: number;
    }
  }
}

export class TwitchStrategy extends OAuth2Strategy {

  constructor(options: TwitchStrategy.StrategyOptions, verify: TwitchStrategy.VerifyFunction) {
    const oauthOpts: StrategyOptions = { ...options, authorizationURL: 'https://id.twitch.tv/oauth2/authorize', tokenURL: 'https://id.twitch.tv/oauth2/token' }
    super(oauthOpts, verify);
    this.name = 'twitch';
    // Twitch has some non-standard requirements that we need to adjust
    this._oauth2.setAuthMethod('OAuth');
    this._oauth2.useAuthorizationHeaderforGET(true);
  }
  userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): void {
    this._oauth2.get('https://api.twitch.tv/helix/users', accessToken, function (err, body, res) {
      if (!body || err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

      try {
        var json = JSON.parse(body as string);

        var profile: TwitchStrategy.UserProfile = {
          id: json.data[0].id,
          login: json.data[0].login,
          displayName: json.data[0].display_name,
          description: json.data[0].description,
          broadcasterType: json.data[0].broadcaster_type,
          profileImageUrl: json.data[0].profile_image_url,
          offlineImageUrl: json.data[0].offline_image_url,
          viewCount: json.data[0].view_count,
          createdAt: json.data[0].created_at,
          type: json.data[0].type,
          email: json.data[0].email,
          _raw: json.data[0]
        };

        done(null, profile);
      } catch (e: any) {
        done(e);
      }
    });
  }
  authorizationParams(options: any) {
    var params: { force_verify?: boolean } = {};
    if (typeof options.forceVerify !== "undefined") {
      params.force_verify = !!options.forceVerify;
    }
    return params;

  }
}