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
  
      const countryName = d.properties.location 
      const coutryDaily= + d.properties.new_deaths 
      const codes = String(d.properties.location)
  
      Promise
      .all([
        tsv('../data/CovidD1.tsv'),
        csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/full_data.csv"),
      ])
      .then(([tsvData, csvData]) => {
      
        tsvData.forEach(d => {
            d.new_deaths = +d.new_deaths
        });

        const sum =  tsvData.reduce((s, a) => s + a.new_deaths, 0)

        var country={ name:'', Daily:0}
        var world={ name:'Rest of The World', Daily:0}
        country.name=countryName
        country.Daily=coutryDaily
        world.Daily=sum-coutryDaily
        var data=[country,world]
      
        csvData.forEach(d => {
            d.date  = new Date(d.date)
            d.new_deaths = +d.new_deaths
  
            csvData = csvData.filter(item => item.location ==codes );
          });
          
          pieChartD(data)
          LineChartD(csvData)
  
        })
  
        }