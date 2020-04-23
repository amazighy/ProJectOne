(function (d3, topojson) {
  'use strict';

  const loadAndProcessData = () => 
    Promise
      .all([
        d3.tsv('../data/CovidData.tsv'),
        d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json'),
      ])
      .then(([tsvData, topoJSONdata]) => {
     
        const rowById = tsvData.reduce((accumulator, d) => {
          accumulator[d.MapID] = d;
          return accumulator;
        }, {});
         
        tsvData.forEach(d => {
          d.Catog = +d.Catog;
          d.Total = +d.Total;
          d.Daily = +d.Daily;
        });
       
        console.log(tsvData);

        const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

        countries.features.forEach(d => {
          Object.assign(d.properties, rowById[d.id]);
        });

        return countries;
      });

  const colorLegend = (selection, props) => {
    const {
      colorScale,
      recHeight,
      recWidth,
      textOffset,
      onClick,
      selectedColorValue
    } = props;

    const groups = selection.selectAll('g')
      .data(colorScale.domain());
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'tick');
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) => `translate( ${i * recWidth+43},120)`)
        .attr('opacity', d => 
          (! selectedColorValue || d === selectedColorValue )
          ? 1
          : 0.2)
        .on('click', d => onClick(
          d === selectedColorValue
          ? null
          : d)
        )
        ;

    groups.exit().remove();

    groupsEnter.append('rect')
      .merge(groups.select('rect'))
        .attr("width",recWidth)
        .attr("height", recHeight)
        .attr('fill', colorScale);

    groupsEnter.append('text')
      .merge(groups.select('text'))
        .text(d => d)
        .attr('dy', '3.1em')
        .attr('x', textOffset);

    selection.append('text')
    .merge(groups.select('text'))
      .attr('class', 'foo')
      .text('0')
      .attr('opacity',0.5 )
      .attr('dy', '17.4em')
      .attr('x', recWidth+3);

    selection.append('text')
    .merge(groups.select('text'))
      .attr('class', 'foo')
      .text('Source :compiled by Our World in Data using official sources')
      .attr('opacity',0.5 )
      .attr('dy', '19.4em')
      .attr('x', recWidth*8);

  selection.append('text')
    .merge(groups.select('text'))
      .attr('class', 'foo')
      .text('Filter by catagory')
      .attr('opacity',0.5 )
      .attr('dy', '13.4em')
      .attr('x', recWidth*5);
  };

  const projection = d3.geoNaturalEarth1();
  const pathGenerator = d3.geoPath().projection(projection);

  const choroplethMap = (selection, props) => {
      const {features,
          colorScale,
          colorValue,
          selectedColorValue,
          onCountryClick
      } = props;

    

  const gUpdate = selection.selectAll('g').data([null]);
  const gEnter = gUpdate.enter().append('g');
  const g= gUpdate.merge(gEnter);


      selection.call(d3.zoom().on('zoom', () => {
      g.attr('transform', d3.event.transform);
    }));
  const countryPaths= g.selectAll('path')
          .data(features);

          const Title= selection.append('text')
          .attr('class', 'Title')
          // .attr('opacity',0)
          .attr('y',35)
          .attr('x', 470)
          .attr('fill', 'black')
          .text('Confirmed COVID-19 deaths');

  const countryPathsEnter=countryPaths
      .enter().append('path')
          .attr('class', 'country')
          .attr('transform', `translate(-45,100)`);
      const tipF = d3.tip()
      .attr('class', 'tip card')
      .html(d => {
          let content = `<div class="name">${d.properties.location }</div>`;
          content += `<div class="cost"> Total Deaths: ${+d.properties.total_deaths}</div>`;
          content += `<div class="cost"> Daily Deaths: ${+d.properties.new_deaths}</div>`;
          content += `<div class="cost"> New  Cases: ${+d.properties.new_cases}</div>`;
          content += `<div class="cost"> Total Cases: ${+d.properties.total_cases}</div>`;
          content += `<div class="more">Click for details</div>`;
          return content ;
      });

  countryPathsEnter.call(tipF);
      

  countryPaths    
      .merge(countryPathsEnter)
          .attr('d', pathGenerator)
          .attr('fill',  d=> colorScale(colorValue(d)))
          .attr('opacity', d=>
          (!selectedColorValue || selectedColorValue=== colorValue(d))
          ? 1
          : 0.2
          )
          .classed('highlighted',d=> 
          selectedColorValue && selectedColorValue === colorValue(d))
          .on('click', (d) =>{
              onCountryClick(d);
          });

      countryPathsEnter
          .on('mouseover', (d,i,n) => {
          tipF.show(d, n[i]);
          })
          .on('mouseout', (d) => {
              tipF.hide();
          });
  };

  const margin = { top: 40, right: 30, bottom: 40, left: 50 };
    const graphWidth = 400 - margin.right - margin.left;
    const graphHeight = 280 - margin.top - margin.bottom;
    
    const lineChart = d3.select('.top')
      .append('svg')
      .attr('class', 'dai')
      .attr('width', graphWidth + margin.left + margin.right)
      .attr('height', graphHeight + margin.top + margin.bottom);
    
    const graph = lineChart.append('g')
      .attr('width', graphWidth)
      .attr('height', graphHeight)
      .attr('transform', `translate(${margin.left}, ${margin.top-35})`);
   
    // axes groups
    const xAxisGroup = graph.append('g')
      .attr('class', 'x-axis')
      .attr('transform', "translate(0," + graphHeight + ")");
    
    const yAxisGroup = graph.append('g')
      .attr('class', 'y-axis');
    
    // line path generator
    const linen = d3.line()
      .x(d=>x(new Date(d.date)))
      .y(d=>y(d.new_deaths));
    
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
  const x = d3.scaleTime().range([0, graphWidth]);
  const y = d3.scaleLinear().range([graphHeight, 0]);

  const tipCircleD = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
      let content = `<div class="name">Date: ${moment(d.date).format("ddd MMM Mo")}</div>`;
      content += `<div class="cost"> Daily Deaths:${d.new_deaths} </div>`;
      
      return content;
    });
    graph.call(tipCircleD);


  const LineChartD = (data) => {
      // Title.attr('opacity',1)
    
      // sort the data based on date objects
      data.sort((a,b) => new Date(a.date) - new Date(b.date));
    
      // set scale domains
      x.domain(d3.extent(data, d => new Date(d.date)));
      y.domain([0, d3.max(data, d =>  d.new_deaths)]);
    
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
        .attr('cy', d => y(d.new_deaths));
    
      // add new points
      circles.enter()
        .append('circle')
          .attr('r', '2')
          .attr('cx', d => x(new Date(d.date)))
          .attr('cy', d => y(d.new_deaths))
          .attr('fill', '#ec7014')
          .attr('stroke', '#ec7014');
    
      // add event listeners to circle (and show dotted lines)
      graph.selectAll('circle')
        .on('mouseover', (d, i, n) => {
          d3.select(n[i])
            .transition().duration(100)
            .attr('r', 5)
            .attr('fill', '#662506');

            tipCircleD.show(d, n[i]);
         
          // set x dotted line coords (x1,x2,y1,y2)
          xDottedLine
            .attr('x1', x(new Date(d.date)))
            .attr('x2', x(new Date(d.date)))
            .attr('y1', graphHeight)
            .attr('y2', y(d.new_deaths));
          // set y dotted line coords (x1,x2,y1,y2)
          yDottedLine
            .attr('x1', 0)
            .attr('x2', x(new Date(d.date)))
            .attr('y1', y(d.new_deaths))
            .attr('y2', y(d.new_deaths));
          // show the dotted line group (opacity)
          dottedLines.style('opacity', 1);
        })
        .on('mouseleave', (d,i,n) => {
          d3.select(n[i])
            .transition().duration(100)
            .attr('r', 2)
            .attr('fill', '#ec7014');
           tipCircleD.hide();
         
          // hide the dotted line group (opacity)
          dottedLines.style('opacity', 0);
        });
    
      // create axes
      const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat("%b %d"));
        
      const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d )
        ;
    
      // call axes
      xAxisGroup.call(xAxis)
      .selectAll('.domain')
      .remove();  
      yAxisGroup.call(yAxis)
      .selectAll('.domain, .tick line')
      .remove();
    
      // rotate axis text
      xAxisGroup.selectAll('text');
        // .attr('transform', 'rotate(-40)')
        // .attr('text-anchor', 'end');
    
    };

  const dims = { height: 300, width: 300, radius: 115};
  const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5)};

  // create svg container
  const svg = d3.select('.bottom')
    .append('svg')
    .attr('class', 'dai')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150);

  const graph$1 = svg.append('g')
    .attr("transform", `translate(${cent.x+65}, ${cent.y-20})`);
    // translates the graph group to the middle of the svg container

  const pieFunc = d3.pie()
    .sort(null)
    .value(d => d.Daily);
    // the value we are evaluating to create the pie angles

  const arcPath = d3.arc()
    .outerRadius(dims.radius)
   .innerRadius(dims.radius/dims.radius);

  // ordinal colour scale
  const colour = d3.scaleOrdinal(['#662506','#fee391']);

  // legend setup
  const legendGroup = svg.append('g')
    .attr('transform', `translate(${20},${cent.y+50})`);

  const legend = d3.legendColor()
  .shapeWidth(25)
  .orient('vertical')
    .shapePadding(7)
    .scale(colour);

  const tipFunc = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
      let content = `<div class="name">${d.data.name}</div>`;
      content += `<div class="cost"> Dialy Deaths: ${d.data.Daily}</div>`;
      
      return content;
    });

  graph$1.call(tipFunc);



  // update function
  const pieChartD= (data) => {

    // update colour scale domain
    colour.domain(data.map(d => d.name));

   

    // update legend
    legendGroup.call(legend);
    legendGroup.selectAll('text').attr('opacity', 7);
    
    // join enhanced (pie) data to path elements
    const paths = graph$1.selectAll('path')
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
        .each(function(d){ this._current = d; })
        .transition().duration(750).attrTween("d", arcTweenEnter);

    // add events
    graph$1.selectAll('path')
      .on('mouseover', (d,i,n) => {
        tipFunc.show(d, n[i]);
        handleMouseOver(d, i, n);
      })
      .on('mouseout', (d,i,n) => {
        tipFunc.hide();
        handleMouseOut(d, i, n);
      });
      // .on('click', handleClick);

  };



  const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle-0.1, d.startAngle);

    return function(t) {
      d.startAngle = i(t);
      return arcPath(d);
    };
  };

  const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function(t) {
      d.startAngle = i(t);
      return arcPath(d);
    };
  };

  // use function keyword to allow use of 'this'
  function arcTweenUpdate(d) {
    // interpolate between the two objects
    var i = d3.interpolate(this._current, d);
    // update the current prop with new updated data
    this._current = i(1);

    return function(t) {
      // i(t) returns a value of d (data object) which we pass to arcPath
      return arcPath(i(t));
    };
  }
  // event handlers
  const handleMouseOver = (d,i,n) => {
    //console.log(n[i]);
    d3.select(n[i])
      .transition('changeSliceFill').duration(300)
        .attr('fill', '#fe9929');
  };

  const handleMouseOut = (d,i,n) => {
    //console.log(n[i]);
    d3.select(n[i])
      .transition('changeSliceFill').duration(300)
        .attr('fill', colour(d.data.name));
        console.log(d.data.name);
  };

  function renderDaily(d){
      function reSize() {
        $('#map').removeClass('col-lg-12');
        $('#map').addClass('col-lg-8');
        $('#charts').removeClass('col-lg-0');
        $('#charts').addClass('col-lg-4');
    }  reSize(); 
    
        const countryName = d.properties.location; 
        const coutryDaily= + d.properties.new_deaths; 
        const codes = String(d.properties.location);
    
        Promise
        .all([
          d3.tsv('../data/CovidData.tsv'),
          d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/full_data.csv"),
        ])
        .then(([tsvData, csvData]) => {
        
          tsvData.forEach(d => {
              d.new_deaths = +d.new_deaths;
          });

          const sum =  tsvData.reduce((s, a) => s + a.new_deaths, 0);

          var country={ name:'', Daily:0};
          var world={ name:'Rest of The World', Daily:0};
          country.name=countryName;
          country.Daily=coutryDaily;
          world.Daily=sum-coutryDaily;
          var data=[country,world];
        
          csvData.forEach(d => {
              d.date  = new Date(d.date);
              d.new_deaths = +d.new_deaths;
    
              csvData = csvData.filter(item => item.location ==codes );
            });
            
            pieChartD(data);
            LineChartD(csvData);
    
          });
    
          }

  const margin$1 = { top: 40, right: 30, bottom: 40, left: 50 };
  const graphWidth$1 = 400 - margin$1.right - margin$1.left;
  const graphHeight$1 = 280 - margin$1.top - margin$1.bottom;

  const lineChart$1 = d3.select('.top')
    .append('svg')
    .attr('class', 'tot')
    .attr('width', graphWidth$1 + margin$1.left + margin$1.right)
    .attr('height', graphHeight$1 + margin$1.top + margin$1.bottom);

  const graph$2 = lineChart$1.append('g')
    .attr('width', graphWidth$1)
    .attr('height', graphHeight$1)
    .attr('transform', `translate(${margin$1.left}, ${margin$1.top-35})`);

  // axes groups
  const xAxisGroup$1 = graph$2.append('g')
    .attr('class', 'x-axis')
    .attr('transform', "translate(0," + graphHeight$1 + ")");

  const yAxisGroup$1 = graph$2.append('g')
    .attr('class', 'y-axis');

  // line path generator
  const linen$1 = d3.line()
    .x(d=>x$1(new Date(d.date)))
    .y(d=>y$1(d.total_deaths));

  // line path element
  const path$1 = graph$2.append('path');

  //   const Title= graph.append('text')
  //   .attr('class', 'Title')
  //   .attr('opacity',0)
  //   .attr('y',-8)
  //   .attr('fill', 'black')
  //   .text('Daily confirmed Deaths')
  // create dotted line group and append to graph
  const dottedLines$1 = graph$2.append('g')
    .attr('class', 'lines')
    .style('opacity', 0);

  // create x dotted line and append to dotted line group
  const xDottedLine$1 = dottedLines$1.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);

  // create y dotted line and append to dotted line group
  const yDottedLine$1 = dottedLines$1.append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);
  // scales
  const x$1 = d3.scaleTime().range([0, graphWidth$1]);
  const y$1 = d3.scaleLinear().range([graphHeight$1, 0]);


  const tipCircle = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
      let content = `<div class="name"> Date:${moment(d.date).format("ddd MMM Mo")}</div>`;
      content += `<div class="cost"> Dialy Deaths:${d.total_deaths} </div>`;
      
      return content;
    });
    graph$2.call(tipCircle);



  const LineChartT = (data) => {
    // Title.attr('opacity',1)

    // sort the data based on date objects
    data.sort((a,b) => new Date(a.date) - new Date(b.date));

    // set scale domains
    x$1.domain(d3.extent(data, d => new Date(d.date)));
    y$1.domain([0, d3.max(data, d =>  d.total_deaths)]);

    // update path data
    path$1.data([data])
      .attr('fill', 'none')
      .attr('stroke', '#f5b951')
      .attr('stroke-width', '2')
      .attr('d', linen$1);

    // create circles for points
    const circles = graph$2.selectAll('circle')
      .data(data);

    // remove unwanted points
    circles.exit().remove();

    // update current points
    circles.attr('r', '2')
      .attr('cx', d => x$1(new Date(d.date)))
      .attr('cy', d => y$1(d.total_deaths));

    // add new points
    circles.enter()
      .append('circle')
        .attr('r', '2')
        .attr('cx', d => x$1(new Date(d.date)))
        .attr('cy', d => y$1(d.total_deaths))
        .attr('fill', '#ec7014')
        .attr('stroke', '#ec7014');

    // add event listeners to circle (and show dotted lines)
    graph$2.selectAll('circle')
      .on('mouseover', (d, i, n) => {
        d3.select(n[i])
          .transition().duration(100)
          .attr('r', 5)
          .attr('fill', '#662506');
          tipCircle.show(d, n[i]);
    
        // set x dotted line coords (x1,x2,y1,y2)
        xDottedLine$1
          .attr('x1', x$1(new Date(d.date)))
          .attr('x2', x$1(new Date(d.date)))
          .attr('y1', graphHeight$1)
          .attr('y2', y$1(d.total_deaths));
        // set y dotted line coords (x1,x2,y1,y2)
        yDottedLine$1
          .attr('x1', 0)
          .attr('x2', x$1(new Date(d.date)))
          .attr('y1', y$1(d.total_deaths))
          .attr('y2', y$1(d.total_deaths));
        // show the dotted line group (opacity)
        dottedLines$1.style('opacity', 1);
      })
      .on('mouseleave', (d,i,n) => {
        d3.select(n[i])
          .transition().duration(100)
          .attr('r', 2)
          .attr('fill', '#ec7014');
        tipCircle.hide();
       
        // hide the dotted line group (opacity)
        dottedLines$1.style('opacity', 0);
      });

    // create axes
    const xAxis = d3.axisBottom(x$1)
      .ticks(4)
      .tickFormat(d3.timeFormat("%b %d"));
      
    const yAxis = d3.axisLeft(y$1)
      .ticks(4)
      .tickFormat(d => d )
      ;

    // call axes
    xAxisGroup$1.call(xAxis)
    .selectAll('.domain')
    .remove();
    yAxisGroup$1.call(yAxis)
    .selectAll('.domain, .tick line')
    .remove();

    // rotate axis text
    xAxisGroup$1.selectAll('text');
      // .attr('transform', 'rotate(-40)')
      // .attr('text-anchor', 'end');

  };

  const dims$1 = { height: 300, width: 300, radius: 115};
  const cent$1 = { x: (dims$1.width / 2 + 5), y: (dims$1.height / 2 + 5)};

  // create svg container
  const svg$1 = d3.select('.bottom')
    .append('svg')
    .attr('class', 'tot')
    .attr('width', dims$1.width + 150)
    .attr('height', dims$1.height + 150);

  const graph$3 = svg$1.append('g')
    .attr("transform", `translate(${cent$1.x+65}, ${cent$1.y-20})`);
    // translates the graph group to the middle of the svg container

  const pieFunc$1 = d3.pie()
    .sort(null)
    .value(d => d.Total);
    // the value we are evaluating to create the pie angles

  const arcPath$1 = d3.arc()
    .outerRadius(dims$1.radius)
   .innerRadius(dims$1.radius/dims$1.radius);

  // ordinal colour scale
  const colour$1 = d3.scaleOrdinal(['#662506','#fee391']);

  // legend setup
  const legendGroup$1 = svg$1.append('g')
    .attr('transform', `translate(${20},${cent$1.y+50})`);

  const legend$1 = d3.legendColor()
  .shapeWidth(25)
  .orient('vertical')
    .shapePadding(7)
    .scale(colour$1);

  const tipFunc$1 = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
      let content = `<div class="name">${d.data.name}</div>`;
      content += `<div class="cost"> Total Deaths: ${d.data.Total}</div>`;
      return content;
      
     
    });

  graph$3.call(tipFunc$1);



  // update function
  const pieChartT= (data) => {

    // update colour scale domain
    colour$1.domain(data.map(d => d.name));

   

    // update legend
    legendGroup$1.call(legend$1);
    legendGroup$1.selectAll('text').attr('opacity', 7);
    
    // join enhanced (pie) data to path elements
    const paths = graph$3.selectAll('path')
      .data(pieFunc$1(data));

    // handle the exit selection 
    paths.exit()
      .transition().duration(750)
      .attrTween("d", arcTweenExit$1)
      .remove();

    // handle the current DOM path updates
    paths.transition().duration(750)
      .attrTween("d", arcTweenUpdate$1);

    paths.enter()
      .append('path')
        .attr('class', 'arc')
        .attr('stroke', '#ec7014')
        .attr('stroke-width', 1)
        .attr('d', arcPath$1)
        .attr('fill', d => colour$1(d.data.name))
        .each(function(d){ this._current = d; })
        .transition().duration(750).attrTween("d", arcTweenEnter$1);

    // add events
    graph$3.selectAll('path')
      .on('mouseover', (d,i,n) => {
        tipFunc$1.show(d, n[i]);
        handleMouseOver$1(d, i, n);
      })
      .on('mouseout', (d,i,n) => {
        tipFunc$1.hide();
        handleMouseOut$1(d, i, n);
      });
      // .on('click', handleClick);

  };



  const arcTweenEnter$1 = (d) => {
    var i = d3.interpolate(d.endAngle-0.1, d.startAngle);
    return function(t) {
      d.startAngle = i(t);
      return arcPath$1(d);
    };
  };

  const arcTweenExit$1 = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function(t) {
      d.startAngle = i(t);
      return arcPath$1(d);
    };
  };

  // use function keyword to allow use of 'this'
  function arcTweenUpdate$1(d) {
    // interpolate between the two objects
    var i = d3.interpolate(this._current, d);
    // update the current prop with new updated data
    this._current = i(1);

    return function(t) {
      // i(t) returns a value of d (data object) which we pass to arcPath
      return arcPath$1(i(t));
    };
  }
  // event handlers
  const handleMouseOver$1 = (d,i,n) => {
    //console.log(n[i]);
    d3.select(n[i])
      .transition('changeSliceFill').duration(300)
        .attr('fill', '#fe9929');
  };

  const handleMouseOut$1 = (d,i,n) => {
    //console.log(n[i]);
    d3.select(n[i])
      .transition('changeSliceFill').duration(300)
        .attr('fill', colour$1(d.data.name));
        console.log(d.data.name);
  };

  function renderTotal(d){
    //   function reSize() {
    //     $('#map').removeClass('col-lg-12');
    //     $('#map').addClass('col-lg-8');
    //     $('#charts').removeClass('col-lg-0');
    //     $('#charts').addClass('col-lg-4');
    // };
    // reSize() 
    
        const countryName = d.properties.location; 
        const coutryTotal= + d.properties.total_deaths; 
        const codes = String(d.properties.location);
    
        Promise
        .all([
          d3.tsv('../data/CovidData.tsv'),
          d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/full_data.csv"),
        ])
        .then(([tsvData, csvData]) => {
          //
          tsvData.forEach(d => {
              d.total_deaths = +d.total_deaths;
          });

          const sum =  tsvData.reduce((s, a) => s + a.total_deaths, 0);
          var country={ name:'', Total:0};
          var world={ name:'Rest of The World', Total:0};
          country.name=countryName;
          country.Total=coutryTotal;
          world.Total=sum-coutryTotal;
          var data=[country,world];
        
          csvData.forEach(d => {
              d.date  = new Date(d.date);
              d.total_deaths = +d.total_deaths;
    
              csvData = csvData.filter(item => item.location ==codes );
              
            });
            console.log(csvData);
            pieChartT(data);
            LineChartT(csvData);
    
          });
    
        }

  const svg$2 = d3.select('.map')
      .append('svg')
      .attr('height', 600)
      .attr('width', 900)
      .attr('transform', `translate(-50,0)`);

  const choroplethMapG = svg$2.append('g');
  const colorLegendG = svg$2.append('g')
    .attr('transform', `translate(370,410)`);

    
  const colorScale = d3.scaleOrdinal(d3.schemeYlOrBr[7]);
  const colorValue = d=> d.properties.Catog;

  // state 
  let selectedColorValue;
  let features;


  const onClick = d =>{
  selectedColorValue=d;
  render();
  };
  let TotalOutSide;
  $("#total").click(()=>TotalOutSide = true);
  (TotalOutSide == true) ? $('.tot').show(): $('.tot').hide();


  $('.popup-close').click(()=> {
    $('html, body').animate({
      scrollTop: '0px'
    });
  });


  const onCountryClick = d =>{
    
    let TotalInSide;
   
    const titleText =document.querySelector('#titletext');
   
    $("#daily").click(function(){
      TotalInSide = true;
      TotalOutSide=false;
    });
   
    (TotalOutSide !==true && TotalInSide!==true) ? titleText.innerText=`Daily Deaths in ${d.properties.location}`:0;
    (TotalOutSide==true) ?  titleText.innerText=`Total Deaths in ${d.properties.location}`:0;
   
    
    var elmntToView = document.getElementById("charts");
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

      elmntToView.scrollIntoView();
      document.querySelector(".popup-close").style.display = "block"; 
    }
    
    document.getElementById("buttons").style.display = "block";
    

    const daily = document.querySelector('#daily');
    daily.addEventListener('click',  renderDaily(d));

    daily.addEventListener('click', ()=>{
      $('.tot').hide();
      $('.dai').show();
      titleText.innerText=`Daily Deaths in ${d.properties.location }`;
      renderDaily(d);
    });

    const total = document.querySelector('#total');
    total.addEventListener('click', renderTotal(d));

    total.addEventListener('click', ()=>{
      $('.dai').hide();
      titleText.innerText=`Total Deaths in ${d.properties.location }`;
      $('.tot').show();
       renderTotal(d);
    });

  };

  loadAndProcessData().then(countries =>{

    features=countries.features;

    let feature = countries.features.filter(function (e) {
      return e.properties.Catog !== 'nan';
    });
    //  feature.forEach(d => {
    //    d.Catog = +d.Catog
    // });
    console.log(feature);

      

    render();
  });


  console.log(colorScale.domain());
  const render =()=>{

    colorScale
    .domain(features.map(colorValue))
    .domain(removeNaN(colorScale.domain()).sort((a, b)=> b - a).reverse())
     .range(d3.schemeYlOrBr[removeNaN(colorScale.domain()).length]);

    
      function removeNaN(arr) {
        return arr.filter(Boolean);
      }
      


    colorLegendG.call(colorLegend, {
      colorScale,
      recHeight:12,
      recWidth: 38,
      textOffset: 40,
      onClick,
      selectedColorValue
    });

    choroplethMapG.call(choroplethMap, {
      features,
      colorScale,
      colorValue,
      selectedColorValue,
      onCountryClick
    });
  };

}(d3, topojson));
