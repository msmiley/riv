import pg from 'pg';

export default {
  name: 'Postgres',
  props: {
    db: 'postgres',       // default db name
    host: 'postgres',     // default host
    port: 5432,           // default port
    user: 'postgres',     // default user
    pass: 'postgres',     // default password
    retryInterval: 10000, // connection retry interval
    tables: {},           // table aliases set up at config time
  },
  init() {
    this.connect();
  },
  data() {
    return {
      client: null,    // handle to pg client
      types: pg.types, // alias to pg types
    };
  },
  methods: {
    //
    // connect the client to postgres, tries to close out any existing clients
    // also sets timer to reconnect on failure
    //
    async connect() {
      if (this.client) {
        this.client.end();
      }
      this.client = new pg.Client({
        host: this.host,
        database: this.db,
        user: this.user,
        password: this.pass,
        port: this.port,
      });
      this.client.connect().then(() => {
        this.$ready(`connected to postgres at ${this.host}:${this.port}`);
      }).catch((err) => {
        this.$error(`couldn't connect to ${this.host}:${this.port}, retrying in ${this.retryInterval}ms`, err);
        // schedule a reconnect
        setTimeout(this.connect, this.retryInterval);
      });
    },
    //
    // disconnect the client from postgres
    //
    disconnect() {
      if (this.client) {
        return this.client.end().then(() => {
          this.$log('client has disconnected');
        }).catch((err) => {
          this.$error('error during disconnection', err.stack);
        });
      }
    },
    //
    // use 'if not exists' to ensure the given schema and table have been created
    //
    ensureTable(name, columns) {
      if (!name || !columns) {
        return Promise.reject(`${this.name}: please provide table name and columns`);
      }
      let tableName = this.table(name);
      let schema = tableName.split('.')[0];
      return this.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`).then(() => {
        return this.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`);
      });
    },
    //
    // query wrapper for pg .query, can be used for raw sql queries, so exercise caution
    // in how this is exposed to users
    //
    query(q) {
      return this.client.query(q);
    },
    //
    // high-level count, takes the table name (with schema prefix)
    //
    count(tableName) {
      if (!tableName) {
        return Promise.reject(`${this.name}: please provide tableName`);
      }
      let queryStr = `SELECT COUNT(*)
                      FROM ${this.table(tableName)}`;
      return this.client.query(queryStr).then((rslt) => {
        // convert the count string to a number
        return parseInt(rslt.rows[0].count, 10);
      });
    },
    //
    // high-level insert, takes the table name (with schema prefix) and an
    // object of key-value pairs
    //
    insert(tableName, row, { returning='*' }={}) {
      let keys = Object.keys(row).join(',');
      // TODO: probably should check againts schema to validate types
      let values = Object.values(row).map(function(o) {
        if (typeof(o) === 'string') {
          return `'${o}'`;
        } else if (o !== null && typeof(o) === 'object') {
          // handle objects as jsonb
          return `'${JSON.stringify(o)}'::jsonb`;
        } else if (o === null || o === undefined) {
          return `NULL`;
        }
        return o;
      }).join(',');
      let queryStr = `INSERT into ${this.table(tableName)}(${keys})
                      VALUES (${values})
                      RETURNING ${returning};`;
      return this.query(queryStr).then((res) => {
        return res.rows;
      });
    },
    //
    // high-level find
    //
    find(tableName, { where, columns='*' }={}) {
      if (tableName && tableName.length > 0) {
        let queryStr = `SELECT ${columns}
                        FROM ${this.table(tableName)}`;
        if (where) {
          queryStr += ` WHERE ${where};`;
        }
        return this.query(queryStr).then((res) => {
          return res.rows;
        });
      }
      return Promise.reject(`${this.name}: need valid tableName`);
    },
    //
    // sanitized find by id, takes the table name (with schema prefix), the id
    // to find, and optionally, the comma-separated column names to select, which is
    // always more efficient than the default '*'
    //
    findById(tableName, id, { columns='*' }={}) {
      // sanitize id, which should be some form of uuid
      if (!id || id.match(/^[0-9a-z\-]{36,40}$/)) {
        let queryStr = `SELECT ${columns}
                        FROM ${this.table(tableName)}
                        WHERE id = '${id}';`;
        return this.query(queryStr).then((res) => {
          return res.rows[0];
        });
      }
      return Promise.reject(`${this.name}: id is not a valid uuid`);
    },
    //
    // sanitized update by id, takes the table name (with schema prefix), the id
    // to update and an object of key-value pairs
    //
    updateById(tableName, id, newVals) {
      // sanitize id, which should be some form of uuid
      if (!id || id.match(/^[0-9a-z\-]{36,40}$/)) {
        return this.update(tableName, `id = '${id}'`, newVals);
      }
      return Promise.reject(`${this.name}: id is not a valid uuid`);
    },
    //
    // high-level update, takes the table name (with schema prefix), the where clause
    // and an object of key-value pairs
    //
    update(tableName, where, newVals) {
      let sets = [];
      for (let [k, v] of Object.entries(newVals)) {
        // TODO: probably should check againts schema to validate types
        if (typeof(v) === 'object') {
          // attempt to update object
          sets.push(`${k} = ${k} || '${JSON.stringify(v)}'`);
        } else {
          sets.push(`${k} = '${v}'`); // simple set
        }
      }
      if (sets.length > 0) {
        let queryStr = `UPDATE ${this.table(tableName)}
                        SET ${sets.join(',')}
                        WHERE ${where}
                        RETURNING id;`;
        return this.query(queryStr).then((res) => {
          return res.rows;
        });
      }
      return Promise.reject(`${this.name}: no valid set fields`);
    },
    //
    // sanitized delete by id, takes the table name (with schema prefix), and the id to delete
    //
    deleteById(tableName, id, { idName='id' }={}) {
      // sanitize id, which should be some form of uuid
      if (!id || id.match(/^[0-9a-z\-]{36,40}$/)) {
        let queryStr = `DELETE from ${this.table(tableName)}
                        WHERE ${idName} = '${id}';`;
        return this.query(queryStr);
      }
      return Promise.reject(`${this.name}: id is not a valid uuid`);
    },
    //
    // resolve the table name as an alias if it matches a key in this.tables
    // otherwise return the argument
    //
    table(tableName) {
      return this.tables[tableName] || tableName;
    },
  },
};
