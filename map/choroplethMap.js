import { geoPath, geoNaturalEarth1, zoom, event, tip } from "d3";

const projection = geoNaturalEarth1();
const pathGenerator = geoPath().projection(projection);

export const choroplethMap = (selection, props) => {
  const {
    features,
    colorScale,
    colorValue,
    selectedColorValue,
    onCountryClick,
  } = props;

  const gUpdate = selection.selectAll("g").data([null]);
  const gEnter = gUpdate.enter().append("g");
  const g = gUpdate.merge(gEnter);

  selection.call(
    zoom().on("zoom", () => {
      g.attr("transform", event.transform);
    })
  );
  const countryPaths = g.selectAll("path").data(features);

  const Title = selection
    .append("text")
    .attr("class", "Title")
    .attr("y", 35)
    .attr("x", 350)
    .attr("fill", "black")
    .text("Confirmed COVID-19 deaths: June, 20th");

  const countryPathsEnter = countryPaths
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("transform", `translate(-45,100)`);

  const tipF = tip()
    .attr("class", "tip card")
    .html((d) => {
      let content = `<div class="name">${d.properties.location}</div>`;
      content += `<div class="cost"> Total Deaths: ${+d.properties
        .total_deaths}</div>`;
      content += `<div class="cost"> Daily Deaths: ${+d.properties
        .new_deaths}</div>`;
      content += `<div class="cost"> New  Cases: ${+d.properties
        .new_cases}</div>`;
      content += `<div class="cost"> Total Cases: ${+d.properties
        .total_cases}</div>`;
      content += `<div class="more">Click for details</div>`;
      return content;
    });

  countryPathsEnter.call(tipF);

  countryPaths
    .merge(countryPathsEnter)
    .attr("d", pathGenerator)
    .attr("fill", (d) => colorScale(colorValue(d)))
    .attr("opacity", (d) =>
      !selectedColorValue || selectedColorValue === colorValue(d) ? 1 : 0.2
    )
    .classed(
      "highlighted",
      (d) => selectedColorValue && selectedColorValue === colorValue(d)
    )
    .on("click", (d) => {
      onCountryClick(d);
    });

  countryPathsEnter
    .on("mouseover", (d, i, n) => {
      tipF.show(d, n[i]);
    })
    .on("mouseout", (d) => {
      tipF.hide();
    });
};
