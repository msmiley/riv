import crypto from  'node:crypto';
import { get } from 'lodash-es';
import utils from './utils.js';

export default {
  name: 'Auth',
  props: {
    ldap: false,       // config prop for ldap auth
    ldapHost: '',      // ldap host
    jwtSecret: 'CHANGEME-CHANGEME', // secret used to generate the jwt
    apiKeys: [],       // array of apiKeys to allow API access by other apps, set this using config
    tokenMs: 86400000, // milliseconds for token valid duration
    tokenShortMs: 300000, // reduced time used for 2fa and pw change
    enable2fa: false,  // enable built-in 2fa token generation, riv generates the code, but transport to user will be up to dev
    authHook: null,    // set to string of method to enable additional checks, will be appended to 'this.$.' so for example set to 'MyModule.myAuthCheck', should return a promise
  },
  init() {
    if (this.enable2fa) {
      this.$log('two factor auth (2FA) enabled');
    }
    if (this.authHook) {
      this.$log(`using ${this.authHook} as authentication hook`);
    }
  },
  api: {
    // special API method for logging in, allowed to be called without the full req
    // object
    login(req, { username, password }) {
      this.$debug(`login attempt by ${username}`);
      // make sure body contains login
      if (username && password) {
        // call local method to authenticate
        return this.authenticateUser({ username, password }).then((result) => {
          // check if user must change password
          // if so, reply with object to enable change
          // (only for non-ldap)
          if (!this.ldap && result.mustChangePass) {
            return {
              username: result.username,
              mustChangePass: true,
              token: result.token, // should make this a special change pass token
              email: result.email,
            };
          }
          // 2fa
          if (this.enable2fa) {
            return {
              username: result.username,
              token: result.token,
              must2fa: true,
            };
          }
          // standard password login
          this.$.Activity.addEntry({
            source: this.name,
            event: 'login',
            eventValue: 'password',
            user_id: result._id,
            username: result.username,
          });
          return {
            username: result.username,
            token: result.token,
            email: result.email,
          };
        });
      } else {
        return Promise.reject('missing username and/or password: { "username": "<username>", "password": "<password>" }');
      }
    },
    changePassword(req, { username, password }) {
      this.$debug(`changePassword called by ${username}`);
      // make sure the requesting user is the authenticated user
      if (req.user.username === username) {
        let newHash = utils.generatePasswordHash(password);
        let st = Date.now();
        return this.$.Mongo.updateOne('rivUsers', req.user._id, {
          $set: {
            password: newHash,
            mustChangePass: false,
          }
        }).then(() => {
          // console.log('success updating doc', req)
          // add to activity log
          this.$.Activity.addEntry({
            source: this.name,
            event: 'changed password',
            req,
            elapsed: Date.now() - st,
          });
          // send successful login again
          return req.user.token;
        }).catch((err) => {
          this.$warn(`error changing password for ${username}`, err);
          return Promise.reject('Error updating user mongo doc');
        });
      } else {
        return Promise.reject('username invalid');
      }
    },
    checkTwoFa(req, { username, twoFactor }) {
      let user = this.$.Users.userByUsername(username);
      return this.$.Mongo.findOne('rivUsers', user._id).then((d) => {
        // TODO: make sure OTP hasn't expired
        if (d.twoFa == twoFactor) {
          return this.userAuthenticated(user).then((result) => {
            // add to activity log
            this.$.Activity.addEntry({
              source: this.name,
              event: 'login',
              eventValue: '2fa',
              user: result.username,
              user_id: result._id,
            });
            return {
              username: result.username,
              token: result.token,
              email: result.email,
            };
          });
        } else {
          return Promise.reject('Invalid Code');
        }
      });
    },
    logout(req) {
      this.$log(`user ${req.user.username} issued a logout`);
      let st = Date.now();
      // zero out the token in mongo
      this.$.Mongo.updateOne('rivUsers', req.user._id, {
        $set: {
          token: null
        }
      }).then(() => {
        // add to activity log
        this.$.Activity.addEntry({
          source: this.name,
          event: 'logout',
          req,
        });
        return 'successfully logged out';
      }).catch((err) => {
        this.$warn('error deleting token from  mongo', err);
        // add to activity log
        this.$.Activity.addEntry({
          source: this.name,
          event: 'error logging out',
          level: 'error',
          req,
        });
        return Promise.reject('Error deleting token');
      });
    },
    // lightweight API method simply checks if authenticated, since it can only be called if true
    check(req) {
      res.send('ok');
    },
    // get consolidated permissions for the current user
    getPermissions(req) {
      this.$.Roles.getAllRoleInfo(req.user.role_ids).then((info) => {
        res.send(info.permissions);
      });
    },
    // let authenticated user renew their token
    renewToken(req) {
      this.userAuthenticated(req.user).then((rslt) => {
        res.send(rslt.token);
      }).catch((err) => {
        res.status(401).send(err);
      });
    },
  },
  methods: {
    //
    // Authenticate a user either against mongo, or call hook if specified
    //
    authenticateUser({ username, password }) {
      return new Promise(async (resolve, reject) => { // obj needs to have user and pass fields
        // if authHook is specified, call it as a method with the input,
        // the return should be a promise returning
        // with as many of the user doc fields as possible so we can bootstrap a user record from
        // that info
        if (this.authHook) {
          let hook = get(this.$, this.authHook);
          if (hook) {
            let extUser = await hook({ username, password });
            this.$warn(`authHook called and it returned this:`, extUser);
            if (!extUser) {
              let event = 'User denied by ext auth';
              // add to activity log
              this.$.Activity.addEntry({
                source: this.name,
                event,
                user_id: user._id,
              });
              return reject(event);
            }
          }
        }
        // GET LOCAL USER DOC FROM MONGO
        // make sure we have a user document before we continue
        // with authHook, this document will need to be created on-the-fly
        let user = this.$.Users.userByUsername(username);
        if (!user) {
          let event = 'User not found';
          // add to activity log
          this.$.Activity.addEntry({
            source: this.name,
            event,
            eventValue: username,
            username: 'system',
          });
          return reject(event);
        }
        if (!user.enabled) {
          // add to activity log
          this.$.Activity.addEntry({
            source: this.name,
            event: 'Login attempt for disabled user',
            username: user.username,
            user_id: user._id,
          });
          return reject('User disabled');
        }
        if (this.authHook) {
          // if we get here, authHook should have authenticated us already
          resolve(user);
        } else if (user && user.password) {
          // check password hash from mongo in standalone
          // salt was created with the following and is 32 chars long
          // const salt = crypto.randomBytes(16).toString("hex");
          const salt = user.password.substr(0, 32); // split out salt part
          const hash = user.password.substr(32);    // split out hash part
          let chk = crypto.scryptSync(password, salt, 32).toString("hex");
          if (chk === hash) {
            // local auth: hash matches, continue
            resolve(user);
          } else {
            let event = 'Wrong password';
            // add to activity log
            this.$.Activity.addEntry({
              source: this.name,
              event,
              user: user.username,
              user_id: user._id,
            });
            reject(event);
          }
        } else {
          this.$warn('could not find password for user:', user);
          reject('uh-oh, theres something wrong with riv-server user cache');
        }
      }).then((User) => { // next stage, all user info available
        // delete the password field for privacy
        if (User.password) {
          delete User.password;
        }
        if (this.enable2fa) {
          return this.twoFactorChallenge(User);
        } else {
          return this.userAuthenticated(User);
        }
      });
    },
    twoFactorChallenge(user) {
      return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        let ccode = utils.generate2FaCode();

        this.$debug(`2fa enabled, generated 6-digit code for user ${user.username}(${user.email})`, ccode);
        if (this.$.Mailer) {
          this.$.Mailer.sendMessage({
            from: 'riv-test@example.com',
            to: user.email,
            subject: 'Your verification code',
            text: `One-time code: ${ccode}`,
          });
        }

        user.token = this.buildToken(user, { twoFa: true });
        // update mongo
        this.$.Mongo.updateOne('rivUsers', user._id, {
          $set: {
            twoFa: ccode,
            twoFaExpire: new Date(now + this.tokenShortMs),
          }
        }).then(() => {
          // add to activity log
          this.$.Activity.addEntry({
            source: this.name,
            event: 'generated 2fa OTP',
            user: user.username,
            user_id: user._id,
          });
          resolve(user);
        }).catch((err) => {
          this.$warn(`error updating user for 2fa`, err);
          reject('Database error');
        });
      });
    },
    //
    // Process for successful authentication; currently this includes
    // updating mongo with token and lastLogin
    //
    userAuthenticated(obj) {
      return new Promise((resolve, reject) => {
        if (!obj.username) {
          return reject('No username!');
        }
        this.$log(`user authenticated, building token for: ${obj.username}`);
        obj.token = this.buildToken(obj);
        let updateOp = {
          $set: {
            token: obj.token,
            lastLogin: new Date(),
          },
        };
        if (!obj.firstLogin) {
          obj.firstLogin = updateOp['$set'].firstLogin = new Date();
        }
        // update mongo
        this.$.Mongo.updateOne('rivUsers', obj._id, updateOp).then(() => {
          resolve(obj);
        }).catch((err) => {
          this.$warn(`userAuthenticated database error`, err);
          reject('Database error');
        });
      });
    },
    //
    // build a token
    // additional options to build a token for 2fa (will put code in token)
    // or changing password (only valid for pw change and limited time)
    //
    buildToken(userObj, { twoFa = false, changePassword = false } = {}) {
      let duration = this.tokenMs;
      // limit token lifespan for 2fa or change password
      if (twoFa || changePassword) {
        duration = 300000; // 5 min
      }
      // set token type for aud field
      let tokenType = 'normal';
      if (twoFa) {
        tokenType = '2fa';
      } else if (changePassword) {
        tokenType = 'changePassword';
      }
      let header = {
        alg: "HS256",
        typ: "JWT"
      };
      let now = new Date().getTime();
      let payload = {
        iss: 'riv',
        sub: userObj._id,
        aud: tokenType,
        exp: Math.floor(new Date(now + this.tokenMs).getTime() / 1000),
        nbf: Math.floor(now / 1000),
        iat: Math.floor(now / 1000),
        jti: crypto.randomBytes(16).toString('hex'),
      };
      let hp = Buffer.from(JSON.stringify(header)).toString('base64') + '.' + Buffer.from(JSON.stringify(payload)).toString('base64');
      let signature = crypto.createHmac('sha256', this.jwtSecret).update(hp).digest('hex');
      let token = `${hp}.${signature}`;
      this.$log(`built token for ${userObj.username} for ${this.tokenMs} ms`, token);
      return token;
    },
    //
    // cryptographically validate a JWT
    //
    validateToken(token) {
      let splitToken = token.split('.');
      let signature = crypto.createHmac('sha256', this.jwtSecret).update(splitToken.slice(0, 2).join('.')).digest('hex');
      // see if computed signature matches what was provided
      if (signature === splitToken[2]) {
        // signature matches, now parse payload and see if time is valid
        let payload;
        try {
          payload = JSON.parse(Buffer.from(splitToken[1], 'base64').toString());
        } catch (e) {
          this.$error('error parsing json in JWT payload', e);
          return null;
        }
        if (payload.exp && payload.exp > Date.now() / 1000) {
          return payload;
        } else {
          this.$debug('expired token', token);
          return null;
        }
      }
      this.$warn('could not validate JWT signature on token, it may not be a JWT');
      return null;
    },
  },
};
