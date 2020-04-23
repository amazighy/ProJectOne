import {
  select,
  scaleTime,
  scaleLinear,
  line,
  extent,
  max,
  axisBottom,
  timeFormat,
  axisLeft,
  tip,
 
} from 'd3';


const margin = { top: 40, right: 30, bottom: 40, left: 50 };
const graphWidth = 400 - margin.right - margin.left;
const graphHeight = 280 - margin.top - margin.bottom;

const lineChart = select('.top')
  .append('svg')
  .attr('class', 'tot')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom);

const graph = lineChart.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top-35})`);

// axes groups
const xAxisGroup = graph.append('g')
  .attr('class', 'x-axis')
  .attr('transform', "translate(0," + graphHeight + ")")

const yAxisGroup = graph.append('g')
  .attr('class', 'y-axis');

// line path generator
const linen = line()
  .x(d=>x(new Date(d.date)))
  .y(d=>y(d.total_deaths));

// line path element
const path = graph.append('path');

//   const Title= graph.append('text')
//   .attr('class', 'Title')
//   .attr('opacity',0)
//   .attr('y',-8)
//   .attr('fill', 'black')
//   .text('Daily confirmed Deaths')
// create dotted line group and append to graph
const dottedLines = graph.append('g')
  .attr('class', 'lines')
  .style('opacity', 0);

// create x dotted line and append to dotted line group
const xDottedLine = dottedLines.append('line')
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 4);

// create y dotted line and append to dotted line group
const yDottedLine = dottedLines.append('line')
  .attr('stroke', '#aaa')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', 4);
// scales
const x = scaleTime().range([0, graphWidth]);
const y = scaleLinear().range([graphHeight, 0]);


const tipCircle = tip()
  .attr('class', 'tip card')
  .html(d => {
    let content = `<div class="name"> Date:${moment(d.date).utc().format("ddd MMM Do")}</div>`;
    content += `<div class="cost"> Dialy Deaths:${d.total_deaths} </div>`;
    
    return content;
  });
  graph.call(tipCircle);



export const LineChartT = (data) => {
  // Title.attr('opacity',1)

  // sort the data based on date objects
  data.sort((a,b) => new Date(a.date) - new Date(b.date));

  // set scale domains
  x.domain(extent(data, d => new Date(d.date)));
  y.domain([0, max(data, d =>  d.total_deaths)]);

  // update path data
  path.data([data])
    .attr('fill', 'none')
    .attr('stroke', '#f5b951')
    .attr('stroke-width', '2')
    .attr('d', linen);

  // create circles for points
  const circles = graph.selectAll('circle')
    .data(data);

  // remove unwanted points
  circles.exit().remove();

  // update current points
  circles.attr('r', '2')
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.total_deaths));

  // add new points
  circles.enter()
    .append('circle')
      .attr('r', '2')
      .attr('cx', d => x(new Date(d.date)))
      .attr('cy', d => y(d.total_deaths))
      .attr('fill', '#ec7014')
      .attr('stroke', '#ec7014');

  // add event listeners to circle (and show dotted lines)
  graph.selectAll('circle')
    .on('mouseover', (d, i, n) => {
      select(n[i])
        .transition().duration(100)
        .attr('r', 5)
        .attr('fill', '#662506');
        tipCircle.show(d, n[i]);
  
      // set x dotted line coords (x1,x2,y1,y2)
      xDottedLine
        .attr('x1', x(new Date(d.date)))
        .attr('x2', x(new Date(d.date)))
        .attr('y1', graphHeight)
        .attr('y2', y(d.total_deaths));
      // set y dotted line coords (x1,x2,y1,y2)
      yDottedLine
        .attr('x1', 0)
        .attr('x2', x(new Date(d.date)))
        .attr('y1', y(d.total_deaths))
        .attr('y2', y(d.total_deaths));
      // show the dotted line group (opacity)
      dottedLines.style('opacity', 1);
    })
    .on('mouseleave', (d,i,n) => {
      select(n[i])
        .transition().duration(100)
        .attr('r', 2)
        .attr('fill', '#ec7014')
      tipCircle.hide();
     
      // hide the dotted line group (opacity)
      dottedLines.style('opacity', 0)
    });

  // create axes
  const xAxis = axisBottom(x)
    .ticks(4)
    .tickFormat(timeFormat("%b %d"));
    
  const yAxis = axisLeft(y)
    .ticks(4)
    .tickFormat(d => d )
    ;

  // call axes
  xAxisGroup.call(xAxis)
  .selectAll('.domain')
  .remove();;

  yAxisGroup.call(yAxis)
  .selectAll('.domain, .tick line')
  .remove();

  // rotate axis text
  xAxisGroup.selectAll('text')
    // .attr('transform', 'rotate(-40)')
    // .attr('text-anchor', 'end');

};
