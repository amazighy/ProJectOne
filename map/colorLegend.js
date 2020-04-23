export const colorLegend = (selection, props) => {
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
    .attr('x', -8*recWidth+8);

selection.append('text')
  .merge(groups.select('text'))
    .attr('class', 'foo')
    .text('Filter by catagory')
    .attr('opacity',0.5 )
    .attr('dy', '13.4em')
    .attr('x', recWidth*5);
};
