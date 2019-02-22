/**
 * A javascript implementation of php's $_GET array. Courtesy of Josh Fraser. Modified.
 * @author Adel Wehbi
 * @param {string} q The variable to GET.
 */
function _GET(key, default_if_null) {
	var s = window.location.search;
	var re = new RegExp('&' + key + '(?:=([^&]*))?(?=&|$)', 'i');
	return(s = s.replace(/^\?/, '&').match(re)) ? (typeof s[1] == 'undefined' ? default_if_null : decodeURIComponent(s[1])) : default_if_null;
}

/**
 * Configures the axes of the plot.
 * @author Adel Wehbi
 * @param   {object}   config The config object in config.js
 */
function configure_plot() {
	var xaxis = plot.getAxes().xaxis;
	var yaxis = plot.getAxes().yaxis;
	if(config.xaxis_scale_type == "logarithmic") {
		xaxis.options.transform = function (x) {
			return x == 0 ? Math.log(xmin) / Math.log(10) : Math.log(x) / Math.log(10);
		};
		//this allows the ticks to appear without modification i.e. no useless decimal zeros and no decimal parts for whole numbers
		xaxis.options.tickFormatter = function (val, axis) {
			return toNearestPower10(val);
		};
		//		yaxis.options.tickDecimals = Math.abs(toNearestPower10(ymin));
		yaxis.options.ticks = [];
		gen_ticks_log(ymin, ymax).forEach(function (value) {
			yaxis.options.ticks.push(toNearestPower10(value));
		});
		//		yaxis.options.ticks = gen_ticks_log(toNearestPower10(ymin), 10);
		yaxis.options.transform = function (y) {
			return y == 0 ? Math.log(ymin) / Math.log(10) : Math.log(y) / Math.log(10);
		};
		yaxis.options.tickFormatter = function (val, axis) {
			return val;
		};
	} else { // == "normal"
		xaxis.options.transform = null //function(x){return x;};
		//this allows the ticks to appear without modification i.e. no useless decimal zeros and no decimal parts for whole numbers
		xaxis.options.tickFormatter = function (val, axis) {
			return val.toFixed(2);
		};

		yaxis.options.transform = null //function(y){return y;};
		yaxis.options.ticks = null;
		yaxis.options.tickFormatter = function (val, axis) {
			return val.toFixed(10).replace(/0+$/, '');
		};
	}



}

/**
 * Returns an array of all needed variables for the computation of any formula,
 * including any variables of any subformulas previously defined. It is recursive.
 * @author Adel Wehbi
 * @param   {object}  formula       A formula object predefined in the formulas array (found in formulas.js).
 * @returns {object}   Object of all the ids of the variables needed for computation.
 */
function generate_vars_list(formula) {
	var vars = {};
	for(variable_id in formula.vars) {
		vars[variable_id] = formula.vars[variable_id];
	}
	if(formula.subs !== undefined) {
		formula.subs.forEach(function (value) {
			var formula = formulas[value];
			vars = $.extend(vars, generate_vars_list(formula));
		});
	}
	return vars;
}

/**
 * Verifies that all needed variables are included in the vars object for any given formula object.
 * @author Adel Wehbi
 * @param   {object}  formula A formula object predefined in the formulas array (found in formulas.js).
 * @param   {object}  vars    Object containing the key-value pairs variable_id and its collected value
 * @returns {boolean} true if all needed variables are supplied, false if not.
 */
function verify_variables(formula, vars) {
	for(variable in formula.vars) {
		if(vars[variable] === undefined) {
			console.error("Variable " + variable + " for the formula " + formula.name + " was not supplied. Cannot Compute.");
			return false;
		}
	}
	return true;
}

/**
 * Adds the predefined constants of any formula into the variables object that was collected from the user. 
 * @author Adel Wehbi
 * @param   {object} formula A formula object predefined in the formulas array (found in formulas.js).
 * @param   {object} vars    Object containing the key-value pairs variable_id and its collected value.
 * @returns {object} The vars object that now contains the constants.
 */
function define_constants(formula, vars) {
	for(constant in formula.constants) {
		vars[constant] = math.eval(formula.constants[constant]);
	}
	if(formula.subs !== undefined) {
		formula.subs.forEach(function (value) {
			var formula = formulas[value];
			vars = $.extend(vars, define_constants(formula, vars));
		});
	}
	return vars;
}

/**
 * Calls verify_variables and define_constants to generate the needed scope for computation.
 * @author Adel Wehbi
 * @param   {object} formula A formula object predefined in the formulas array (found in formulas.js).
 * @param   {object} vars    Object containing the key-value pairs variable_id and its collected value
 * @returns {object} The generated scope.
 */
function setup_scope(formula, vars) {
	if(!verify_variables(formula, vars))
		return false;
	var scope = define_constants(formula, vars);
	return scope;
}

/**
 * Computes a formula by evaluating the equation property of the formula object. If the formula has it's own compute function, that one is called instead. This function is recursive.
 * @author Adel Wehbi
 * @param   {object} formula A formula object predefined in the formulas array (found in formulas.js).
 * @param   {object} vars    Object containing the key-value pairs variable_id and its collected value
 * @returns {float|boolean}  Returns the result of the computation. Returns false if variables are missing or if calculation failed (result is not defined by example).
 */
function compute(formula, vars) {
	var scope = setup_scope(formula, vars);
	if(!scope)
		return false;

	if(formula.subs !== undefined) {
		formula.subs.forEach(function (subformula) {
			scope[subformula] = compute(formulas[subformula], scope);
		});
	}

	if(formula.compute !== undefined)
		return formula.compute(scope);
	else {

		return math.eval(formula.equation, scope);
	}
}

/**
 * This function is needed to counteract the fundamental problem with floating-point values.
 * @author Adel Wehbi
 * @param   {number} value Value to round.
 * @returns {number} The value rounded to the nearest power of ten (1eN).
 */
function toNearestPower10(value) {
	return Math.pow(10, Math.round(Math.log10(value)));
}

// This function changes the color of an active button in order to identify which device you are evaluating/using
function update_active_button() {
	var devices = document.querySelectorAll("button");
	for (num in devices) {
		devices[num].onclick = function (){
			var activeButton = document.querySelectorAll(".active")[0];
			if (this.className = "inactive") {
				if(activeButton) activeButton.className = "inactive";
				this.className = "active";
			};
		};
	};
};