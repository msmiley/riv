import * as d3 from 'd3';

export default {
  // this is called as a function to generate a color based on the provided
  // parameter, currently proxies to d3's function
  colorGenerator: d3.scaleOrdinal([...Array(10).keys()], d3.schemeDark2),

};
