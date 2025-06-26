import crypto from 'node:crypto';

export default {
  generate2FaCode() {
    let min = 0;
    let max = 999999;
    let n = Math.round(Math.random() * (max - min) + min);
    // pad number out to 6 digits as string
    return String(n).padStart(6, '0');
  },
  getTokenFromAuthorizationHeader(hdr) {
    if (hdr && typeof(hdr) === 'string' && hdr.startsWith('Bearer')) {
      let sp = hdr.split('Bearer ');
      if (sp.length === 2) {
        return sp[1];
      }
    }

    if (hdr && typeof(hdr) === 'string' && hdr.startsWith('ApiKey')) {
      let sp = hdr.split('ApiKey ');
      if (sp.length === 2) {
        return sp[1];
      }
    }
    return null;
  },
  //
  // parse the JWT payload and return as an Object
  //
  parseTokenPayload(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  },
  //
  // parse the JWT payload and return only the username ('aud') part
  //
  getUserFromTokenString(token) {
    return this.getUserFromTokenObject(this.parseTokenPayload(token));
  },
  //
  // parse the JWT payload and return only the _id ('sub') part
  //
  getUserIdFromTokenString(token) {
    return this.getUserIdFromTokenObject(this.parseTokenPayload(token));
  },
  //
  // Return the username field of the given token object
  //
  getUserFromTokenObject(tokenObj) {
    return tokenObj.aud;
  },
  //
  // Return the user _id field of the given token object
  //
  getUserIdFromTokenObject(tokenObj) {
    return tokenObj.sub;
  },
  //
  // utility for creating a password hash using node.js crypto library
  //
  generatePasswordHash(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 32).toString("hex");
    return `${salt}${hash}`;
  },
}
