// CW: some advice on creating dynamic image (src is the path to the image).
// https://stackoverflow.com/questions/8013792/how-to-create-a-new-img-tag-with-jquery-with-the-src-and-id-from-a-javascript-o


//contains the plot object for future method calls
var plot;
//keep track of the current state of the app
var state = {
	minx: 0,
	maxx: 0,
	miny: 0,
	maxy: 0,
	xaxis_type: 'normal',
	yaxis_type: 'normal',
	yaxis_fix: false,
	formula: undefined,
	dataset: []
};

function init() {
	
	//load the specific formulas group and set that as the global variable formulas
	var formulas_group = _GET('unit', 'default');
	formulas = formulas[formulas_group];
	images = images[formulas_group];
	
	populate_options();

	//initialize the tabs
	$('#tabs').tabs();

	//the select element
	var select = $('#select_formula');

	select.append('<option>--------------</option>');
	//fill up the drop down with pre-defined formulas.
	for(formula_id in formulas) {
		var formula = formulas[formula_id];
		select.append("<option value=" + formula_id + ">" + formula.name + "</option>");
	}

	//Listeners

	//when a different formula is selected from the dropdown
	select.on('change', function () {
		var formula_id = $(this).val();
		state.formula = formulas[formula_id];
		setup_formula_interface();
		update();
	});


	$('#data').on('change', 'input', function () {
		//if the interface has not been setup for any formula yet
		if(state.formula === undefined)
			return;
		update();
	});

	$('#xaxis-log, #yaxis-log').on('change', function () {
		state.xaxis_type = ($('#xaxis-log').is(':checked')) ? 'log' : 'normal';
		state.yaxis_type = ($('#yaxis-log').is(':checked')) ? 'log' : 'normal';
		//get the default values for the new state whether normal scale or log scale.
		populate_options();
		update();
	});

	$('#yaxis-fix').on('change', function () {
		state.yaxis_fix = $('#yaxis-fix').is(':checked');
		if(state.yaxis_fix)
			$('#yvalues').removeAttr('style');
		else
			$('#yvalues').attr('style', 'display:none;');
		update();
	});

	plot = $.plot($('#graph'), [[]]);
}


/**
 * Populates the option fields in the interface from the config defaults.
 * @author Adel Wehbi
 */
function populate_options() {
	//fill in default options in their respective inputs
	if(state.xaxis_type == 'normal') {
		$('#startx').val(config.defaults.start);
		$('#endx').val(config.defaults.end);
	} else if(state.xaxis_type == 'log') {
		$('#startx').val(config.defaults.log_start);
		$('#endx').val(config.defaults.log_end);
	}

	if(state.yaxis_type == 'normal') {
		$('#starty').val(config.defaults.ystart);
		$('#endy').val(config.defaults.yend);
	} else if(state.yaxis_type == 'log') {
		$('#starty').val(config.defaults.log_ystart);
		$('#endy').val(config.defaults.log_yend);
	}
}

/**
 * Setups the interface for the formula and its values.
 * @author Adel Wehbi
 * @param {object} formula A formula object predefined in the formulas array (found in formulas.js).
 */
