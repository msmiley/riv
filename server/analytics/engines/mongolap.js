// Analytics Plugin for mongo
//
//
//
import { isArray } from 'lodash-es';
import TimeRange from '../../../shared/utils/time-range.js';

export default {
  name: 'Mongolap',
  props: {
    timestampField: 'Timestamp',
    countMeasure: 'Count', // name of the virtual-measure for the count of documents
    blacklistedFields: [
      '_id',
    ],
  },
  events: {
    'Mongo.ready'() {
      this.$ready();
    },
    // event bridge to insert with no response
    'Mongolap.insert'(args) {
      this.insert(args);
    },
  },
  methods: {
    autoRange(dataset) {
      let timestampField = dataset.timestamp ?? 'Timestamp';
      return this.$.Mongo.find(dataset.store, {}, {
        sort: {
          _id: -1,
        },
        limit: 25, // try to get at least 25 data points
      }).then((res) => {
        if (res.length > 0) {
          // isolate the start and end docs, note we are sorting backwards
          // so this looks opposite from what you would expect
          let startDoc = res.at(-1);
          let endDoc = res[0];
          // if timestampField exists in the docs, use it;
          // otherwise try decoding from _id
          if (startDoc[timestampField] && endDoc[timestampField]) {
            return [startDoc[timestampField], endDoc[timestampField]];
          } else {
            return [startDoc._id.getTimestamp(), endDoc._id.getTimestamp()];
          }
        }
        return [];
      });
    },
    getMeta(dataset, { range }) {
      let filter = {};
      // set up time range filtering
      if (range) {
        filter[this.getTimestampFieldName(dataset)] = this.generateRangeFilter(range);
      }
      // query mongo for last doc in range
      return this.$.Mongo.findOne(dataset.store, filter, {
        sort: {
          _id: -1,
        },
      }).then((res) => {
        let ret = {
          dimensions: [],
          measures: [],
        };
        // add fields as dimensions
        for (let k of Object.keys(res)) {
          // skip blacklisted fields
          if (this.blacklistedFields.indexOf(k) > -1) continue;
          if (k === this.getTimestampFieldName(dataset)) continue;
          if (dataset.measures && dataset.measures.indexOf(k) > -1) continue;
          // add as dimension
          ret.dimensions.push({
            name: k,
            type: 'string',
          });
        }
        // add specified measures
        if (dataset.measures) {
          for (let m of dataset.measures) {
            ret.measures.push({
              name: m,
              type: 'longSum',
            });
          }
        }
        // add virtual Count
        ret.measures.push({
          name: this.countMeasure,
          type: 'count',
        });
        return ret;
      });
    },
    rollup(dataset, q) {
      return this.query({
        namespace: dataset.store,
        range: q.range,
        dimensions: this.processDimensionsForMongolap(q.dimensions),
        measures: this.processMeasuresForMongolap(q.measures),
        granularity: q.granularity,
        sort: q.sort,
        limit: q.limit,
        // debug: true,
      });
    },
    timeseries(dataset, q) {
      return this.query({
        namespace: dataset.store,
        range: q.range,
        dimensions: this.processDimensionsForMongolap(q.dimensions),
        measures: this.processMeasuresForMongolap(q.measures),
        granularity: q.granularity,
        sort: q.sort,
        // debug: true,
      });
    },
    // generate a mongo compatible filter from the range setting, range can
    // be string for a preset or an array [start,stop]
    generateRangeFilter(range) {
      let startTime, endTime;
      if (typeof(range) === 'string' && TimeRange.validRangePreset(range)) {
        endTime = new Date();
        startTime = TimeRange.getStartOfRange(range, endTime);
        // console.log('test', endTime, startTime);
      } else {
        // let Date try to parse the times
        // to make sure they're in the right format
        startTime = new Date(range[0]);
        endTime = new Date(range[1]);
      }
      return {
        $gte: startTime,
        $lte: endTime,
        $type: 'date',
      };
    },
    //
    // insert a record into the specified dataset
    //
    insert(dataset, doc) {
      let timestampField = dataset.timestamp ?? 'Timestamp';
      // ensure theres is a ts field, if not set one with the current Date
      if (!doc[timestampField]) {
        doc[timestampField] = new Date();
      } else if (typeof doc[timestampField] === 'string') {
        // attempt to convert to date if user provided a string
        // maybe make this an option in props
        doc[timestampField] = new Date(doc[timestampField]);
      }
      // send the doc to mongo
      return this.$.Mongo.insertOne(dataset.store, doc).catch((err) => {
        this.$warn('error on insert', err);
        return Promise.reject(err);
      });
    },
    //
    // run a query against the specified namespace using the parameters described below
    //
    query({
      namespace,           // required, the namespace to query
      range,               // optional time range, either a key from rangePresets or array or string dates or Date objects: ['st', 'et']
      dimensions = [],     // { field: '', op: '$in/$nin/$regex/etc.', value: Object/String } (only field is required, op and value set up filtering)
      measures = [],       // { field: '', sort: 'ascending/descending', op: '$sum/$min/$max/$avg/etc.' } (only field is required)
      granularity = 'all', // all/hour/minute/second (all for scan mode)
      limit,               // limit results
      debug,               // print out pipeline sent to mongo for debug purposes
      timestampField = 'Timestamp', // name for timestamp field
    }) {
      // SORT STAGE
      let sort = {};

      // MATCH STAGE
      let match = {};
      // add time filtering first
      if (range) {
        match[timestampField] = this.generateRangeFilter(range);
      } else {
        // at least ensure that the timestamp field exists in results
        match[timestampField] = { $exists: true, $type: 'date' };
      }

      // PROJECT STAGE
      let project = {
        _id: false,
      };

      // GROUP STAGE
      let group = {
        _id: {}, // _id is the grouping var, holds all dimensions including time
      };
      if (granularity !== 'all') {
        // project the timestamp key if granularity is not 'all'
        project[timestampField] = true;
        // this is the default granularity (day)
        group._id.year = {
          $year: `$${timestampField}`
        };
        group._id.month = {
          $month: `$${timestampField}`
        };
        group._id.day = {
          $dayOfMonth: `$${timestampField}`
        };
        // handle the finer granularities by adding h:m:s
        if (granularity === 'hour') {
          group._id.hour = {
            $hour: `$${timestampField}`
          };
        } else if (granularity === 'minute') {
          group._id.hour = {
            $hour: `$${timestampField}`
          };
          group._id.minute = {
            $minute: `$${timestampField}`
          };
        } else if (granularity === 'second') {
          group._id.hour = {
            $hour: `$${timestampField}`
          };
          group._id.minute = {
            $minute: `$${timestampField}`
          };
          group._id.second = {
            $second: `$${timestampField}`
          };
        }
        sort._id = 1;
      }
      // process dimensions
      for (let dim of dimensions) {
        // add any specified filtering op
        if (dim.op) {
          match[dim.field] = { [dim.op]: dim.value };
        }
        // add the field to projections to be projected
        project[dim.field] = true;
        // add it to be grouped
        group._id[dim.field] = `$${dim.field}`;
      }
      // process measures
      for (let meas of measures) {
        // treat countMeasure special since it's not actually in the mongo documents,
        // it's just a meta-count of the documents
        if (meas.field === this.countMeasure) {
          group[this.countMeasure] = { $sum: 1 };
        } else { // user measure
          // add it to be projected
          project[meas.field] = true;
          let op = meas.op || '$sum';
          // add to group with user-specified operation or default to $sum
          group[meas.field] = { [op]: `$${meas.field}` };
        }
        // SORT only for non-timeseries (granularity == 'all')
        if (granularity === 'all') {
          if (meas.sort === 'ascending') {
            sort[meas.field] = 1;
          } else if (meas.sort === 'descending') {
            sort[meas.field] = -1;
          }
        }
      }
      // build pipeline
      let pipeline = [
        { $match: match },
        { $project: project },
        { $group: group },
      ];
      // SORT - only add if specified
      if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
      }
      // LIMIT
      if (limit) {
        pipeline.push({ $limit: parseInt(limit, 10) });
      }
      // DEBUG print out pipeline for debug: true
      if (debug) {
        this.$debug(namespace, pipeline);
      }
      // send the query to mongo
      return this.$.Mongo.aggregate(namespace, pipeline).then((docs) => {
        // post-processing
        for (let d of docs) {
          // convert binned date fields back to timestamps
          switch (granularity) {
            case 'day':
              d[timestampField] = new Date(d._id.year, d._id.month-1, d._id.day);
              break;
            case 'hour':
              d[timestampField] = new Date(d._id.year, d._id.month-1, d._id.day, d._id.hour);
              break;
            case 'minute':
              d[timestampField] = new Date(d._id.year, d._id.month-1, d._id.day, d._id.hour, d._id.minute);
              break;
            case 'second':
              d[timestampField] = new Date(d._id.year, d._id.month-1, d._id.day, d._id.hour, d._id.minute, d._id.second);
              break;
          }
          // promote dimension fields
          for (let dim of dimensions) {
            d[dim.field] = d._id[dim.field];
          }
          // remove _id completely
          delete d._id;
        }
        return docs;
      }).catch((err) => {
        if (debug) {
          this.$warn(err);
        }
        return Promise.reject(err);
      });
    },
    //
    // Run a table scan, returns complete documents within the time range and limit
    //
    scan(dataset, {
      range,           // optional time range, either a key from rangePresets or array or string dates or Date objects: ['st', 'et']
      dimensions = [], // { field: '', op: '$in/$nin/$regex/etc.', value: Object/String } (only field is required, op and value set up filtering)
      limit = 100,     // limit results, set null to return all
      order,         // timestampField sort order descending/ascending(default)
    }) {
      let dims = this.$.Mongolap.processDimensionsForMongolap(dimensions);
      let timestampField = this.getTimestampFieldName(dataset);
      let filter = {};
      // set up time range filtering
      if (range) {
        filter[timestampField] = this.generateRangeFilter(range);
      }
      // process dimension filters
      for (let dim of dims) {
        // add any specified filtering op
        if (dim.op) {
          filter[dim.field] = { [dim.op]: dim.value };
        }
      }
      // set sort order
      let sort = 1;
      if (order === 'descending') {
        sort = -1;
      }
      // send the query to mongo
      return this.$.Mongo.find(dataset.store, filter, {
        sort: {
          [timestampField]: sort,
        },
        limit,
      }).then((docs) => {
        // manually set our virtual countMeasure to 1 in the results
        // and remove _id
        for (let d of docs) {
          delete d._id;
          d[this.countMeasure] = 1;
        }
        return docs;
      });
    },
    values(dataset, {
      range,     // optional time range, either a key from rangePresets or array of string dates or Date objects: ['st', 'et']
      field,     // field name to use for return values
      regex,     // regex search for field value
      limit,     // limit results
      debug,     // print out pipeline sent to mongo for debug purposes
    }) {
      let timestampField = this.getTimestampFieldName(dataset);
      // MATCH STAGE
      let match = {};
      // add time filtering first
      if (range) {
        match[timestampField] = this.generateRangeFilter(range);
      } else {
        // at least ensure that the timestamp field exists in results
        match[timestampField] = { $exists: true, $type: 'date' };
      }
      if (regex) {
        match[field] = { $regex: regex, $options: 'i' };
      }
      let pipeline = [
        { $match: match },
        {
          $group: {
            _id: `$${field}`,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            value: "$_id",
            count: 1,
          },
        },
      ];
      // LIMIT
      if (limit) {
        pipeline.push({ $limit: parseInt(limit, 10) });
      }
      // DEBUG print out pipeline for debug: true
      if (debug) {
        this.$debug(dataset.store, pipeline);
      }
      return this.$.Mongo.aggregate(dataset.store, pipeline);
    },
    // convert dimensions to a mongolap friendly form
    processDimensionsForMongolap(dimensions) {
      let ret = [];
      if (isArray(dimensions)) {
        for (let d of dimensions) {
          let newDim = {
            field: d.field,
          };
          if (d.filters.length > 0) {
            for (let f of d.filters) {
              // console.log(f);
              switch (f.op) {
                case 'search':
                  break;
                case 'in':
                  newDim.op = '$in';
                  newDim.value = f.values;
                  break;
                case 'not in':
                  newDim.op = '$nin';
                  newDim.value = f.values;
                  break;
                case 'equals':
                  newDim.op = '$eq';
                  newDim.value = f.values[0];
                  break;
                case 'not equal':
                  newDim.op = '$neq';
                  newDim.value = f.values[0];
                  break;
                case 'is null':
                  newDim.op = '$eq';
                  newDim.value = null;
                  break;
                case 'not null':
                  newDim.op = '$ne';
                  newDim.value = null;
                  break;
                case 'regex':
                  newDim.op = '$regex';
                  newDim.value = f.values[0];
                  break;
                case 'not regex':
                  newDim.op = '$not';
                  newDim.value = {
                    $regex: f.values[0],
                  };
                  break;
                case '<=':
                  newDim.op = '$lte';
                  newDim.value = f.values[0];
                  break;
                case '>=':
                  newDim.op = '$gte';
                  newDim.value = f.values[0];
                  break;
              }

            }
          }
          ret.push(newDim);
        }
      }
      return ret;
    },
    // convert measures to a mongolap friendly form
    processMeasuresForMongolap(measures) {
      let ret = [];
      for (let m of measures) {
        let newMeas = {
          field: m.field,
          sort: m.sort,
        };
        switch (m.type) {
          case 'longSum':
            newMeas.op = '$sum';
            break;
          case 'longMax':
            newMeas.op = '$max';
            break;
          case 'longMin':
            newMeas.op = '$min';
            break;
          case 'doubleMean':
            newMeas.op = '$avg';
            break;
          default: // nothing
        }
        ret.push(newMeas);
      }
      return ret;
    },
    // helper to get timestamp field name from dataset options or default prop
    getTimestampFieldName(dataset) {
      return dataset.timestampField ?? this.timestampField;
    },
  },
};
