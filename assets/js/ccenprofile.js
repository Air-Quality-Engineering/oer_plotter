
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var plotDetail = null;
var plotMaster = null;

function c_vs_x() {
    with (Math) {
        var Us = calculateUs();
        if (deltaHapproach=="briggs"){
            var hprime = calculateSTdownwash();
        }
        else{
            var hprime = h;
        }
        // var z = Zinput; //convert z from the word decription to a number
        // var y = Yinput;

        //console.log(z, y);

        pro_plot = [[]];      
        var x = [1, 2];           
        var k = 1;
        while (x[k] < Xmax-10){
             x.push(x[k]+1);  
             k=k+1;
        }        
        var sigy =[];
        var sigz =[];
      

        //BRIGGS APPROACH for delta_h
        if (deltaHapproach=="briggs"){
            var Fb = calculateFb();
            var stability = stability_map[sc[1]];
            var Xf = calculateXf(Us,Fb,stability); 
        }

        for (i in x){
                //BRIGGS APPROACH for delta_h
                if (deltaHapproach=="briggs"){
                    //BRIGGS APPROACH for delta_h
                    // calculate deltah for increases until x=>Xf (deltaHfinal) and after
                    if (x[i]<Xf){
                        var deltaH = calculateDeltaHrise(Us,Fb,stability, x[i]); 
                    }
                    else {
                        var deltaH = calculateDeltaHfinal(Us,Fb,stability, x[i]);
                    }
                }
                else { // HOLLAND EQUATION
                    var deltaH = calculateDeltaHholland(Us);
                }
                var H = hprime + deltaH;
                ///STABILITY CLASS A,B,C,D,E,F WITH 'R' RURAL OR 'U' URBAN  
                if (sc=="ra") {
                      sigy[i] = 0.22*x[i]*Math.pow((1+0.0001*x[i]), -0.5);
                      sigz[i] = 0.20*x[i];//0.016*x[i]*Math.pow((1+0.0003*x[i]),-1);
                   }
                   else if(sc=="rb"){
                      sigy[i] = 0.16*x[i]*Math.pow((1+0.0001*x[i]), -0.5);
                      sigz[i] = 0.12*x[i];
                  }
                  else if(sc=="rc"){
                      sigy[i] = 0.11*x[i]*Math.pow((1+0.0001*x[i]), -0.5);
                      sigz[i] = 0.08*x[i]*Math.pow((1+0.0002*x[i]), -0.5);
                  }
                  else if(sc=="rd"){
                      sigy[i] = 0.08*x[i]*Math.pow((1+0.0001*x[i]), -0.5);
                      sigz[i] = 0.06*x[i]*Math.pow((1+0.0015*x[i]), -0.5);
                  }
                  else if(sc=="re"){
                      sigy[i] = 0.06*x[i]*Math.pow((1+0.0001*x[i]), -0.5);
                      sigz[i] = 0.03*x[i]*Math.pow((1+0.0003*x[i]), -1);
                  }
                  else if(sc=="rf"){
                      sigy[i] = 0.04*x[i]*Math.pow((1+0.0001*x[i]), -0.5);
                      sigz[i] = 0.016*x[i]*Math.pow((1+0.0003*x[i]), -1);
                  }
                  else if(sc=="ua"||"ub"){
                      sigy[i] = 0.32*x[i]*Math.pow((1+0.0004*x[i]), -0.5);
                      sigz[i] = 0.24*x[i]*Math.pow((1+0.001*x[i]), -0.5);
                  }
                  else if(sc=="uc"){
                      sigy[i] = 0.22*x[i]*Math.pow((1+0.0004*x[i]), -0.5);
                      sigz[i] = 0.20*x[i];
                  }
                  else if(sc=="ud"){
                      sigy[i] = 0.16*x[i]*Math.pow((1+0.0004*x[i]), -0.5);
                      sigz[i] = 0.14*x[i]*Math.pow((1+0.003*x[i]), -0.5);
                  }
                  else if(sc=="ue"||"uf"){
                      sigy[i] = 0.11*x[i]*Math.pow((1+0.0004*x[i]), -0.5);
                      sigz[i] = 0.08*x[i]*Math.pow((1+0.0015*x[i]), -0.5);
                  }

                   if (sigz[i]<(H/2.15)){
                        var c = C_eq1(Q, sigy[i], sigz[i], Us, Yinput, Zinput, H);
                    }
                    else { //after plume hits the ground)   
                        var c = C_eq2(Q, sigy[i], sigz[i], Us, Yinput, Zinput, H);
                   }
                   // if (c==0 && z[j]>H) continue; // more than half skip the empty zone
                   if (c!=0) pro_plot.push([x[i], c]);      
        }

        var detailOptions = {
                        series: {
                            lines: {
                                show: true
                            },
                            points: {
                                show: false
                            }
                        },
                        xaxis:{
                            axisLabel: 'X (meters)',
                            axisLabelUseCanvas: true,
                            axisLabelFontSizePixels: 15,
                            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                            axisLabelPadding: 8
                        },
                        yaxis:{
                            axisLabel: 'Concentration (μg/m^3)',
                            axisLabelUseCanvas: true,
                            axisLabelFontSizePixels: 15,
                            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                            axisLabelPadding: 8
                        },
                        pan: {
                          interactive: true
                        },
                        zoom: {
                          interactive: true,
                          mode: "x"
                        },
                        grid: {
                        hoverable: true,
                        borderWidth: 2,
                        margin:10,
                        aboveData: true
                        },
                        selection:{
                        mode: "xy"
            }};

        
        plotDetail = $.plot($("#profile #detailContainer"), [pro_plot], detailOptions);
        var orig_axes = plotDetail.getAxes();
        //var min = axes.xaxis.min; 

        function showTooltip(x, y, contents, z) {
            $('<div id="flot-tooltip">' + contents + '</div>').css({
                top: y - 50,
                left: Math.max(x - 100, 70),
                'border-color': z,
            }).appendTo("body").fadeIn(200);
        }
         
        var previousPoint=null;
        $("#profile #detailContainer").bind("plothover", function (event, pos, item) {
            if (item) {
                if ((previousPoint != item.dataIndex) || (previousLabel != item.series.label)) {
                    previousPoint = item.dataIndex;
                    previousLabel = item.series.label;
                 
                    $("#flot-tooltip").remove();
     
                    x = item.datapoint[0],
                    y = item.datapoint[1];
                    z = item.series.color;
                         
                    showTooltip(item.pageX, item.pageY,
                        "X= " + x + " m <br> C= " + y.toFixed(2) + " μg/m<sup>3</sup>",
                        z);
                }
            } else {
                $("#flot-tooltip").remove();
                previousPoint = null;            
            }
        });

        var masterOptions = {           
             series: {
                lines: {
                    show: true
                },
                points: {
                    show: false
                }
            },
            grid: {                
                backgroundColor: { colors: ["#96CBFF", "#75BAFF"] }
            },
            yaxis:{
                color:"#FAF9CF",
                axisLabel: 'C',
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 15,
                axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                axisLabelPadding: 8,
                min:orig_axes.yaxis.min,
                max: orig_axes.yaxis.max
            },
            xaxis:{              
                color:"#8400FF",
                axisLabel: 'X',
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 15,
                axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                axisLabelPadding: 8,
                min: orig_axes.xaxis.min,
                max: orig_axes.xaxis.max
            },
            selection:{
                mode: "xy"
            }
        };
         
        plotMaster = $.plot($("#profile #masterContainer"),
                                  [{data:pro_plot, color:"#FF7575"}],
                                    masterOptions
        );
     
        $("#profile #detailContainer").bind("plotselected", function (event, ranges) {        
            plotDetail = $.plot($("#profile #detailContainer"), [pro_plot],
                  $.extend(true, {}, detailOptions, {
                      xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                      yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
                  }));
     
            plotMaster.setSelection(ranges, true);
            });
 
        $("#profile #masterContainer").bind("plotselected", function (event, ranges) {
        plotDetail.setSelection(ranges);
                });
            }
};
// before plume hit's the ground
// function C_eq1(Q, sigy, sigz, Us, y, z, H) {
//         var base = Q/(2*3.1416*sigy*sigz*Us); 
//         c = base*Math.exp((-0.5*(Math.pow(y/sigy,2)))-(0.5*(Math.pow((z-H)/sigz,2))));
//         if (c<1 || isNaN(c)==true){
//             c = 0;
//         }
//     return c;
// };

// //after plume hits the ground
// function C_eq2(Q, sigy, sigz, Us, y, z, H) {
//         var base = Q/(2*3.1416*sigy*sigz*Us); 
//         c = base*(Math.exp((-0.5*(Math.pow(y/sigy,2)))-(0.5*(Math.pow((z-H)/sigz,2))))
//                   +Math.exp((-0.5*(Math.pow(y/sigy,2)))-(0.5*(Math.pow((z+H)/sigz,2)))));
//         if (c<1 || isNaN(c)==true){
//             c = 0;
//         }
//     return c;
// };
