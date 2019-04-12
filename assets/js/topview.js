

function drawNewMap(){
    console.log("drawnewmap");
    //keep old zoom
    if (map) {
        zoom = map.getZoom();
        center['lat'] = map.getCenter().lat();
        center['lng'] = map.getCenter().lng();
    }   
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: zoom,
      center: center,
      mapTypeId: 'satellite',
      labels:true
  });
    updateLegend();
    initMap();
}

function updateLegend(){
    for (i in Object.keys(polution_levels)){
        $("#level"+i.toString()).html(polution_levels[i]["level"]+"+");
    } 
}

function initMap() {
    //setTimeout(initMap,10000)
    //var a = Math.floor(Math.random() * 180);   
    var Us = calculateUs();
    var hprime = calculateSTdownwash();
    // color of triangle, word to display, area with so much μg/m^3 concentration for each section
    for (l in Object.keys(polution_levels)){
        translate_coordinates(polution_levels[l]['color'], polution_levels[l]['level'], Us, hprime);
    }
}

function translate_coordinates(strokeColor, zone, Us, hprime) {
    with (Math) { 
                 // var xx, yy, r, ct, st, angle;
        var z_num; //convert z from the word decription to a number
        if (z=="plume") z_num = hprime;
        else if (z=="ground") z_num=0;
        var olat = latitude;
        var olon = longitude;
        var rotation_angle_degs = parseInt(wd)+90;
        var ynew = [];
        var xoffset = 0;
        var yoffset = 0;
        var last = 0;
        var r = [];
        var triangleCoords = [];
        var triangleCoords1 = [];
        var bounceCoords = [];
        var bounce_y = [];

        var deltaHfinal = null;
        var Fb = calculateFb();
        var stability = stability_map[sc[1]];
        var Xf = calculateXf(Us,Fb,stability);

    //x = [10, 100, 1000, 5000, 10000];
        var x = [0, 2];
        var k = 1;
        while (x[k] < Xmax-5){
             x.push(x[k]+1);
             k=k+1;
        }
        var sigy =[];
        var sigz =[];
        var ccen =[];
        var cdes5 = zone;//160; //ppm
        var y5 = [];
        var ynew1 =[];
        var lat1 = [];
        var lng1 = [];
        var lat0 =[];
        var lng0 = [];
        var blat0 = [];
        var blng0 = [];
        var blat1 = [];
        var blng1= [];
        var lattt = [];
        var lonnn = [];
        var blattt = [];
        var blonnn =[];
        var final_x = [];
        var final_y = [];
        var latLng = {};
        var blatLng = {};
        
        for (i in x){
                // calculate deltah for increases until deltaHfinal
                if (x[i]<Xf){
                    var deltaH = calculateDeltaH(Us,Fb,stability, x[i]); 
                    deltaHfinal = deltaH;
                }
                else {
                    var deltaH = deltaHfinal;
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
                  //ccen[i] = (Q*24.45*Math.pow(10, 3))/(3.1416*sigy[i]*sigz[i]*ws*mw); //old form in ppm
                    ccen[i] = Q/(2*3.1416*sigy[i]*sigz[i]*Us); // OUR FORMULA
                   //console.log(ccen[i])

                   //y5[i] = sigy[i]*Math.pow((2*log(ccen[i]/cdes5)), 0.5); //old simpler formula
                   //find the Y that yields this C(x,y,z)==cdes5(max concentration for this region) and make that the bounding arcline
                   if (sigz[i]<(H/2.15)){
                        y5[i]  = sigy[i]*(Math.pow(2*log(ccen[i]/cdes5)-(Math.pow((z_num-H)/sigz[i],2)),0.5));
                    }
                    else { //after plume hits the ground)   
                         y5[i] = sigy[i]*(Math.pow(2*log((ccen[i]/cdes5)
                                                         *(Math.exp(-0.5*Math.pow((z_num-H)/sigz[i],2))
                                                                      +Math.exp(-0.5*(Math.pow((z_num+H)/sigz[i],2))))), 0.5));
                   } 
                   if (isNaN(y5[i])==false){
                        final_x.push(x[i]);
                        final_y.push(y5[i]);
                   }
                   // keep track of the line where the plume hits ground
                   if (abs(sigz[i]-(H/2.15))<0.5){
                            bounce_y.push(x[i]);
                        }
        }

        //console.log(ynew);
        for (i in final_y){
            //if (ynew[i]>=0){ // for half ellipticals
                var yy = final_y[i];
                var y_left = -final_y[i];
                var xx = final_x[i];
                var coords_right = xy_to_latlon(xx, yy, olon, olat, rotation_angle_degs, xoffset, yoffset);
                var coords_left = xy_to_latlon(xx, y_left, olon, olat, rotation_angle_degs, xoffset, yoffset);
                lat0[i]=coords_right.lat;
                lng0[i]=coords_right.lng;
                lat1[i]=coords_left.lat;
                lng1[i]=coords_left.lng;
                r[i] = sqrt(xx*xx + yy*yy);

                if (bounce_y.indexOf(final_x[i]) != -1){
                    blat0[i] =lat0[i];
                    blng0[i] = lng0[i];
                    blat1[i]=lat1[i];
                    blng1[i] = lng1[i];
                }
            //}
        }
        
        lattt = lat0.reverse().concat(lat1);
        lonnn = lng0.reverse().concat(lng1);
        blattt = blat0.reverse().concat(blat1);
        blonnn = blng0.reverse().concat(blng1);

        var cityCircle = new google.maps.Circle({
            strokeColor: strokeColor,
            strokeOpacity: 0.3,
            fillOpacity: 0,
            map: map,
            center: {lat:latitude, lng: longitude},
            radius: Math.max(r[i])//Math.sqrt(citymap[city].population) * 100
        });
        //lng = lng.reverse();
        cityCircle.addListener('click', showNewRect);

        var maxRect = Math.max(r[i])/1000;


        for (i in lattt){
            lat = lattt[i];
            lng = lonnn[i];
            latLng = {lat,lng};
            triangleCoords.push(latLng)//[i]=[{lat,lng}];
        }

        for (i in blattt){
            lat = blattt[i];
            lng = blonnn[i];
            blatLng = {lat,lng};
            bounceCoords.push(blatLng)
        }
        //console.log(triangleCoords);
        // This example creates a simple polygon representing the Bermuda Triangle.
        // When the user clicks on the polygon an info window opens, showing
        // information about the polygon's coordinates 
        var bermudaTriangle = new google.maps.Polygon({

            paths: triangleCoords,
            strokeColor: strokeColor,
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: strokeColor,
            fillOpacity: 0.5,
            someRandomData: "I'm a custom tooltip :-)"

        });
        
        var bounceTriangle = new google.maps.Polygon({

            paths: bounceCoords,
            strokeColor: '#080808',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#080808',
            fillOpacity: 0.2,
            someRandomData: "I'm a custom tooltip :-)"

        });

        // not used but may later for changing color codes for regions
        function addHexColor(c1, c2) {
            if (c1[0]=='#') c1=c1.slice(1);
            if (c2[0]=='#') c2=c2.slice(2);
            var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
            while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
            return '#'+hexStr;
        }

         function showNewRect(event){
            var infoWindow = new google.maps.InfoWindow();
            var contentString = 'Math.max(r[i])';
            if(maxRect< Xmax/1000){
              infoWindow.setContent( 'Threat Zone: '+zone.toString()+' μg/m' + "3".sup()+'</br>'+'Maximum Downwind Distance='+maxRect.toFixed(2)+'km');
          }else{
              infoWindow.setContent(' Threat Zone: '+zone.toString()+ ' μg/m' + "3".sup()+'</br>'+'Maximum Downwind Distance='+'More than '+ (Xmax/1000).toString()+' km');
          }
          infoWindow.setPosition(latLng);
          infoWindow.open(map);
        } 

        bermudaTriangle.setMap(map);
        bounceTriangle.setMap(map);
    }
};

function DEG_TO_RADIANS(x){
    return (x*RADIANS);
}
//helper functions for latlon conversion
function METERS_DEGLON(x)
{  
   with (Math)
   {
      var d2r=DEG_TO_RADIANS(x);
      return((111415.13 * cos(d2r))- (94.55 * cos(3.0*d2r)) + (0.12 * cos(5.0*d2r)));
   }
}

function METERS_DEGLAT(x)
{
   with (Math)
   {
      var d2r=DEG_TO_RADIANS(x);
      return(111132.09 - (566.05 * cos(2.0*d2r))+ (1.20 * cos(4.0*d2r)) - (0.002 * cos(6.0*d2r)));
   }
}

// #   xy_to_latlon
// #   routine to translate between geographic and cartesian coordinates
// #   user must supply following data on the cartesian coordinate system:
// #   location of the origin in lat/lon degrees;
// #   rotational skew from true north in degrees;
// #   N.B. sense of rotation i/p here is exactly as o/p by ORIGIN
// #   x/y offset in meters - only if an offset was used during the
// #   running of prog ORIGIN;
function xy_to_latlon(x, y, olon, olat, rotation_angle_degs, xoffset, yoffset){
   with(Math)
   {   
      var xx,yy,xxx,yyy,r,ct,st,angle;
      angle = DEG_TO_RADIANS(rotation_angle_degs); //0 
     /* X,Y to Lat/Lon Coordinate Translation  */
     xx = x - xoffset; // set offset to 0
     yy = y - yoffset;
     r = sqrt(xx*xx + yy*yy);

     if(r){
        ct = xx/r;
        st = yy/r;
        xxx = r * ( (ct * cos(angle))+ (st * sin(angle)) );
        yyy = r * ( (st * cos(angle))- (ct * sin(angle)) );
     }
     //olon,olat are origin lat/lon
     var plon = olon + xxx/METERS_DEGLON(olat);
     var plat = olat + yyy/METERS_DEGLAT(olat);

    var sll={lat:plat, lng:plon};
    return(sll);    
  }
};

function labelWindDirection(){
    var wstring = "";
    var display_wd = $("#wdOut").val();
    if ((0<=display_wd && display_wd<90) || (270<display_wd && display_wd<360)) wstring= "N";
    if (90<display_wd && display_wd<=180 || (180<display_wd && display_wd<270)) wstring = "S";

    if (0<display_wd && display_wd<180) wstring=wstring.concat("E");
    if (180<display_wd && display_wd<360) wstring=wstring.concat("W");

    $("#wdLetter").html("&#176;"+wstring);
}