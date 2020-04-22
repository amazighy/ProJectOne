import { feature } from 'topojson';
import { tsv, json} from 'd3';
export const loadAndProcessData = () => 
  Promise
    .all([
      tsv('../data/CovidD1.tsv'),
      json('https://unpkg.com/world-atlas@1.1.4/world/50m.json'),
    ])
    .then(([tsvData, topoJSONdata]) => {
   
      const rowById = tsvData.reduce((accumulator, d) => {
        accumulator[d.MapID] = d;
        return accumulator;
      }, {});
       
      tsvData.forEach(d => {
        d.Catog = +d.Catog
        d.Total = +d.Total
        d.Daily = +d.Daily
      });
     
    

      const countries = feature(topoJSONdata, topoJSONdata.objects.countries);

      countries.features.forEach(d => {
        Object.assign(d.properties, rowById[d.id]);
      });

      return countries;
    });