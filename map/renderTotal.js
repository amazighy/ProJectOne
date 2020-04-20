

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
  
      const countryName = d.properties.name 
      const coutryTotal= + d.properties.Total 
      const codes = String(d.properties.Code)
  
      Promise
      .all([
        tsv('../data/CovidData.tsv'),
        csv("../data/covid.csv"),
      ])
      .then(([tsvData, csvData]) => {
        //
        tsvData.forEach(d => {
            d.Total = +d.Total
        });

        const sum =  tsvData.reduce((s, a) => s + a.Total, 0)
        var country={ name:'', Total:0}
        var world={ name:'Rest of The World', Total:0}
        country.name=countryName
        country.Total=coutryTotal
        world.Total=sum-coutryTotal
        var data=[country,world]
      
        csvData.forEach(d => {
            d.date  = new Date(d.date)
            d.Total = +d.Total
  
            csvData = csvData.filter(item => item.Code ==codes );
          });
          
          pieChartT(data)
          LineChartT(csvData)
  
        })
  
      }