function setup_formula_interface() {
	var formula = state.formula;
	//first off, display the name of the formula
	$("#formula-name").html(formula.name);
	//second, display the formula itself 
	$("#formula-display").html("$" + formula.tex + "$")
	//third, display the units of the calculated result
	$("#formula-unit").html("$" + formula.unit + "$");
	//clear the previous value groups
	$("#values").html("");

	//now we need a form group comprised of a label, input, and slider for each variable in the formula
	var template = $("#value-template");

	//list of needed variables for calculations
	var variable_list = generate_vars_list(formula);
	for(key in variable_list) {
		variable = variable_list[key];
		var group = template.clone();
		group.removeAttr('id');
		group.find('label').html("$" + variable.tex + "$: ");
		group.find('input').val(variable.default || 0).attr('name', key);
		group.find('span.variable-units').html("$" + variable.unit + "$");
		group.appendTo("#values");

		if(variable.slider === undefined || variable.slider === true) {
			//set up the slider
			group.find('.slider').slider({
				min: variable["slider-min"] || config.defaults.slider.min,
				max: variable["slider-max"] || config.defaults.slider.max,
				step: variable['slider-step'] || config.defaults.slider.step,
				slide: function (event, ui) {
					$(this).siblings('input').val($(this).slider('value')).trigger('change');
				},
				change: function (event, ui) {
					$(this).siblings('input').val($(this).slider('value')).trigger('change');
				}
			});
		} else if(variable.slider === false) {
			group.find('.slider').remove();
		}
		//make visible by removing the style dispaly: none
		group.removeAttr("style");

	}
	//and add it the the MathJax queue in order for it to render nicely
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

/**
 * Collects the variable values from the interface. Result is set in the global state object.
 * @author Adel Wehbi
 * @returns {object} Key-Value pairs of the variables.
 */
function get_vars() {
	var vars = {};
	$('#values').find('input').each(function () {
		var variable_id = $(this).attr('name');
		vars[variable_id] = $(this).val();
	});
	return vars;
}


/**
 * Collects the options values from the interface, and adds them to the global state object.
 * @author Adel Wehbi
 */
function get_options() {
	state.minx = parseFloat($('#startx').val());
	state.maxx = parseFloat($('#endx').val());
	if(state.yaxis_fix) {
		state.miny = parseFloat($('#starty').val());
		state.maxy = parseFloat($('#endy').val());
	}
}

/**
 * Generates the dataset.
 * @author Adel Wehbi
 * @param   {object} formula   Formula object.
 * @param   {object} vars      Key-value pairs collected from user.
 * @param   {Array}  realTicks Array of ticks to substitute 'x' in the calculations.
 * @returns {Array}  Array of [x,y] pairs
 */
function gen_dataset(formula, vars, realTicks) {
	var dataset = [];
	realTicks.forEach(function (x) {
		//a temporary object to translate the scope while replacing the variable x
		var scope = {};
		for(key in vars) {
			//just copy the variable and its value over unless it includes x
			if(vars[key].includes('x'))
				scope[key] = math.eval(vars[key], {
					'x': x
				});
			else
				scope[key] = vars[key];
		}
		var y = compute(formula, scope);
		//if calculation succeeded and the result is defined add the pair to the set.
		if(y == false || !isFinite(y))
			y = undefined;
		dataset.push([x, y]);
	});
	console.log("---------------------------------------")
	console.log(formula);
	console.log(vars);
	console.log(realTicks);
	console.log(vars);

        console.trace();
	return dataset;
}

/**
 * This function generates the ticks used for display purposes.
 * @author Adel Wehbi
 * @param   {number}  start       The start value of the range.
 * @param   {number}  end         The end value of the range.
 * @param   {boolean} logarithmic Whether the ticks are for a log scale or not.
 * @returns {Array}   Array of the resultant ticks.
 */
function gen_ticks(start, end, logarithmic) {
	var ticks = [];
	var tick = Math.abs(end - start) / config.nb_iterations;
	if(end < start){
		var buffer;
		buffer = end;
		end = start;
		start = buffer;
	}
	if(logarithmic)
		end = end * 10;
	for(var v = start; v <= end;) {
		if(logarithmic){
			ticks.push(toNearestPower10(v));
			v = v * 10;
		}
		else{
			ticks.push(v);
			v += tick;
		}
	}
	return ticks;
}

/**
 * Generates the ticks used for calculations
 * @author Adel Wehbi
 * @param   {number}  start       The start value of the range.
 * @param   {number}  end         The end value of the range.
 * @param   {boolean} logarithmic Whether the ticks are for a log scale or not.
 * @returns {Array}   Array of the resultant ticks.
 */
function gen_real_ticks(start, end, logarithmic) {
	var realTicks = [];
	var tick = Math.abs(end - start) / (config.nb_iterations + 10);
	if(end < start){
		var buffer;
		buffer = end;
		end = start;
		start = buffer;
	}
	for(var v = start; v <= end;) {
		realTicks.push(v);
		v += tick;
	}
	return realTicks;
}

function configure_xaxis() {
	var logarithmic = (state.xaxis_type == 'log');
	var ticks = gen_ticks(state.minx, state.maxx, logarithmic);
	var xaxis = plot.getAxes().xaxis;
	xaxis.options.ticks = ticks;
	xaxis.options.transform = function (value) {
		if(logarithmic) {
			return(value == 0) ? 0 : Math.log10(value);
		} else
			return value;
	}
	xaxis.options.tickFormatter = function (value, axis) {
		if(logarithmic)
			return math.format(value, {
				notation: 'exponential'
			});
		else
			return value.toPrecision(2).replace(/\.\w*0+$/, '');
	}
}

function configure_yaxis() {
	var logarithmic = (state.yaxis_type == 'log');
	var ticks;
	var miny;
	var maxy;
	if(state.yaxis_fix) {
		miny = state.miny;
		maxy = state.maxy;
	} else {
		//when infinities are involved, the miny and maxy might end up being undefined
		//we do not want that. Which is why there are two loops here unfortunately.
		var found = false;
		state.dataset.forEach(function(pair){
			if(pair[1] == undefined || found)
				return;
			else{
				miny = pair[1];
				maxy = pair[1];
				found = true;
			}
		});
		state.dataset.forEach(function (pair) {
			if(pair[1] > maxy) {
				maxy = pair[1];
			}
			if(pair[1] < miny) {
				miny = pair[1];
			}
		});
	}
	if(logarithmic || state.yaxis_fix)
		ticks = gen_ticks(miny, maxy, logarithmic);
	var yaxis = plot.getAxes().yaxis;
	if(logarithmic || state.yaxis_fix)
		yaxis.options.ticks = ticks;
	else
		yaxis.options.ticks = undefined;
	yaxis.options.transform = function (value) {
		if(logarithmic){
			return (value == 0) ? Math.log10(miny) : Math.log10(value);
		}
		else
			return value;
	}
	yaxis.options.tickFormatter = function (value, axis) {
		if(logarithmic)
			return math.format(value, {
				notation: 'exponential'
			});
		else
			return value.toPrecision(4);
	}
}

/**
 * Calls necessary functions to collect data and redraw the graph.
 * @author Adel Wehbi
 */
function update() {
	get_options();
	state.dataset = gen_dataset(
		state.formula,
		get_vars(),
		gen_real_ticks(
			state.minx,
			state.maxx,
			(state.xaxis_type == 'logarithmic')
		)
	);
	configure_xaxis();
	configure_yaxis();
	plot.setData([{
		label: state.formula.name,
		data: state.dataset
	}]);
	plot.setupGrid();
	plot.draw();
	// update_output_value();
}

/*
function update_output_value() {
   var is_constant = true;
   var initial_value = state.dataset[0];
   for (value in state.dataset) {
      if value != initial_value {
          is_constant = false;
      }
   }
   if (is_constant) {
   }
   else {
   }
}
*/