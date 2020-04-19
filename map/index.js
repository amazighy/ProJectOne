import {
  select,
  scaleOrdinal,
  schemeYlOrBr,
} from 'd3';

import {loadAndProcessData} from './loadAndProcessData';
import {colorLegend} from './colorLegend';
import {choroplethMap} from './choroplethMap';
import {renderDaily} from './renderDaily.js';
import {renderTotal} from './renderTotal.js';


/* *********************** Map svg set up*******************************/

const svg = select('.map')
    .append('svg')
    .attr('height', 600)
    .attr('width', 900)
    .attr('transform', `translate(-50,0)`);

const choroplethMapG = svg.append('g');
const colorLegendG = svg.append('g')
  .attr('transform', `translate(370,410)`);

  
const colorScale = scaleOrdinal(schemeYlOrBr[7]);
const colorValue = d=> d.properties.Catog;

// state 
let selectedColorValue;
let features;
let selectedCountryId;

const onClick = d =>{
selectedColorValue=d;

render();
}

var elementClicked;
$("#total").click(function(){
   elementClicked = true;
});
if( elementClicked == true ) {
  $('.tot').show();
}else{
  $('.tot').hide()
}

const onCountryClick = d =>{
  var TotalClicked;
$("#total").click(function(){
  TotalClicked = true;
});

var DailyClicked;
$("#daily").click(function(){
  DailyClicked = true;
});


if( TotalClicked == true ) {
  $('.tot').show();
}else if(TotalClicked == true && DailyClicked == true) {
  $('.tot').hide();
}


if( DailyClicked == true ) {
  $('.tot').hide();
}



// $("#daily").click(function()
// {
//    $(this).data('clicked', true);
// });
// if($("#daily").data('clicked'))
// {
//   $('.tot').hide()
  
// }


  var daily = document.querySelector('#daily');
  daily.addEventListener('click',  renderDaily(d))

  // // renderDaily(d)
  var total = document.querySelector('#total');
  total.addEventListener('click', renderTotal(d))
  // $('.tot').hide()
  
  var total = document.querySelector('#total');
  total.addEventListener('click', ()=>{
    $('.dai').hide();
    $('.tot').show()
     renderTotal(d)
    })

   var daily = document.querySelector('#daily');
   daily.addEventListener('click', ()=>{
    $('.tot').hide()
    $('.dai').show()
    renderDaily(d)
    // event.stopImmediatePropagation()
})



};


loadAndProcessData().then(countries =>{
  features=countries.features;
  render()
 
});

const render =()=>{
  colorScale
  .domain(features.map(colorValue))
  .domain(colorScale.domain().sort((a, b)=> b - a).reverse())
  .range(schemeYlOrBr[colorScale.domain().length]);


colorLegendG.call(colorLegend, {
  colorScale,
  recHeight:12,
  recWidth: 40,
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

}


