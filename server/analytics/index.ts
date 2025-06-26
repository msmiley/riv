// Analytics engine used for Riv Activity store and any user-defined stores
// Built to support various backend databases, see "switch (d.engine)" statements
// for implementation examples
//
// Configuration:
// config for each dataset is provided through the datasets: config field, this is an
// object which expects sub-objects defining each analytics store, you are free
// to add additional config fields to the structure of the sub-object to support
// your particular database connector
//
import { defaultsDeep, find } from 'lodash-es';
import { AnalyticsSettings } from '../../shared/data/analytics-settings.ts';

export default {
  name: 'Analytics',
  props: {
    datasets: {}, // enumerate user datasets, keyed by an id, with an options object, note that you may
                  // extend the props object to accommodate your plugin
                  // {
                  //   title: 'Display Name', // optional display name for dataset
                  //   engine: 'mongo/druid', // other strings will be attempted to be used as a Module name, i.e. this.$.<engine>, make sure .meta/.autoRange/.rollup/.scan/.values are defined
                  //   store: 'e.g. collection name',
                  //   timestamp: 'timestamp field',
                  //   props: {
                  //     url: 'connection url', // example prop
                  //   }
                  // }
    // EXAMPLE DATASET
    loadExampleData: false,           // load the example data, also adds the example store to datasets array as a mongo dataset
    exampleCollection: 'riv.example', // example data only supports mongo, this is collection name
  },
  init() {
    // merge in the defaults for activity dataset, user's riv.config can override these
    defaultsDeep(this.datasets.activity, {
      title: 'Activity',
      engine: 'Mongolap',
      store: 'riv.activity',
    });
    // add example dataset
    if (this.loadExampleData) {
      this.datasets.example = {
        title: 'Example',
        engine: 'Mongolap',
        store: this.exampleCollection,
      };
    }
  },
  events: {
    async 'Mongo.ready'() {
      // if mongo is ready and loadExampleData is true, load example data if
      // the collection is  empty
      let count = await this.$.Mongo.count(this.exampleCollection);
      if (count === 0 && this.loadExampleData) {
        this.$warn('loading example data into mongo');
        let mod = await import('./example/load-example-data.ts');
        mod.default.loadData(this.insert);
      }
    },
    // event proxy to local insert method
    'Analytics.insert'(dataset, doc) {
      this.insert(dataset, doc);
    },
  },
  api: {
    // get the settings object for the given dataset and user making request
    getSettings(req, dataset) {
      // use store api for settings (remember this will be per-user)
      return this.$.Store.findValue(req, `analytics_${dataset}`).then(async (d) => {
        if (d) {
          // existing entry, rehydrate and send it
          return new AnalyticsSettings(d);
        } else {
          // no current entry, create a default with auto-range, dim, and measure
          let settings = new AnalyticsSettings();
          settings.setRange(await this.autoRange(req, dataset));
          // figure out dim and measure to use
          let meta = await this.getMeta(req, dataset, settings);
          // naively try to add first dimension and measure
          if (meta.dimensions.length > 0) {
            settings.addDimension({
              field: meta.dimensions[0].name,
              type: meta.dimensions[0].type
            });
          }
          if (meta.measures.length > 0) {
            // if Count exists, use it, otherwise use first found
            if (find(meta.measures, { name: 'Count' })) {
              settings.addMeasure({
                field: 'Count',
                type: 'longSum',
              });
            } else {
              settings.addMeasure({
                field: meta.measures[0].name,
                type: 'longSum',
              });
            }
          }
          return settings;
        }
      });
    },
    //
    // save the settings object for the given dataset and user making request
    //
    saveSettings(req, dataset, settings) {
      return this.$.Store.saveValue(req, `analytics_${dataset}`, settings);
    },
    //
    // try to find a range for the given dataset that will show some data
    // i.e. not be empty
    //
    autoRange(req, dataset) {
      this.$debug(`getting auto range for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'autoRange');
      }
      return Promise.reject('invalid dataset');
    },
    //
    // get metadata about dataset, mainly provides dimensions and measures
    //
    getMeta(req, dataset, settings) {
      this.$debug(`getting field names for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'getMeta', settings);
      }
      return Promise.reject('invalid dataset');
    },
    // perform rollup query
    rollup(req, dataset, q) {
      this.$debug(`rollup for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'rollup', q);
      }
      return Promise.reject('invalid dataset');
    },
    // perform a scan (direct rows) query
    scan(req, dataset, q) {
      this.$debug(`scan for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'scan', q);
      }
      return Promise.reject('invalid dataset');
    },
    // perform a time-series query
    timeseries(req, dataset, q) {
      this.$debug(`timeseries for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'timeseries', q);
      }
      return Promise.reject('invalid dataset');
    },
    // get distinct values for a column/dimension to aid in filtering
    values(req, dataset, q) {
      this.$debug(`values for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'values', q);
      }
      return Promise.reject('invalid dataset');
    },
  },
  methods: {
    // helper method to resolve a dataset name, checks for built-in special cases
    // before looking at user-provided prop
    getDataset(d) {
      return this.datasets[d];
    },
    //
    // insert a record into the analytics store for the given dataset
    // each engine has different ways of doing this
    //
    insert(dataset, data) {
      this.$debug(`data insert for ${dataset}`);
      // get dataset
      let d = this.getDataset(dataset);
      if (d) {
        return this.engineApiHandler(d, 'insert', data);
      }
      return Promise.reject('invalid dataset');
    },
    engineApiHandler(dataset, api, query) {
      // try to resolve engine module
      let e = this.$[dataset.engine];
      if (e) {
        if (e[api]) {
          return e[api](dataset, query);
        } else {
          this.$warn(`custom analytics engine ${dataset.engine} doesn't implement .${api}`);
        }
      } else {
        this.$error(`could not find analytics engine ${dataset.engine}`);
      }
    },
  },
};
