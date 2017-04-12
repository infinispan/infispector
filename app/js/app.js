/*! InfiSpector - v0.0.1 - 2017-04-12
 * https://github.com/infinispan/infispector/
 * Copyright (c) 2017 ;
 * Licensed 
 */
var app = angular.module('InfiSpector', ['ngRoute','ngResource']);
function displayGrowl(message) {
  $('.growl-notice').fadeIn().html(message);
    setTimeout(function(){ 
      $('.growl-notice').fadeOut();
    }, 4000);
  }
app.config(['$routeProvider', function ($routeProvider) {
        'use strict';


        $routeProvider.when('/', {
            templateUrl: '/index.html'
        }).when('/operations', {
            templateUrl: '/operations.html'
        })
                .otherwise({
                    redirectTo: '/'
                });
    }]); 
var start_time = document.getElementById("valR").value;
document.getElementById("start_input").value=start_time;
var end_time = document.getElementById("valR2").value;
document.getElementById("end_input").value=end_time;

function showVal(newVal)
{
    document.getElementById("start_input").value=newVal;
    start_time = document.getElementById("valR").value;
}

function changeSlider(sliderValue)
{
    document.getElementById("valR").value=sliderValue;
    start_time = document.getElementById("valR").value;
}

function showVal2(newVal2)
{
    document.getElementById("end_input").value=newVal2;
    end_time = document.getElementById("valR2").value;
}

function changeSlider2(sliderValue2)
{
    document.getElementById("valR2").value=sliderValue2;
    end_time = document.getElementById("valR2").value;
}