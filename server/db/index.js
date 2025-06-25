// db operation abstraction layer
// unlike the analytics module, this only lets you specify 1 engine, through the engine prop
// note that syntax follows the mongo way of doing things, and translates
// that to postgres ops when Postgres is used
//
//
export default {
  name: 'Db',
  props: {
    engine: 'Mongo',
  },
  init() {
    this.$log(`using ${this.engine} as riv database`);
  },
  methods: {
    insertOne(ns, doc, ...args) {
      console.$error(`implement ${arguments.callee.name}`);
    },
    insertMany(ns, docs, ...args) {
    },
    find(ns, query={}, ...args) {
    },
    findOne(ns, query, ...args) {
    },
    findOneAndUpdate(ns, filter, update, ...args) {
    },
    findOneAndDelete(ns, filter, ...args) {
    },
    updateOne(ns, filter, update, ...args) {
    },
    updateMany(ns, filter, update, ...args) {
    },
    deleteOne(ns, filter, ...args) {
    },
    deleteMany(ns, filter, ...args) {
    },
    aggregate(ns, pipeline, ...args) {
    },
    watch(ns, pipeline, callback) {
    },
    distinct(ns, field, query={}, ...args) {
    },
    // private proxy to engine method
    __engineCallHandler(method, ...args) {
      this.$[this.engine][method](...args);
    },
  },
};
