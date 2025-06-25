// node-mailer wrappper
import nodemailer from 'nodemailer';

export default {
  name: 'Mailer',
  props: {
    enabled: false,
    testAccount: false,
    transport: null,
  },
  data() {
    return {
      transport: null,
      sentEmails: 0,
    };
  },
  init() {
    this.$log('initializing nodemailer');
    if (this.enabled) {
      if (this.testAccount) {
        this.$debug('creating test account using ethereal mail');
        nodemailer.createTestAccount((err, account) => {
          if (err) {
            return this.$error('error creating ethereal mail test account', err);
          }
          this.$log(`created test account with user: ${account.user}, pass: ${account.pass}`);
          this.transport = {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass,
            }
          };
          this.initializeTransporter();
        });
      } else {
        this.initializeTransporter();
      }
    }
  },
  api: {
    // send a test message, only allowed when testAccount=true
    sendTestMessage(req, { to, subject, body }) {
      // only allow if in test account mode
      if (this.testAccount) {
        this.sendMessage({
          from: 'riv-test@example.com',
          to,
          subject,
          text: body,
        });
      }
    },
  },
  methods: {
    initializeTransporter() {
      if (this.enabled && this.transport && this.transport.host && this.transport.port && this.transport.auth) {
        this.$debug('initializing transporter', this.transport);
        try {
          this.transporter = nodemailer.createTransport(this.transport);

          this.transporter.verify((err) => {
            if (err) {
              return this.$error('error verifying node mailer smtp transporter', err);
            }
            this.$ready(`SMTP transporter at ${this.transport.host} verified`);
          });

        } catch (e) {
          console.error('error initializing nodemailer transporter', e);
        }
      } else {
        this.$warn('missing required nodemailer transport parameters, need transport: {host, port, auth}');
      }
    },
    // the actual send, should be guarded by permissions
    sendMessage(msg, callback) {
      if (this.enabled && this.transporter) {
        if (msg.from && msg.to && msg.subject && (msg.text || msg.html)) {
          this.transporter.sendMail(msg, callback);
          // add to activity log
          this.$.Activity.addEntry({
            source: this.name,
            event: 'Email sent',
            eventValue: msg.to,
            data: msg,
            user_id: 'system',
          });
          this.sentEmails++;
        } else {
          this.$warn('msg missing required fields, need {from, to, subject, text || html}');
        }
      } else {
        this.$warn('not enabled or transporter down');
      }
    },
  },
};
