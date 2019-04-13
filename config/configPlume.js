// NOTE: the labels aren't yet configured dynamically from this file, they are set directly in plume.html

var variables = {
        // SLIDERS///////////////
        'Q': {
            "label": "Q: Source strength of Contaminant =",
            "default": 25000000,
            "unit": 'μg/s',
            "type": "range",
            "step": 1,
            "slider-min": 1000000,
            "slider-max": 80000000
        },
        'ws': {
            "label": "ws: Wind Speed from Meteorological Tower =",
            "default": 5,
            "unit": 'm/s',
            "type": "range",
            "step": 1,
            "slider-min": 1, // can't be zero or mathematical error divide by zero
            "slider-max": 60
        },
        'Z1': {
            "label": "Z1: Height of Tower =",
            "default": 10,
            "unit": 'm',
            "type": "range",
            "step": 1,
            "slider-min": 1, // can't be zero or mathematical error divide by zero
            "slider-max": 60
        },
        'Pa': {
            "label": "Pa: Atmospheric Pressure at Ground Level =",
            "default": 1032,
            "unit": 'mb',
            "type": "range",
            "step": 1,
            "slider-min": 300, 
            "slider-max": 4000
        },
        'wd': {
            "label": "wd: Wind Direction =",
            "default": 180,
            "unit": '', // this one is calculated a letter degrees special
            "type": "range",
            "step": 1,
            "slider-min": 0, 
            "slider-max": 359
        },
        'h': {
            "label": "h: Physical Height of Stack =",
            "default": 50,
            "unit": 'm',
            "type": "range",
            "step": 1,
            "slider-min": 1, 
            "slider-max": 200
        },
        'ds': {
            "label": "ds: Inside Diameter of Stack =",
            "default": 2,
            "unit": 'm',
            "type": "range",
            "step": 1,
            "slider-min": 1, 
            "slider-max": 10
        },
        'Vs': {
            "label": "Vs: Vertical Stack Gas Velocity =",
            "default": 20,
            "unit": 'm/sec',
            "type": "range",
            "step": 1,
            "slider-min": 1, 
            "slider-max": 50
        },
        'Ts': {
            "label": "Ts: Exhaust Gas Stream Temp at Stack Outlet =",
            "default": 400,
            "unit": 'K',
            "type": "range",
            "step": 1,
            "slider-min": 200, 
            "slider-max": 500
        },
        'Ta': {
            "label": "Ta: Temp of Atmosphere at Stack Outlet =",
            "default": 283,
            "unit": 'K',
            "type": "range",
            "step": 1,
            "slider-min": 200, 
            "slider-max": 500
        },
        'Xmax': {
            "label": "X: Max distance X from stack =",
            "default": 1000,
            "unit": 'm',
            "type": "range",
            "step": 1,
            "slider-min": 100, 
            "slider-max": 8000
        },
        'Yinput': {
            "label": "Y: ",
            "default": 0,
            "unit": 'm',
            "type": "range",
            "step": 1,
            "slider-min": -1000, 
            "slider-max": 1000
        },
        'Zinput': {
            "label": "Z: ",
            "default": 0,
            "unit": 'm',
            "type": "range",
            "step": 1,
            "slider-min": 0, 
            "slider-max": 200 // restricted to max whatever h is
        },
        //// NUMBERS
        'lat': { 
            "label": "Latitude:",
            "default": 53.5253,
            "type": "number",
            "step": 0.0001
        },
        'lon': {
            "label": "Longitude:",
            "default": -113.5257,
            "type": "number",
            "step": 0.0001
        },
        'z': { // DROP DOWN SELECTS
            "label": "z: z-axis level of measurement at",
            "default": {"plume":"Plume (z=H)"}, //{option value: option textdisplayed}
            "other_options": {"ground":"Ground (z=0)"},        
            "type": "select"
        },
        'sc': { 
            "label": "sc: Stability Class",
            "default": {"d":"D"},
            "other_options": {"a":"A", //{option value: option textdisplayed}
                                "b":"B", 
                                "c":"C",
                                "e":"E", 
                                "f":"F"},       
            "type": "select"
        },
        'sloc': { 
            "label": '',
            "default": {"u":"U"},
            "other_options": {"r":"R"}, //{option value: option textdisplayed}      
            "type": "select"
        },
        'deltaHapproach': { 
            "label": "delta_h calculation approach: ",
            "default": {"holland":"Holland Equation"},
            "other_options": {"briggs":"Briggs Approach"}, //{option value: option textdisplayed}                                 
            "type": "select"
        },
    };