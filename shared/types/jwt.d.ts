
// format for JWT payload 
export interface RivJwtPayload {
  iss: string; // 'riv'
  sub: string; // used for user id
  aud: 'normal' | '2fa' | 'changePassword'; // user for token type 
  exp: number; // expiration timestamp
  nbf: number; // not before timestamp
  iat: number; // issued at timestamp
  jti: string; // random hex bytes
}