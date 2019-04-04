
//     "Q" is amount of material released, [source strength of contaminant I, μg/s]
//     "mw" is molecular weight, 
//     "sc" is stability class and 
//      "h" is physical height of the stack
//      Xmax is the max range of distance from plume to assess
//      Z1 is height of meteorological tower
//      "Vs" is vertical stack gas velocity (m/sec)
//      "ds": inside diameter of stack (m)
//      "Ts": temp of exhaust gas stream at stack outlet (K)
//      "Ta": temp of the atmosphere at stack outlet (K)
//      "Pa": atmospheric pressure at ground level (mb)
var wd = variables["wd"]["default"]-90;
var ws = variables["ws"]["default"];
var Q = variables["Q"]["default"];
var sc= Object.keys(variables['sloc']["default"])[0] + Object.keys(variables['sc']["default"])[0];
var latitude = variables["lat"]["default"];
var longitude = variables["lon"]["default"];
var h = variables["h"]["default"];
var Xmax = variables["Xmax"]["default"];
var Z1 = variables["Z1"]["default"];
var Vs = variables["Vs"]["default"];
var ds = variables["ds"]["default"];
var Ts = variables["Ts"]["default"];
var Ta = variables["Ta"]["default"];
var Pa = variables["Pa"]["default"];
var Zinput = variables["Zinput"]["default"];
var Yinput = variables["Yinput"]["default"];
var z = Object.keys(variables['z']["default"])[0];
var Cmin = 5; // set initaly but updated by user with slider
var Cmax = 250; // set initaly but updated by user with slider  

// COLOR CODES FOR MAPVIEW EGIONS UPDATED WITH THE SLIDER BY THE USER 
//each colored area with so much μg/m^3 concentration
// level in μg/m^3
// var polution_max = 100;
// var polution_min = 5;

var export_vars= {
    'profile': ["Q", "ws", "h","Xmax","Z1","Vs","ds","Ts","Ta","Pa", "sc", "Zinput", "Yinput"],
    'side': ["Q", "ws", "h","Xmax","Z1","Vs","ds","Ts","Ta","Pa","sc", "Yinput", "Cmin", "Cmax"],
    'top': [ "Q", "ws", "wd", "h","Xmax","Z1","Vs","ds","Ts","Ta","Pa", "z", "sc", "latitude", "longitude", "Cmin", "Cmax"]
}

var polution_levels = {
    0: {color: '#9FFF33', level: 5},
    1: {color: '#fbe37f', level: 20},
    2: {color: '#ffcd00', level: 35},
    3: {color: '#fb740c', level: 50},
    4: {color: '#f32a2a', level: 65},
    5: {color: '#5d0404', level: 100}
}

// P is function of atmospheric stability (A to F) 
// and surface roughness (urban vs rural (also called open country) environment
var P = {
    "ua": 0.15,
    "ub": 0.15,
    "uc": 0.20,
    "ud": 0.25,
    "ue": 0.30,
    "uf": 0.30,
    "ra": 0.07,
    "rb": 0.07,
    "rc": 0.10,
    "rd": 0.15,
    "re": 0.35,
    "rf": 0.55
}

// API key from https://github.com/touhid55/GaussianPlume
var config = {
  apiKey: "AIzaSyBuqgAHTym57lDY8g6e8Xuf80E2s8mw-9A",
  authDomain: "gauss-54e5b.firebaseapp.com",
  databaseURL: "https://gauss-54e5b.firebaseio.com",
  projectId: "gauss-54e5b",
  storageBucket: "gauss-54e5b.appspot.com",
  messagingSenderId: "1039094609006"
};

//SETUP Globals
firebase.initializeApp(config);
//var event = firebase.database().ref('TR') 

// setup map
var map;
var zoom = 14;
var center= {lat: latitude, lng: longitude};
var infoWindow;
var RADIANS =57.2957795;

//setup chart data
var chart;
var to_plot = [[ 'ID', 'X', 'Z', 'Concentration']];

//profile data
var pro_plot = [[]];


// Us is wind speed at height h (at stack opening)
// h is stack height
// Z1 is height of meteorological tower
// P is function of atmospheric stability
// ws is wind speed from measured tower
function calculateUs(){
    var Us = ws*(Math.pow((h/Z1),P[sc]));
    return Us
};

//  deltaH is the Plume Rise in meters
//  "Vs": vertical stack gas velocity (m/sec)
//  "ds": inside diameter of stack (m)
//  "Ts": temp of exhaust gas stream at stack outlet (K)
//  "Ta": temp of the atmosphere at stack outlet (K)
//  "Pa": atmospheric pressure at ground level (mb)
function calculateDeltaH(Us){
    var deltaH = ((Vs*ds)/Us)*(1.5+ 0.00268*Pa*ds*((Ts-Ta)/Ts));
    return deltaH
}

