import { find, flatMap, isString, isArray, cloneDeep } from 'lodash-es';
import axios from 'axios';
import https from 'node:https';
import TimeRange from '../../../shared/utils/time-range.ts';

export default {
  name: 'Druid',
  props: {
    user: null,             // optional username
    pass: null,             // optional password
    statusEndpoint: '/status',
    supervisorEndpoint: '/druid/indexer/v1/supervisor/',
    indexerEndpoint: '/druid/indexer/v1/task/',
    dataSourcesEndpoint: '/druid/coordinator/v1/metadata/datasources',
    queryEndpoint: '/druid/v2',
    timeout: 30000,
    dimensionTypeOverrides: {},
    measureTypeOverrides: {}
  },
  data() {
    return {
      axiosOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: this.timeout,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      },
      validGranularities: [
        'second',
        'minute',
        'hour',
        'day',
        'all',
      ],
      defaultGranularity: 'all',
      timeDimensions: [ // faked time dimensions
        'DayOfMonth',
        'DayOfWeek',
        'Hour',
        'Minute',
        'Month',
        'MonthName',
        'Second',
        'Year',
      ],
      blackListedColumns: [
        '__time',
      ],
      typeMap: {
        STRING: 'string',
        LONG: 'number',
        hyperUnique: 'number',
        FLOAT: 'number',
      },
    };
  },
  init() {
    // set authorization header for Druid if user and pass props are set
    if (this.user && this.user.length > 0 &&
        this.pass && this.pass.length > 0) {
      this.axiosOptions.headers.Authorization = `Basic ${Buffer.from(this.user + ":" + this.pass).toString('base64')}`;
    }
  },
  // local methods
  methods: {
    // analytics plug-in method
    autoRange(dataset) {
      // get the latest segment from druid
      let query = {
        queryType: 'segmentMetadata',
        dataSource: dataset.store,
      };
      return this.query(dataset, query).then((res) => {
        if (res.intervals && res.intervals.length > 0) {
          let interval = res.intervals[res.intervals.length - 1];
          return interval.split('/');
        }
        return [];
      });
    },
    // analytics plug-in method
    getMeta(dataset, { range }) {
      // set up query
      let query = {
        queryType: 'segmentMetadata',
        dataSource: dataset.store,
        range,
      };
      console.log('getMeta query');
      return this.query(dataset, query).then((resp) => {
        let ret = {
          dimensions: [],
          measures: [],
        };
        if (resp.dimensions) {
          for (let d of resp.dimensions) {
            ret.dimensions.push(d);
          }
          // add in the fake Time dimensions, these are not actually part
          // of the schema, but are added here manually and faked on query
          ret.dimensions.push({ name: 'DayOfMonth', type: 'number' });
          ret.dimensions.push({ name: 'DayOfWeek',  type: 'string' });
          ret.dimensions.push({ name: 'Hour',       type: 'number' });
          ret.dimensions.push({ name: 'Minute',     type: 'number' });
          ret.dimensions.push({ name: 'Month',      type: 'number' });
          ret.dimensions.push({ name: 'MonthName',  type: 'string' });
          ret.dimensions.push({ name: 'Second',     type: 'number' });
          ret.dimensions.push({ name: 'Year',       type: 'number' });

          // override Coordinates type
          let geo = find(ret.dimensions, { name: 'Coordinates' });
          if (geo) {
            geo.type = 'geo';
          }
        }
        // add measures
        if (resp.measures) {
          for (let m of resp.measures) {
            ret.measures.push(m);
          }
        }
        return ret;
      }).catch((err) => {
        this.$warn('getMeta error', err);
        return Promise.reject(`error in request to druid ${err}`);
      });
    },
    // analytics plug-in method
    rollup(dataset, q) {
      let query = {
        queryType: 'groupBy',
        dataSource: dataset.store,
        granularity: q.granularity,
        dimensions: q.dimensions,
        measures: q.measures,
        sort: q.sort,
        limit: q.limit,
        range: q.range,
      };

      return this.query(dataset, query).then((resp) => {
        return resp;
      }).catch((err) => {
        return Promise.reject(`error in request to druid ${JSON.stringify(err)}`);
      });
    },
    // analytics plug-in method
    scan(dataset, q) {
      let query = {
        queryType: 'scan',
        dataSource: dataset.store,
        dimensions: q.dimensions,
        resultFormat: 'list',
        range: q.range,
        limit: q.limit,
        order: q.order,
      };

      return this.query(dataset, query).then((resp) => {
        return resp;
      }).catch((err) => {
        this.$warn(err);
        return Promise.reject(`error in request to druid ${JSON.stringify(err)}`);
      });
    },
    timeseries(dataset, q) {
      let query = {
        queryType: 'timeseries',
        dataSource: dataset.store,
        granularity: q.granularity,
        dimensions: q.dimensions,
        measures: q.measures,
        range: q.range,
      };

      return this.query(dataset, query).then((resp) => {
        return resp;
      }).catch((err) => {
        return Promise.reject(`error in request to druid ${JSON.stringify(err)}`);
      });
    },
    values(dataset, q) {
      let query = {
        queryType: 'search',
        dataSource: dataset.store,
        dimensions: [{ field: q.field }],
        range: q.range,
        searchTerm: q.searchTerm,
        limit: q.limit,
      };

      return this.query(dataset, query).then((resp) => {
        return resp;
      }).catch((err) => {
        return Promise.reject(`error in request to druid ${JSON.stringify(err)}`);
      });
    },
    status(dataset) {
      return axios.get(`${dataset.url}${this.statusEndpoint}`, this.axiosOptions);
    },
    // these need to be updated to return everything with status() above
    supervisorStatus(dataset) {
      return axios.get(`${dataset.url}${this.supervisorEndpoint}${dataset.store}/status`, this.axiosOptions);
    },
    dataSources(dataset) {
      return axios.get(`${dataset.url}${this.dataSourcesEndpoint}`, this.axiosOptions);
    },
    indexerStatus(dataset, indexer) {
      return axios.get(`${dataset.url}${this.indexerEndpoint}${indexer}/status`, this.axiosOptions);
    },
    query(dataset, query) {
      return new Promise((resolve, reject) => {
        let rawQuery = {};
        let limit = query.limit === undefined ? 100 : query.limit;

        if (query.queryType) {
          rawQuery.queryType = query.queryType;
        } else {
          return reject({ msg: 'query did not include queryType' });
        }

        // process dataSource, if it's an array, use the elements as a union
        // using druid syntax for mergin datasources
        if (query.dataSource) {
          if (isArray(query.dataSource)) {
            this.$debug(`druid merging dataSources: ${query.dataSource}`);
            rawQuery.dataSource = {
              type: 'union',
              dataSources: query.dataSource,
            };
          } else {
            rawQuery.dataSource = query.dataSource;
          }
        } else {
          return reject({ msg: 'query did not include dataSource' });
        }

        // process dimensions
        if (query.dimensions) {
          rawQuery.dimensions = [];
          for (let d of query.dimensions) {
            if (this.timeDimensions.indexOf(d.field) < 0) {
              rawQuery.dimensions.push(d.field);
            } else {
              // add the weird time spec
              rawQuery.dimensions.push({
                type: 'extraction',
                dimension: '__time',
                outputName: d.field,
                extractionFn: {
                  type: 'timeFormat',
                  format: this.getTimeExtractionFormat(d.field),
                }
              });
            }
          }
        }

        // set up query fields based on queryType
        switch (query.queryType) {
          case 'search':
            rawQuery.searchDimensions = rawQuery.dimensions;
            rawQuery.query = {
              type: 'insensitive_contains',
              value: query.searchTerm,
            };
            rawQuery.sort = {
              type: 'lexicographic',
            };
            if (query.limit) {
              rawQuery.limit = query.limit;
            }
            break;
          case 'groupBy':
            // process measures into aggregations and limitSpec
            rawQuery.aggregations = [];
            rawQuery.limitSpec = {
              type: 'default',
              limit,
              columns: [],
            };
            if (query.measures) {
              for (let m of query.measures) {
                if (m === 'DayCount' || m === 'HourCount') { // treat the fake time measures special
                  rawQuery.aggregations.push({
                    type: 'cardinality',
                    name: m,
                    fields: [
                      {
                        type: 'extraction',
                        dimension: '__time',
                        outputName: m,
                        dimExtractionFn: {
                          type: 'timeFormat',
                          format: 'yyyyMMddHH',
                          locale: 'en-US',
                          timeZone: 'UTC'
                        }
                      }
                    ],
                    byRow: true,
                    round: true
                  });
                } else {
                  let o = {
                    fieldName: m.field,
                    name: m.field,
                    type: this.validateMeasureType(m.field, m.type),
                  };
                  if (o.type === 'hyperUnique') {
                    o.isInputHyperUnique = false;
                    o.round = true;
                  }
                  rawQuery.aggregations.push(o);
                  //
                  // use having specs for measure thresholds
                  //
                  if (m.thresholds && m.thresholds.length > 0) {
                    rawQuery.having = {
                      type: 'and',
                      havingSpecs: [],
                    };
                    // add each threshold to and array
                    for (let t of m.thresholds) {
                      let type = 'equalTo';
                      switch (t.op) {
                        case '<':
                          type = 'lessThan';
                          break;
                        case '>':
                          type = 'greaterThan';
                          break;
                      }
                      rawQuery.having.havingSpecs.push({
                        type,
                        aggregation: m.field,
                        value: t.value,
                      });
                    }

                  }
                }

                // see if this measure has a sort spec
                if (m.sort && m.sort !== 'none') {
                  rawQuery.limitSpec.columns.push({
                    dimension: m.field,
                    direction: m.sort,
                    dimensionOrder: 'numeric',
                  });
                }
              }
            }
            break;
          // used to query metadata for a certain time range
          case 'segmentMetadata':
            rawQuery.merge = true;
            break;
          case 'timeseries':
            rawQuery.aggregations = [];
            for (let m of query.measures) {
              if (m === 'DayCount' || m === 'HourCount') { // treat the fake time measures special
                rawQuery.aggregations.push({
                  type: 'cardinality',
                  name: m.field,
                  fields: [
                    {
                      type: 'extraction',
                      dimension: '__time',
                      outputName: m.field,
                      dimExtractionFn: {
                        type: 'timeFormat',
                        format: 'yyyyMMddHH',
                        locale: 'en-US',
                        timeZone: 'UTC'
                      }
                    }
                  ],
                  byRow: true,
                  round: true
                });
              } else {
                let o = {
                  fieldName: m.field,
                  name: m.field,
                  type: this.validateMeasureType(m.field, m.type),
                };
                if (o.type === 'hyperUnique') {
                  o.isInputHyperUnique = false;
                  o.round = true;
                }
                rawQuery.aggregations.push(o);
              }
            }
            break;
          case 'scan':
            if (query.limit) {
              rawQuery.limit = query.limit;
            }
            if (query.order) {
              rawQuery.order = query.order;
            }
            break;
          default:
            // just add measures & limit directly
            rawQuery.measures = flatMap(query.measures, 'field');
            rawQuery.limit = limit;
        }

        // process timerange (usually needs to be present)
        if (query.range) {
          if (isString(query.range)) {
            let endTime = new Date();
            let r = TimeRange.getStartOfRange(query.range, endTime);
            rawQuery.intervals = [`${r.toISOString()}/${endTime.toISOString()}`];
          } else {
            // let Date try to parse the times
            // to make sure they're in the right format
            let st = new Date(query.range[0]).toISOString();
            let et = new Date(query.range[1]).toISOString();
            rawQuery.intervals = [`${st}/${et}`];
          }
        }

        // process granularity
        if (query.granularity &&
            this.validGranularities.indexOf(query.granularity) > -1) {
          rawQuery.granularity = query.granularity;
        } else {
          rawQuery.granularity = this.defaultGranularity;
        }

        // process filters
        let filter = {
          type: 'and',
          fields: [],
        };
        // add user filters
        if (query.dimensions && query.dimensions.length > 0) {
          for (let d of query.dimensions) {
            if (d.filters && d.filters.length > 0) {
              let filters = this.convertFilters(d.field, d.filters);
              // handle pseudo time dims
              if (filters.fields) { // multiple filters
                for (let e of filters.fields) {
                  if (this.timeDimensions.indexOf(e.dimension) > -1) {
                    e.extractionFn = {
                      type: 'timeFormat',
                      format: this.getTimeExtractionFormat(e.dimension),
                    };
                    e.dimension = '__time';
                  }
                }
              } else { // single
                if (this.timeDimensions.indexOf(filters.dimension) > -1) {
                  filters.extractionFn = {
                    type: 'timeFormat',
                    format: this.getTimeExtractionFormat(filters.dimension),
                  };
                  filters.dimension = '__time';
                }
              }
              filter.fields.push(filters);
            }
          }
        }
        // add to query if there are filters
        if (filter.fields.length > 0) {
          rawQuery.filter = filter;
        }
        // make the request
        axios.post(`${dataset.url}${this.queryEndpoint}`, rawQuery, this.axiosOptions).then((res) => {
          resolve(this.processOutput(query, res.data));
        }).catch((err) => {
          if (err.response && err.response.data) {
            this.$error('response error', err.response.data);
            reject(err.response.data);
          } else {
            if (err.toJSON) {
              this.$error('unknown error', err.toJSON());
            } else {
              this.$error('unknown error', err);
            }
            reject(err.message);
          }
        });
      });
    },
    //
    // handle the various output of the query call, based on the format of the
    // output
    // TODO: this needs to be re-written to take advantage of query info
    //
    processOutput(query, data) {
      // this.$debug('processOutput', data);
      if (data && isArray(data) && data.length > 0) {
        // determine what kind of output this is
        if (data[0].events) {
          // events list, add all to an array and return
          let output = [];
          for (let d of data) {
            if (d.events) {
              for (let e of d.events) {
                if (e.__time) {
                  e.Timestamp = new Date(e.__time);
                  delete e.__time;
                }
                output.push(cloneDeep(e));
              }
            }
          }
          return output;
        } else if (data[0].columns) {
          // probably column spec
          let output = {
            dimensions: [],
            measures: [],
            numRows: data[0].numRows,
            intervals: data[0].intervals,
          };
          for (let [k, v] of Object.entries(data[0].columns)) {
            if (this.blackListedColumns.indexOf(k) > -1) {
              continue;
            }
            let isDimension = false;
            let isMeasure = false;

            if (k.endsWith('Count')) {
              isMeasure = true;
            } else if (k.endsWith('Value') || k.endsWith('Ms')) {
              isDimension = true;
              isMeasure = true;
            } else {
              isDimension = true;
            }
            if (isDimension) {
              // add to dimensions
              output.dimensions.push({
                name: k,
                type: this.validateDimensionType(k, this.typeMap[v.type]),
              });
            }
            if (isMeasure) {
              // add to measures
              output.measures.push({
                name: k,
                type: this.typeMap[v.type],
              });
            }
          }
          return output;
        } else if (data[0].event) {
          // event list, add all to an array and return
          let output = [];
          for (let d of data) {
            if (d.event) {
              // add in a timestamp (to use for binning)
              if (d.timestamp && query.queryType !== 'groupBy') {
                d.event.Timestamp = new Date(d.timestamp);
              }
              output.push(d.event);
            }
          }
          return output;
        } else if (data[0].result && isArray(data[0].result)) {
          // values list
          let output = [];
          for (let d of data[0].result) {
            output.push(d);
          }
          return output;
        } else if (data[0].timestamp && data[0].result) {
          // most likely timeseries list, add all to an array and return
          let output = [];
          for (let d of data) {
            output.push({
              Timestamp: d.timestamp,
              ...d.result,
            });
          }
          return output;
        }
      }
      return [];
    },
    validateMeasureType(m, typ) {
      if (this.measureTypeOverrides[m]) {
        return this.measureTypeOverrides[m];
      }
      return typ;
    },
    validateDimensionType(dim, typ) {
      if (this.dimensionTypeOverrides[dim]) {
        return this.dimensionTypeOverrides[dim];
      }
      return typ;
    },
    getTimeExtractionFormat(d) {
      switch (d) {
        case 'DayOfMonth':
          return 'dd';
        case 'DayOfWeek':
          return 'EEEE';
        case 'Hour':
          return 'HH';
        case 'Minute':
          return 'mm';
        case 'Month':
          return 'MM';
        case 'MonthName':
          return 'MMMM';
        case 'Second':
          return 'ss';
        case 'Year':
          return 'yyyy';
        default:
      }
    },
    convertFilters(dimension, filters) {
      let ret = null;
      let processFilterBarModel = function(f) {
        let ret = {};
        switch (f.op) {
          case 'equals':
            ret.dimension = dimension,
            ret.type = 'selector';
            ret.value = f.values[0];
            break;
          case 'not equal':
            ret.type = 'not';
            ret.field = {
              dimension: dimension,
              type: 'selector',
              value: f.values[0],
            };
            break;
          case 'is null':
            ret.dimension = dimension,
            ret.type = 'selector';
            ret.value = null;
            break;
          case 'not null':
            ret.type = 'not';
            ret.field = {
              dimension: dimension,
              type: 'selector',
              value: null,
            };
            break;
          case 'regex':
            ret.dimension = dimension;
            ret.type = 'regex';
            ret.pattern = f.values[0];
            break;
          case 'not regex':
            ret.type = 'not';
            ret.field = {
              dimension: dimension,
              type: 'regex',
              pattern: f.values[0],
            };
            break;
          case 'like':
            ret.dimension = dimension,
            ret.type = 'like';
            ret.pattern = f.values[0];
            break;
          case 'not like':
            ret.type = 'not';
            ret.field = {
              dimension: dimension,
              type: 'like',
              pattern: f.values,
            };
            break;
          case 'in':
            ret.dimension = dimension,
            ret.type = 'in';
            ret.values = f.values;
            break;
          case 'not in':
            ret.type = 'not';
            ret.field = {
              dimension: dimension,
              type: 'in',
              values: f.values,
            };
            break;
          case 'search':
            ret.type = 'search';
            ret.dimension = dimension;
            ret.query = {
              type: 'insensitive_contains',
              value: f.values[0],
            };
            break;
          case '<=':
            ret.type = 'bound';
            ret.dimension = dimension;
            ret.upper = f.values[0];
            ret.ordering = 'numeric';
            break;
          case '>=':
            ret.type = 'bound';
            ret.dimension = dimension;
            ret.lower = f.values[0];
            ret.ordering = 'numeric';
            break;
          default:
        }
        return ret;
      };

      // filters are built differently depending on whether there is one or many.
      // our filter bar assumes an AND relationship between dimensions for now
      if (filters.length > 1) {
        ret = {
          type: 'and',
          fields: [],
        };
        for (let f of filters) {
          let d = processFilterBarModel(f);
          // only if non-null
          if (d) {
            ret.fields.push(d);
          }
        }
      } else if (filters.length === 1) {
        ret = processFilterBarModel(filters[0]);
      }
      return ret;
    },
  },
};
