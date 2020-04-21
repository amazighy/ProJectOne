import {
    select,
    pie,
    arc,
    scaleOrdinal,
    legendColor,
    tip,
    interpolate,
  } from 'd3';


  const dims = { height: 300, width: 300, radius: 115};
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5)};

// create svg container
const svg = select('.bottom')
  .append('svg')
  .attr('class', 'tot')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150);

const graph = svg.append('g')
  .attr("transform", `translate(${cent.x+65}, ${cent.y-20})`);
  // translates the graph group to the middle of the svg container

const pieFunc = pie()
  .sort(null)
  .value(d => d.Total);
  // the value we are evaluating to create the pie angles

const arcPath = arc()
  .outerRadius(dims.radius)
 .innerRadius(dims.radius/dims.radius);

// ordinal colour scale
const colour = scaleOrdinal(['#662506','#fee391']);

// legend setup
const legendGroup = svg.append('g')
  .attr('transform', `translate(${20},${cent.y+50})`)

const legend = legendColor()
.shapeWidth(25)
.orient('vertical')
  .shapePadding(7)
  .scale(colour);

const tipFunc = tip()
  .attr('class', 'tip card')
  .html(d => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost"> Total Deaths: ${d.data.Total}</div>`;
    return content;
   
  });

graph.call(tipFunc);



// update function
export const pieChartT= (data) => {

  // update colour scale domain
  colour.domain(data.map(d => d.name));

 

  // update legend
  legendGroup.call(legend);
  legendGroup.selectAll('text').attr('opacity', 7);
  
  // join enhanced (pie) data to path elements
  const paths = graph.selectAll('path')
    .data(pieFunc(data));

  // handle the exit selection 
  paths.exit()
    .transition().duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

  // handle the current DOM path updates
  paths.transition().duration(750)
    .attrTween("d", arcTweenUpdate);

  paths.enter()
    .append('path')
      .attr('class', 'arc')
      .attr('stroke', '#ec7014')
      .attr('stroke-width', 1)
      .attr('d', arcPath)
      .attr('fill', d => colour(d.data.name))
      .each(function(d){ this._current = d })
      .transition().duration(750).attrTween("d", arcTweenEnter);

  // add events
  graph.selectAll('path')
    .on('mouseover', (d,i,n) => {
      tipFunc.show(d, n[i]);
      handleMouseOver(d, i, n);
    })
    .on('mouseout', (d,i,n) => {
      tipFunc.hide();
      handleMouseOut(d, i, n);
    })
    // .on('click', handleClick);

};



const arcTweenEnter = (d) => {
  var i = interpolate(d.endAngle-0.1, d.startAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  var i = interpolate(d.startAngle, d.endAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
  // interpolate between the two objects
  var i = interpolate(this._current, d);
  // update the current prop with new updated data
  this._current = i(1);

  return function(t) {
    // i(t) returns a value of d (data object) which we pass to arcPath
    return arcPath(i(t));
  };
};

// event handlers
const handleMouseOver = (d,i,n) => {
  //console.log(n[i]);
  select(n[i])
    .transition('changeSliceFill').duration(300)
      .attr('fill', '#fe9929');
};

const handleMouseOut = (d,i,n) => {
  //console.log(n[i]);
  select(n[i])
    .transition('changeSliceFill').duration(300)
      .attr('fill', colour(d.data.name));
      console.log(d.data.name)
};









  