// before plume hit's the ground
function C_eq1(Q, sigy, sigz, Us, y, z, H) {
        var base = Q/(2*3.1416*sigy*sigz*Us); 
        c = base*Math.exp((-0.5*(Math.pow(y/sigy,2)))-(0.5*(Math.pow((z-H)/sigz,2))));
        if (c<1 || isNaN(c)==true){
            c = 0;
        }
    return c;
};

//after plume hits the ground
function C_eq2(Q, sigy, sigz, Us, y, z, H) {
        var base = Q/(2*3.1416*sigy*sigz*Us); 
        c = base*(Math.exp((-0.5*(Math.pow(y/sigy,2)))-(0.5*(Math.pow((z-H)/sigz,2))))
                  +Math.exp((-0.5*(Math.pow(y/sigy,2)))-(0.5*(Math.pow((z+H)/sigz,2)))));
        if (c<1 || isNaN(c)==true){
            c = 0;
        }
    return c;
};


$( function() {
    $( "#topslider-range" ).slider({
      range: true,
      min: 1,
      max: 800,
      values: [ Cmin, Cmax],
      slide: function( event, ui ) {  
        $( "#topamount" ).val( ui.values[ 0 ] +" - "+  ui.values[ 1 ] +"+");
        },
        change: function( event, ui ){
            var levels = Object.keys(polution_levels);   
            Cmin = ui.values[ 0 ];
            Cmax = ui.values[ 1 ];
            var multiplier = Math.floor((Cmax-Cmin)/(levels.length+1));
            for (var i=0; i<levels.length/2 ;i++){
                 polution_levels[i]['level']=Cmin+(i*multiplier);
            }
            for (var i=levels.length-1, j=0; i>=levels.length/2; i--){
                 polution_levels[i]['level']=Cmax-(j*multiplier);
                 j = j+1;
            }
            drawNewMap();  
        }
    });
    $( "#topamount" ).val( $( "#topslider-range" ).slider( "values", 0 ) +
      " - " + $( "#topslider-range" ).slider( "values", 1 )+"+") ; // initially
  });

$( function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 1,
      max: 800,
      values: [ Cmin, Cmax ],
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.values[ 0 ] +" - "+  ui.values[ 1 ] +"+");   
        },
        change: function( event, ui ){
            if ($(".sideview").css("display")!="none"){
                Cmin = ui.values[ 0 ];
                Cmax = ui.values[ 1 ];
                drawChart();
            }
        }
    });
    $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 )+"+") ; // initially
  });


// for toggling between buttons and pages
var top_update = false; // start with initial view false
var side_update = true;
var ccenpro_update = true;
function show_Topview(){
    $(".sideview").css("display", "none");
    $(".ccenprofile").css("display", "none");
    $("#ySpan").css("display", "none");
    $('.topview').css("display", "block");
    if (top_update == true){
        top_update = false;
        drawNewMap();
    } 
}
function show_Sideview(){ 
    $('.topview').css("display", "none");
    $(".ccenprofile").css("display", "none");
    $(".sideview").css("display", "block");
    $("#ySpan").css("display", "block");
    if (side_update == true) {
        side_update = false;
        initPlot();
    } 
}
function show_ccenprofile(){ 
    $('.topview').css("display", "none");
    $(".sideview").css("display", "none");
    $(".ccenprofile").css("display", "block");
    $("#ySpan").css("display", "block");
    if (ccenpro_update == true) {
        ccenpro_update = false;
        c_vs_x();
    } 
}


// function load_model(){
//     $("#about").css("display", "block");
//     $(".plots").css("display", "none");
//     //$("#about").load("model.html");
// }

