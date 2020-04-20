import { tsv, csv } from 'd3';

import {LineChartD} from './LineChartD.js';
import {pieChartD} from './pieChartD.js';

export function renderDaily(d){
    function reSize() {
      $('#map').removeClass('col-lg-12');
      $('#map').addClass('col-lg-8');
      $('#charts').removeClass('col-lg-0');
      $('#charts').addClass('col-lg-4');
  };
  reSize() 
  
      const countryName = d.properties.name 
      const coutryDaily= + d.properties.Daily 
      const codes = String(d.properties.Code)
  
      Promise
      .all([
        tsv('../data/CovidData.tsv'),
        csv("../data/covid.csv"),
      ])
      .then(([tsvData, csvData]) => {
      
        tsvData.forEach(d => {
            d.Daily = +d.Daily
        });

        const sum =  tsvData.reduce((s, a) => s + a.Daily, 0)
        var country={ name:'', Daily:0}
        var world={ name:'Rest of The World', Daily:0}
        country.name=countryName
        country.Daily=coutryDaily
        world.Daily=sum-coutryDaily
        var data=[country,world]
      
        csvData.forEach(d => {
            d.date  = new Date(d.date)
            d.Daily = +d.Daily
  
            csvData = csvData.filter(item => item.Code ==codes );
          });
          
          pieChartD(data)
          LineChartD(csvData)
  
        })
  
        }