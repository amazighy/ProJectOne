

import { tsv, csv } from 'd3';

import {LineChartT} from './LineChartT.js';
import {pieChartT} from './pieChartT.js';

export function renderTotal(d){
  //   function reSize() {
  //     $('#map').removeClass('col-lg-12');
  //     $('#map').addClass('col-lg-8');
  //     $('#charts').removeClass('col-lg-0');
  //     $('#charts').addClass('col-lg-4');
  // };
  // reSize() 
  
      const countryName = d.properties.location 
      const coutryTotal= + d.properties.total_deaths 
      const codes = String(d.properties.location)
  
      Promise
      .all([
        tsv('../data/CovidData.tsv'),
        csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/ecdc/full_data.csv"),
      ])
      .then(([tsvData, csvData]) => {
        //
        tsvData.forEach(d => {
            d.total_deaths = +d.total_deaths
        });

        const sum =  tsvData.reduce((s, a) => s + a.total_deaths, 0)
        var country={ name:'', Total:0}
        var world={ name:'Rest of The World', Total:0}
        country.name=countryName
        country.Total=coutryTotal
        world.Total=sum-coutryTotal
        var data=[country,world]
      
        csvData.forEach(d => {
            d.date  = new Date(d.date)
            d.total_deaths = +d.total_deaths
  
            csvData = csvData.filter(item => item.location ==codes );
            
          });
          console.log(csvData)
          pieChartT(data)
          LineChartT(csvData)
  
        })
  
      }