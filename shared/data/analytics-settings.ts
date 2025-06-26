import { find, filter, findIndex, flatMap } from 'lodash-es';
import { RivData } from '../base/riv-data.ts';
import RandomOps from '../utils/random-ops.ts';
import ColorOps from '../utils/color-ops.ts';

//
// Shared Module - both app/client and server use this module
// Analytics settings operations, including dimensions, measures, and all
// associated filters & transforms
//
export class AnalyticsSettings extends RivData {
  //
  // constructor pattern for RivData derived classes
  // provide obj to rehydrate and object and provide defaults
  //
  constructor(obj = {}, defaults = {
    view: 'Dual',
    mode: 'Rollup',
    range: '1M',
    limit: 25,
    granularity: 'hour',
    order: 'descending',
    dimensions: [],
    measures: [],
    indicators: [],
    favorites: [],
  }) {
    super(obj, defaults);

    if (!obj) {
      this.setDefaults();
    }
  }
  //////////////////////////////////////////////////////////////////////////////
  // misc sets/gets
  //////////////////////////////////////////////////////////////////////////////
  setMode(d) {
    this.mode = d;
    this.save();
  }
  setGranularity(d) {
    this.granularity = d;
    this.save();
  }
  setLimit(d) {
    this.limit = d;
    this.save();
  }
  setRange(d) {
    this.range = d;
    this.save();
  }
  setView(d) {
    this.view = d;
    this.save();
  }
  toggleOrder() {
    switch (this.order) {
      case 'none':
        this.order = 'descending';
        break;
      case 'descending':
        this.order = 'ascending';
        break;
      case 'ascending':
        this.order = 'none';
        break;
    }
    this.save();
  }
  //////////////////////////////////////////////////////////////////////////////
  // dimension sets/gets
  //////////////////////////////////////////////////////////////////////////////
  addDimension({
    field,          // required field name
    title = null,   // optional
    type,           // required type
    color = '',     // optional
    hidden = false, // optional
  }) {
    // use field name for title if not specified
    if (!title) {
      title = field;
    }
    this.dimensions.push({
      id: RandomOps.generateId(8),
      title,
      field,
      type,
      color,
      filters: [],
      transforms: [],
      hidden,
    });
    this.log('added dimension', field);
    this.save();
  }
  removeDimension({ id }) {
    let idx = findIndex(this.dimensions, { id });
    this.dimensions.splice(idx, 1);
    this.save();
  }
  // toggle dimension hidden, its filters still apply, but no results from this dimension
  toggleDimension({ id }) {
    let d = find(this.dimensions, { id });
    d.hidden = !d.hidden;
    this.save();
  }
  setDimensionColor({ id }, color) {
    let d = find(this.dimensions, { id });
    d.color = color;
    this.save();
  }
  // filters
  getDimensionFilters({ id }) {
    let d = find(this.dimensions, { id });
    return d.filters;
  }
  addDimensionFilter(dimension, {
    op,     // filter operation
    values, // array of values for operation, single entry for ops with only 1 value
  }) {
    let d = find(this.dimensions, { id: dimension.id });
    let filter = {
      id: RandomOps.generateId(8),
      op,
      values,
    };
    d.filters.push(filter);
    this.log('added dimension filter', d.field, filter);
    this.save();
  }
  updateDimensionFilter(dimension, filter, update) {
    let d = find(this.dimensions, { id: dimension.id });
    let f = find(d.filters, { id: filter.id });
    Object.assign(f, update);
    this.save();
  }
  removeDimensionFilter(dimension, filter) {
    let d = find(this.dimensions, { id: dimension.id });
    let idx = findIndex(d.filters, { id: filter.id });
    d.filters.splice(idx, 1);
    this.save();
  }
  setDimensionFilters(dimension, filters) {
    let d = find(this.dimensions, { id: dimension.id });
    d.filters = filters;
    this.save();
  }
  removeDimensionFilters(dimension) {
    let d = find(this.dimensions, { id: dimension.id });
    d.filters = [];
    this.save();
  }
  // transforms
  addDimensionTransform(dimension, {
    op,    // transform operation
    param, // transform parameter
    color, // transform color parameter
  }) {
    let d = find(this.dimensions, { id });
    let transform = {
      id: RandomOps.generateId(8),
      op,
      param,
      color,
    };
    d.transforms.push(transform);
    this.log('added dimension transform', d.field, transform);
    this.save();
  }
  removeDimensionTransforms({ id }) {
    let d = find(this.dimensions, { id });
    d.transforms = [];
    this.save();
  }
  setDimensionTransforms(dimension, transforms) {
    let d = find(this.dimensions, { id: dimension.id });
    d.transforms = transforms;
    this.save();
  }
  visibleDimensions() {
    return filter(this.dimensions, { hidden: false });
  }
  hiddenDimensions() {
    return filter(this.dimensions, { hidden: true });
  }
  //////////////////////////////////////////////////////////////////////////////
  // measure sets/gets
  //////////////////////////////////////////////////////////////////////////////
  addMeasure({
    field,               // required field name
    title = null,        // optional
    type,                // required type (note this is not the type from the schema, this is more of an operation on the measure sum/max/min/etc.)
    sort = 'descending', // optional
    color = 'var(--riv-primary)', // optional
    disabled = false,    // optional
  }) {
    // use field name for title if not specified
    if (!title) {
      title = field;
    }
    // try up to 10 times to find a color not used yet and assign it
    let existingColors = flatMap(this.measures, 'color');
    for (let i = 0; i < 10; i++) {
      let c = ColorOps.colorGenerator(i);
      if (existingColors.indexOf(c) < 0) {
        color = c;
        continue;
      }
    }
    this.measures.push({
      id: RandomOps.generateId(8),
      title,
      field,
      type,
      sort,
      disabled,
      color,
      thresholds: [],
      transforms: [],
      format: 'auto',
    });
    this.log('added measure', field);
    this.save();
  }
  removeMeasure({ id }) {
    let idx = findIndex(this.measures, { id });
    this.measures.splice(idx, 1);
    this.save();
  }
  toggleMeasure({ id }) {
    let m = find(this.measures, { id });
    m.disabled = !m.disabled;
    this.save();
  }
  toggleMeasureSort({ id }) {
    let m = find(this.measures, { id });
    switch (m.sort) {
      case 'none':
        m.sort = 'descending';
        break;
      case 'descending':
        m.sort = 'ascending';
        break;
      case 'ascending':
        m.sort = 'none';
        break;
    }
    this.log('toggled measure sort', m.field);
    this.save();
  }
  setMeasureSort({ id }, sort) {
    let m = find(this.measures, { id });
    m.sort = sort;
    this.log('set measure sort', sort);
    this.save();
  }
  setMeasureType({ id }, type) {
    let m = find(this.measures, { id });
    m.type = type;
    this.log('set measure type', type);
    this.save();
  }
  setMeasureFormat({ id }, format) {
    let m = find(this.measures, { id });
    m.format = format;
    this.log('set measure format', format);
    this.save();
  }
  // measure filters/thresholds
  getMeasureThresholds({ id }) {
    let d = find(this.measures, { id });
    return d.thresholds;
  }
  addMeasureThreshold(measure, {
    op,     // filter operation
    value,  // value for operation
  }) {
    let d = find(this.measures, { id: measure.id });
    let threshold = {
      id: RandomOps.generateId(8),
      op,
      value,
    };
    d.thresholds.push(threshold);
    this.log('added measure threshold', d.field, threshold);
    this.save();
  }
  updateMeasureThreshold(measure, threshold, update) {
    let d = find(this.measures, { id: measure.id });
    let f = find(d.thresholds, { id: threshold.id });
    Object.assign(f, update);
    this.save();
  }
  removeMeasureThreshold(measure, threshold) {
    let d = find(this.measures, { id: measure.id });
    let idx = findIndex(d.thresholds, { id: threshold.id });
    d.thresholds.splice(idx, 1);
    this.save();
  }
  // measure transforms
  addMeasureTransform(measure, {
    op,     // transform operation
    param,  // value for operation
    color,  // optional color for colorizing ops
  }) {
    let d = find(this.measures, { id: measure.id });
    let transform = {
      id: RandomOps.generateId(8),
      op,
      param,
      color,
    };
    d.transforms.push(transform);
    this.log('added measure transform', d.field, transform);
    this.save();
  }
  updateMeasureTransform(measure, transform, update) {
    let d = find(this.measures, { id: measure.id });
    let f = find(d.transforms, { id: transform.id });
    Object.assign(f, update);
    this.save();
  }
  removeMeasureTransform(measure, transform) {
    let d = find(this.measures, { id: measure.id });
    let idx = findIndex(d.transforms, { id: transform.id });
    d.transforms.splice(idx, 1);
    this.save();
  }
}