//set and display configs from configPlume.js
function configVariables(){
    Object.keys(variables).forEach( function(val,i){
        if (variables[val]["type"]=="range"){ //sliders
            var label = $('label[for="'+val+'Range"]').html();
            $('label[for="'+val+'Range"]').empty();
            $('label[for="'+val+'Range"]').html(variables[val]["label"] + label + variables[val]["unit"]);
            $("#"+val+"Range").val(variables[val]["default"]);
            $("#"+val+"Range").attr('min', variables[val]["slider-min"]);
            $("#"+val+"Range").attr('max', variables[val]["slider-max"]);
            $("#"+val+"Range").attr('step', variables[val]["step"]);
            $("#"+val+"Out").val(variables[val]["default"]);
        }
        else if (variables[val]["type"]=="number"){
            $("#"+val).attr('step', variables[val]["step"]);
            $("#"+val).val(variables[val]["default"]);
            $('label[for="'+val+'"]').html(variables[val]["label"]);
        }
        else if (variables[val]["type"]=="select"){ 
            if (variables[val]["label"]) $('label[for="'+val+'"]').html(variables[val]["label"]);     
            var default_opt = Object.keys(variables[val]["default"])[0]
            $("#"+val).append($('<option>', 
                                { value: default_opt,text : 
                                    variables[val]["default"][default_opt] }));
            $.each(variables[val]["other_options"], function (v, t) {
                $("#"+val).append($('<option>', 
                    { value: v, text : t }));
                });
        }
    });
}
function updateView(){
    // only for topview
    if ($(".topview").css("display")!="none"){        
        top_update = false;
        side_update = true;
        ccenpro_update = true;
        drawNewMap();
    }  
    else if ($(".sideview").css("display")!="none"){
        top_update = true;
        side_update = false;
        ccenpro_update = true;
        initPlot();
    }      
    else if ($(".ccenprofile").css("display")!="none"){
        top_update = true;
        side_update = true;
        ccenpro_update = false;
        c_vs_x();
    }      
}

// z max value depends on h
function restrictZinput(){
    $("#ZinputRange").attr('max', h);
    if ($("input[name='Zinput']").val()>h){
        $("input[name='Zinput']").val(h);
    }
}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}




function exportData(){
    var mode = window.location.href.split("#")[1];
    var title = '';
    var all_data = [];

    var args = [["input param", "value"]];
    export_vars[mode].forEach(function(val,i){
        if (val=="Cmin"){
            args.push(["concentration min", Cmin]);
        }
        else if (val=="Cmax"){
            args.push(["concentration max", Cmax]);
        }
        else if (variables[val]["type"]=="range"){
            args.push([val, $("#"+val+"Range").val()] );
        }
        else if (variables[val]["type"]=="number"){
            args.push([val, $("#"+val).val()] );
        }
        else if (val=="sc"){
            args.push([val, sc]);
        }
        else if (val=="z"){
            args.push(["z-axis", z]);
        }
        
    });
    args.push(['','']); /// 2 blank rows

    if (mode=="profile"){
        args.push(['X (meters)', 'Concentration (μg/m^3)']);
        all_data = args.concat(pro_plot);
        title = "plume_concentration_profile_data.csv"
    }
    else if (mode=="side"){
        args.push(['X (meters)', 'Z (meters)', 'Concentration (μg/m^3)']);
        var filtered = to_plot.filter(function(value, index, arr){
            return arr[index][3] >= Cmin;
        });
        filtered.forEach( function(entry, i){
            args.push(entry.splice(1,3));
        })
        all_data=args;
        title = "side_view_data.csv";
    }
    // else if (mode=="top"){
    //     args.push(['X (meters)', 'Z (meters)', 'Concentration (μg/m^3)']);
    //     var filtered = to_plot.filter(function(value, index, arr){
    //         return arr[index][3] >= Cmin;
    //     });
    //     filtered.forEach( function(entry, i){
    //         args.push(entry.splice(1,3));
    //     })
    //     all_data=args;
    //     title = "side_view_data.csv";
    // }
    
    exportToCsv(title, all_data);
}


$( document ).ready(function() {
    show_Topview();
    configVariables(); // including wd for topview
    labelWindDirection(); /// for topview
    restrictZinput();
    initPlot();
    c_vs_x();
    console.log( "ready!" );

    // Update from user input changes
    $(".nav").click(function() {
        $(".nav").removeClass("active");
        tis = $(this);
        $(this).closest("a").addClass("active");
    });
    // selects need individual listeners
    $("#z").on('change', function(){
        z = $(this).val();
        updateView(); 
    });
    $(".sc").on('change', function(){
        var cl = $("#sc").val();
        var sloc = $("#sloc").val();
        sc = sloc+cl;
        updateView(); 
    });

    $('#data').on('change', 'input', 'select', function () {
        console.log("change");
        ws = parseInt($("input[name='ws']").val());
        Q = parseInt($("input[name='Q']").val());
        h = parseInt($("input[name='h']").val());
        restrictZinput();
        Xmax = $("input[name='Xmax']").val();
        Zinput = $("input[name='Zinput']").val(); 
        Yinput = $("input[name='Yinput']").val(); 
        Z1 = $("input[name='Z1']").val();
        Vs = $("input[name='Vs']").val();
        ds = $("input[name='ds']").val();
        Ts = $("input[name='Ts']").val();
        Ta = $("input[name='Ta']").val();
        Pa = $("input[name='Pa']").val(); 
        wd = $("input[name='wd']").val()-90;
        labelWindDirection();
        latitude = parseFloat($("#lat").val());
        longitude = parseFloat($("#lon").val());
        map.setCenter({lat: latitude, lng: longitude});   

        updateView();      
    });
});