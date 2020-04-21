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


const onClick = d =>{
selectedColorValue=d;
render();
};
let TotalOutSide;
$("#total").click(()=>TotalOutSide = true);
(TotalOutSide == true) ? $('.tot').show(): $('.tot').hide()


$('.popup-close').click(()=> {
  $('html, body').animate({
    scrollTop: '0px'
  });
});


const onCountryClick = d =>{
  
  let TotalInSide;
  var TotalClicked;
  var DailyClicked;
 
  const titleText =document.querySelector('#titletext');
 
  $("#daily").click(function(){
    TotalInSide = true
    TotalOutSide=false
  });
 
  (TotalOutSide !==true && TotalInSide!==true) ? titleText.innerText=`Daily Deaths in ${d.properties.name}`:0;
  (TotalOutSide==true) ?  titleText.innerText=`Total Deaths in ${d.properties.name}`:0;
 
  
  var elmntToView = document.getElementById("charts");
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

    elmntToView.scrollIntoView();
    document.querySelector(".popup-close").style.display = "block"; 
  }
  
  document.getElementById("buttons").style.display = "block";

  (TotalClicked == true ) ? $('.tot').show():
  (TotalClicked == true && DailyClicked == true) ? $('.tot').hide():0;
  
  ( DailyClicked == true ) ? $('.tot').hide():0;
  

  const daily = document.querySelector('#daily');
  daily.addEventListener('click',  renderDaily(d));

  daily.addEventListener('click', ()=>{
    $('.tot').hide();
    $('.dai').show();
    titleText.innerText=`Daily Deaths in ${d.properties.name }`;
    renderDaily(d);
  });

  const total = document.querySelector('#total');
  total.addEventListener('click', renderTotal(d));

  total.addEventListener('click', ()=>{
    $('.dai').hide();
    titleText.innerText=`Total Deaths in ${d.properties.name }`
    $('.tot').show();
     renderTotal(d);
  });

};

loadAndProcessData().then(countries =>{
  features=countries.features;
  render();
});

const render =()=>{
  colorScale
  .domain(features.map(colorValue))
  .domain(colorScale.domain().sort((a, b)=> b - a).reverse())
  .range(schemeYlOrBr[colorScale.domain().length]);

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
}


