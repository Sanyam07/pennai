import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js/dist/plotly';

class BoxPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidMount() {
    this.createBoxPlot();
  }

  // from - https://www.d3-graph-gallery.com/graph/boxplot_basic.html
  createBoxPlot(){
    const { dataPreview, valByRowObj, rawKey, cleanKey } = this.props;
    let margin = { top: 5, right: 60, bottom: 50, left: 85 },
        width = 425 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // to make background of svg transparent set stroke & fill to none
    // or do not specify background color
    let svg = d3.select("#test_box_plot_" + cleanKey)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("stroke", "none")
    .style("fill", "none")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // First step: sort values in dataset - https://github.com/d3/d3-array#ascending
    let data_sorted = valByRowObj[rawKey].sort(d3.ascending);

    let q1 = d3.quantile(data_sorted, .25);
    let median = d3.median(data_sorted);
    let q3 = d3.quantile(data_sorted, .75);
    let interQuantileRange = q3 - q1;
    let min = q1 - (1.5 * interQuantileRange);
    let max = q3 + (1.5 * interQuantileRange);
    let minData = Math.min(...data_sorted);
    let maxData = Math.max(...data_sorted);

    // use minimum/max values in data as lower & upper bounds for whisker lines
    min < minData ? min = minData : null;
    max > maxData ? max = maxData : null;

    // color scale for jitter points
    let myColor = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([min, max]);

    // Y scale - use .domain([rawKey]) to show y-axis label
    let yScale = d3.scaleBand()
      .range([height, 0])
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .style("color", "white")
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain").remove()
    // X scale
    let xScale = d3.scaleLinear()
      .domain([min, max])
      .range([0, width]);
    svg.append("g")
      .attr("stroke", "white")
      .style("color", "white")
      .call(d3.axisBottom(xScale))
      .attr("transform", "translate(0," + (height) + ")")
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // box features
    let center = 150;
    width = 100;
    // main vertical line
    svg.append("line")
      .attr("y1", center)
      .attr("y2", center)
      .attr("x1", xScale(min) )
      .attr("x2", xScale(max) )
      .attr("stroke", "white");

    // Show the box
    svg.append("rect")
      .attr("x", xScale(q1))
      .attr("y", center - width/2 )
      .attr("height",  width)
      .attr("width", (xScale(q3)-xScale(q1)) )
      .attr("stroke", "white")
      .style("fill", "#1678c2")

    // show median, min and max horizontal lines
    svg.selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
      .attr("y1", center-width/2)
      .attr("y2", center+width/2)
      .attr("x1", function(d){ return(xScale(d))} )
      .attr("x2", function(d){ return(xScale(d))} )
      .attr("stroke", "white");

    let statisticsObj = {
      q1: q1 ? q1 : undefined,
      q3: q3 ? q3 : undefined,
      median: median ? median : undefined,
      min: min ? min : undefined,
      max: max ? max : undefined,
      min_val_in_data: minData ? minData : undefined,
      max_val_in_data: maxData ? maxData : undefined
    };

    return statisticsObj;
  }

  render() {
    const {cleanKey, valByRowObj, rawKey} = this.props;

    let testForPlotly = [{
      x: valByRowObj[rawKey],
      type: 'box',
      marker: {color: 'rgb(22, 120, 194)'},
      name: rawKey,
      title: {
        text: cleanKey,
        font: {
          family: 'Courier New, monospace',
          size: 12,
          color: 'white'
        }
      },
      boxpoints: false,
      boxmean: 'sd'
    }];
    const optBtnsToRemove = [
      'toImage',
      'sendDataToCloud'
    ];
    const boxPlotConfig = {
      displaylogo: false,
      modeBarButtonsToRemove: optBtnsToRemove
    };
   //use pretty much any html font/css style with certain parts of chart
    const plotLayout = {
      font: {
        family: 'Courier New, monospace',
        size: 1,
        color: 'white'
      },
      xaxis: {
        showticklabels: true,
        gridcolor: 'white',
        zerolinecolor: 'white',
        tickangle: 'auto',
        tickfont: {
         family: 'Oswald, sans-serif',
         size: 9,
         color: 'white'
        },
        exponentformat: 'e',
        showexponent: 'all'
      },
      yaxis: {
        gridcolor: 'white'
      },
      width: 500,
      height: 375,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: false
    };

    return (
      <div>
        <div id={"test_box_plot_" + cleanKey} style={{position:'relative', left:'-100px'}}/>
        <Plot
          style={{position:'relative', left:'-100px'}}
          data={testForPlotly}
          layout={plotLayout}
          config={boxPlotConfig}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BoxPlot };
export default connect(mapStateToProps, {})(BoxPlot);

// export helper method for unit test
export function createBoxPlotStatsTest(valByRowObj={'test':[0]}, rawKey='test'){

  valByRowObj[rawKey] = Object.values(valByRowObj[rawKey]);
  let data_sorted = valByRowObj[rawKey].sort(d3.ascending);

  let q1 = d3.quantile(data_sorted, .25);
  let median = d3.median(data_sorted);
  let q3 = d3.quantile(data_sorted, .75);
  let interQuantileRange = q3 - q1;
  let min = q1 - (1.5 * interQuantileRange);
  let max = q3 + (1.5 * interQuantileRange);

  let minData = Math.min(...data_sorted);
  let maxData = Math.max(...data_sorted);

  min < minData ? min = minData : null;
  max > maxData ? max = maxData : null;

  let statisticsObj = {
    q1: q1 ? q1 : undefined,
    q3: q3 ? q3 : undefined,
    median: median ? median : undefined,
    min: min ? min : undefined,
    max: max ? max : undefined,
    min_val_in_data: minData ? minData : undefined,
    max_val_in_data: maxData ? maxData : undefined
  };

  return statisticsObj;
}