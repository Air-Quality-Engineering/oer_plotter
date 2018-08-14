// Particle size ranges and other minimum and maximum values were 
// changed to reflect realistic values when analysing air quality control devices. 

var formulas = {
	'default':{	'rg': {
		name: "Gas Density",
		vars: {
			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35
			},
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 233,
				"slider-max": 473
			},
		},
		constants: {
			'r': 0.0821
		},
		equation: "(p * mw)/(r * t)",
		tex: "\\rho_g = \\frac{P MW}{R T}",
	},
	"mug": {
		name: "Viscosity of Air",
		vars: {
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		equation: "(0.0606 * log(t) - 0.2801)/3600",
		tex: "\\mu_g = \\frac{(0.0606 ln(T) - 0.2801)}{3600}",
	},
	"kc":{
		name:"Cunnigham Correction factor",
		subs: [
			"kn",		
		],
		vars:{},
		equation: "(1+kn*(1.257 +0.4*exp(-1.1/kn)))",
		tex: "K_c = 1+K_n(\\alpha+\\beta exp(-\\frac{\\epsilon}{K_n})",
	},
	"lambda":{
		name:"mean free path of gas molecules",
		subs: [
			"mug",	
		],
		constants: {
			pi: math.pi,
			r2: 8314
		},
		vars:{

			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35
			},
		},
		equation: "(mug/(0.499*(p*1.01325*10^5)*sqrt(8*mw/(pi * r2 * t))))*10^6",
		tex: "\\lambda_g = \\frac{\\mu_g}{0.499P\\sqrt{\\frac{8MW}{\\pi RT}}}",
	},
	"kn":{
		name:"Knudsen number",
		subs: [
			"lambda",	
		],
		vars:{
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},	
		},
		equation: "2*lambda/dp",
		tex: "K_n = \\frac{2\\lambda_g}{d_p}",
	},
			'vtp': {
			name: "Terminal Velocity",
			subs: [
			"mug", "kc"
			],
			vars: {
				'dp': {
					name: "Particle Size",
					"default": 1,
					unit: "um",
					"slider-min": 0.001,
					"slider-max": 100,
					tex: "d_p"
				},
				"rp": {
					name: "Density of Particle",
					"default": 1000,
					unit: 'kg/m^3',
					tex: '\\rho_p',
					"slider-min": 500,
					"slider-max": 5000
				},

				't': {
					name: "Temperature",
					"default": 298,
					unit: "K",
					tex: "T",
					"slider-min": 273,
					"slider-max": 473
				},
			},
			constants: {
				"g": 9.81
			},
			tex: "V_{tp} = \\frac{d_{p}^{2} \\rho_p K_c g}{18 \\mu_g}",
			compute: function (scope) {
				//dp was obtained in micro, so convert it to meter for consistency
				scope.dp = math.eval("dp * 10^-6", scope);
				return math.eval("(dp^2 * rp * kc * g)/(18 * mug)", scope);
			}
	},
},

	'chamber': {
		'ac': {
			name: "Collection Area",
			vars: {
				"l": {
					name: "Length",
					"default": 1,
					unit: "m",
					tex: "L",
					"slider-min": 1,
					"slider-max": 30,
					"slider-step": 0.5
				},
				"w": {
					name: "Width",
					"default": 1,
					unit: "m",
					tex: "W",
					"slider-min": 0.5,
					"slider-max": 10,
					"slider-step": 0.5
				},
				"n": {
					name: "Number of Channels",
					"default": 1,
					unit: "",
					tex: "n",
					"slider-min": 1,
					"slider-max": 15,
					"slider-step": 1
				},
			},
			equation: "l * n * w",
			tex: "A_C = n L W",
		},
		'vtp': {
			name: "Terminal Velocity",
			subs: [
			"mug", "kc"
			],
			vars: {
				'dp': {
					name: "Particle Size",
					"default": 1,
					unit: "um",
					"slider-min": 0.001,
					"slider-max": 100,
					tex: "d_p"
				},
				"rp": {
					name: "Density of Particle",
					"default": 1000,
					unit: 'kg/m^3',
					tex: '\\rho_p',
					"slider-min": 500,
					"slider-max": 5000
				},

				't': {
					name: "Temperature",
					"default": 298,
					unit: "K",
					tex: "T",
					"slider-min": 273,
					"slider-max": 473
				},
			},
			constants: {
				"g": 9.81
			},
			tex: "V_{tp} = \\frac{d_{p}^{2} \\rho_p K_c g}{18 \\mu_g}",
			compute: function (scope) {
				//dp was obtained in micro, so convert it to meter for consistency
				scope.dp = math.eval("dp * 10^-6", scope);
				return math.eval("(dp^2 * rp * kc * g)/(18 * mug)", scope);
			}
		},
		'eta': {
			name: "Efficiency",
			"subs": [
				'vtp',
				'ac',
				're',
			],
			vars: {
			},
			tex: "\\eta(d_p) = 1- exp(\\frac{-V_{tp} A_c}{Q_g})",
			compute: function (scope) {
				if(scope.re < 2200) {
					var result = math.eval("(vtp * ac)/qg", scope);
					return(result > 1) ? 1 : result;
				} else if(scope.re > 4000)
					return math.eval('1 - exp((-vtp * ac)/qg)', scope)
				else
					return false;
			}
		},
		're': {
			name: "Re chamber",
			subs: [
			'rg',
			'mug'
			],
			vars: {
				'qg': {
					name: "Gas Flow Rate",
					"default": 1,
					unit: "m^3/s",
					"slider-min": 0,
					"slider-max": 15,
					tex: "Q_g"
				},
				'h': {
					name: "Height",
					"default": 1,
					unit: "m",
					tex: "H",
					"slider-min": 1,
					"slider-max": 50
				},
				"n": {
					name: "Number of Channels",
					"default": 1,
					unit: "",
					tex: "n",
					"slider-min": 1,
					"slider-max": 15,
					"slider-step": 1
				},
				"w": {
					name: "Width",
					"default": 1,
					unit: "m",
					tex: "W",
					"slider-min": 0.5,
					"slider-max": 10,
					"slider-step": 0.5
				},
			},
			tex: "Re_{chamber} = \\frac{2Q_g \\rho_g}{(n W + H)\\mu_g}",
			equation: "(2 * qg * rg)/((n*w + h)*mug)",
		},
		'rg': {
			name: "Gas Density",
			vars: {
				'p': {
					name: "Atmospheric Pressure",
					"default": 1,
					unit: 'atm',
					tex: "P",
					"slider-min": 0.8,
					"slider-max": 1.6,
				},
				'mw': {
					name: "Molecular Weight",
					"default": 29,
					unit: "g/mol",
					tex: "MW",
					"slider-max": 35,
					"slider-min": 25
				},
				't': {
					name: "Temperature",
					"default": 298,
					unit: "K",
					tex: "T",
					"slider-min": 273,
					"slider-max": 473
				},
			},
			constants: {
				'r': 0.0821
			},
			equation: "(p * mw)/(r * t)",
			tex: "\\rho_g = \\frac{P MW}{R T}",
		},
		"mug": {
			name: "Viscousity of Air",
			vars: {
				't': {
					name: "Temperature",
					"default": 298,
					unit: "K",
					tex: "T",
					"slider-min": 273,
					"slider-max": 473
				},
			},
			equation: "(0.0606 * log(t) - 0.2801)/3600",
			tex: "\\mu_g = \\frac{(0.0606 ln(T) - 0.2801)}{3600}",
		},
		"kc": {
			name: "Cunnigham Correction factor",
			subs: [
			"kn",
		],
			vars: {},
			equation: "(1+kn*(1.257 +0.4*exp(-1.1/kn)))",
			tex: "K_c = 1+K_n(\\alpha+\\beta exp(-\\frac{\\epsilon}{K_n})",
		},
		"lambda": {
			name: "mean free path of gas molecules",
			subs: [
				"mug",
			],
			constants: {
				pi: math.pi,
				r2: 8314
			},
			vars: {

				'p': {
					name: "Atmospheric Pressure",
					"default": 1,
					unit: 'atm',
					tex: "P",
					"slider-min": 0.8,
					"slider-max": 1.6,
				},
				'mw': {
					name: "Molecular Weight",
					"default": 29,
					unit: "g/mol",
					tex: "MW",
					"slider-min": 25,
					"slider-max": 35
				},
			},
			equation: "(mug/(0.499*(p*1.01325*10^5)*sqrt(8*mw/(pi * r2 * t))))*10^6",
			tex: "\\lambda_g = \\frac{\\mu_g}{0.499P\\sqrt{\\frac{8MW}{\\pi RT}}}",
		},
		"kn": {
			name: "Knudsen number",
			subs: [
			"lambda",
		],
			vars: {
				'dp': {
					name: "Particle Size",
					"default": 1,
					unit: "um",
					"slider-min": 0.001,
					"slider-max": 100,
					tex: "d_p"
				},
			},
			equation: "2*lambda/dp",
			tex: "K_n = \\frac{2\\lambda_g}{d_p}",
		}
	},

	'esp':{
		'ac_ESP': {
		name: "ESP Collection Area",
		vars: {
			"l": {
				name: "Length",
				"default": 1,
				unit: "m",
				tex: "L",
				"slider-min": 1,
				"slider-max": 10,
				"slider-step": 0.5
			},
			"h": {
				name: "Height",
				"default": 1,
				unit: "m",
				tex: "H",
				"slider-min": 0.5,
				"slider-max": 15,
				"slider-step": 0.5
			},
			"n": {
				name: "Number of Channels",
				"default": 1,
				unit: "",
				tex: "n",
				"slider-min": 1,
				"slider-max": 15,
				"slider-step": 1
			},
		},
		equation: "2*n*h*l",
		tex: "A_{C \\,ESP} = 2n H L",
	},
	
	'omega': {
		name: "Migration Velocity",
		subs: [
			"mug", "kc"
		],
		vars: {
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},
			"dpp": {
				name: "Dielectric Constant of Particle",
				"default": 3,
				unit: '',
				tex: "D'_p",
				"slider-min": 2,
				"slider-max": 8
			},

			'elec': {
				name: "Mean Electric Field Strength",
				"default": 100000,
				unit: "V/m",
				tex: "\\overline{E}",
				"slider-min": 50000,
				"slider-max": 400000
			},
		},
		constants: {
			"epsilon_0": '8.854*(10^(-12))'
		},
		tex: "\\omega_p = (\\frac{3 D'_p}{D'_p +2})\\frac{\\epsilon_0 \\overline{E}^2 d_p K_c}{3 \\mu_g}",
		compute: function (scope) {
			//dp was obtained in micro, so convert it to meter for consistency
			scope.dp = math.eval("dp * 10^-6", scope);
			return math.eval("(3*dpp/(dpp+2))*(epsilon_0* elec^2 * dp * kc )/(3* mug)", scope);
		}
	},

	
	'eta': {
		name: "ESP Efficiency",
		subs: [
			'omega',
			'ac_ESP',
			're_ESP',
		],
		vars: {

		},
		tex: "\\eta(d_p)_{ESP} = 1- exp(-\\frac{\\omega_p \\: A_{c\\,ESP}}{Q_g}) \\quad  if \\: Re_{ESP}>4000 \\\\ or \\ \\eta(d_p)_{ESP} = \\frac{\\omega_p \\: A_{c\\,ESP}}{Q_g}  \\\ if \\: Re_{ESP}<2200",
		compute: function (scope) {
			if(scope.re_ESP < 2200) {
					var result = math.eval("(omega * ac_ESP)/qg", scope);
					return(result > 1) ? 1 : result;
			}
			else if(scope.re_ESP > 4000)
				return math.eval('1 - exp((-omega * ac_ESP)/qg)', scope)
			else
				return false;
		}
	},
	
	're_ESP': {
		name: "Re ESP",
		subs: [
			'rg',
			'mug'
		],
		vars: {
			'qg': {
				name: "Gas Flow Rate",
				"default": 1,
				unit: "m^3/s",
				"slider-min": 0,
				"slider-max": 100,
				tex: "Q_g"
			},
			'h': {
				name: "Height",
				"default": 1,
				unit: "m",
				tex: "H",
				"slider-min": 0.5,
				"slider-max": 15,
				"slider-step": 0.5
			},
			"n": {
				name: "Number of Channels",
				"default": 1,
				unit: "",
				tex: "n",
				"slider-min": 1,
				"slider-max": 15,
				"slider-step": 1
			},
			"d": {
				name: "Distance between plates",
				"default": 1,
				unit: "m",
				tex: "D",
				"slider-min": 0.2,
				"slider-max": 0.5,
				"slider-step": 0.05
			},
		},
		tex: "Re_{ESP} = \\frac{2Q_g \\rho_g}{n (D + H)\\mu_g}",
		equation: "(2 * qg * rg)/(n*(d + h)*mug)",
	},

	
	'rg': {
		name: "Gas Density",
		vars: {
			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35
			},
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		constants: {
			'r': 0.0821
		},
		equation: "(p * mw)/(r * t)",
		tex: "\\rho_g = \\frac{P MW}{R T}",
	},
	"mug": {
		name: "Viscosity of Air",
		vars: {
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		equation: "(0.0606 * log(t) - 0.2801)/3600",
		tex: "\\mu_g = \\frac{(0.0606 ln(T) - 0.2801)}{3600}",
	},
	"kc":{
		name:"Cunnigham Correction factor",
		subs: [
			"kn",		
		],
		vars:{},
		equation: "(1+kn*(1.257 +0.4*exp(-1.1/kn)))",
		tex: "K_c = 1+K_n(\\alpha+\\beta exp(-\\frac{\\epsilon}{K_n})",
	},
	"lambda":{
		name:"mean free path of gas molecules",
		subs: [
			"mug",	
		],
		constants: {
			pi: math.pi,
			r2: 8314
		},
		vars:{

			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35
			},
		},
		equation: "(mug/(0.499*(p*1.01325*10^5)*sqrt(8*mw/(pi * r2 * t))))*10^6",
		tex: "\\lambda_g = \\frac{\\mu_g}{0.499P\\sqrt{\\frac{8MW}{\\pi RT}}}",
	},
	"kn":{
		name:"Knudsen number",
		subs: [
			"lambda",	
		],
		vars:{
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},	
		},
		equation: "2*lambda/dp",
		tex: "K_n = \\frac{2\\lambda_g}{d_p}",
	}
	
	},
	

	'venturi': {	
	'eta':{
		name: "Venturi Efficiency",
		subs:[
			'kc',
			'mug',
		],
		vars:{
			"rl": {
				name: "Density of liquid",
				"default": 1000,
				unit: 'kg/m^3',
				tex: '\\rho_L',
				"slider-min": 750,
				"slider-max": 2000
			},
			"rp": {
				name: "Density of Particle",
				"default": 1000,
				unit: 'kg/m^3',
				tex: '\\rho_p',
				"slider-min": 500,
				"slider-max": 5000
			},
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},	
			"ug": {
				"default": 50,
				name: "Velocity in venturi throat",
				unit: "m/s",
				tex: "\\overline{u_g}",
				"slider-min": 50,
				"slider-max": 150,
				//step : 1
			},
			'ql': {
				name: "Liquid flow rate",
				"default": 0.001,
				unit: "m^3/s",
				tex: "Q_L",
				"slider-min": 0.001,
				"slider-max": 5,
			},
			'qg': {
				name: "Gas Flow Rate",
				"default": 1,
				unit: "m^3/s",
				"slider-min": 0,
				"slider-max": 100,
				tex: "Q_g"
			},
			"f": {
				name: "experimental coefficient",
				"default": 0.25,
				unit: "",
				tex: "f",
				"slider-min": 0.1,
				"slider-max": 0.4,
				//step : 1
			},
		},
			tex: "\\eta (d_p)_{venutri} = 1-exp\\left(-\\frac{6.3 10^-4 \\rho_l \\rho_p K_c d_p^2 \\overline{u_g}^2 (\\frac{Q_L}{Q_g}) f^2}{ \\mu_g^2}\\right)",
		equation: "1-exp(-((6.3*0.0001)*rl*rp*kc*(dp*10^-6)^2*ug^2*(ql/qg)*f^2)/(mug^2))",
	},
	
	'deltap': {
		name: "Pressure drop across the Venturi",
		
		vars: {
			"ug": {
				"default": 50,
				name: "Velocity in venturi throat",
				unit: "m/s",
				tex: "\\overline{u_g}",
				"slider-min": 50,
				"slider-max": 150,
				//step : 1
			},
			'ql': {
				name: "Liquid flow rate",
				"default": 0.001,
				unit: "m^3/s",
				tex: "Q_L",
				"slider-min": 0.001,
				"slider-max": 5,
			},
			'qg': {
				name: "Gas Flow Rate",
				"default": 1,
				unit: "m^3/s",
				"slider-min": 0,
				"slider-max": 100,
				tex: "Q_g"
			},
			"beta": {
				name: "experimental coefficient",
				"default": 0.85,
				unit: "",
				tex: "\\beta",
	//			"slider-min": 0.1,
	//			"slider-max": 0.4,
				//step : 1
				slider: false,
			},	
		},
		constants: {
//			'g': 9.81,
			'rl':1000,
		},
//	equation: "beta*rl*ug^2*(ql/qg)",
		tex: "\\Delta_p (Pas) = \\beta \\rho_L \\overline{u_g}^2 (\\frac{Q_L}{Q_g})",
		
		compute: function (scope) {
				return math.eval('beta*rl*ug^2*(ql/qg)', scope)		
		}
	},
	
	
	
	
	
	'rg': {
		name: "Gas Density",
		vars: {
			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35,
			},
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		constants: {
			'r': 0.0821
		},
		equation: "(p * mw)/(r * t)",
		tex: "\\rho_g = \\frac{P MW}{R T}",
	},
	"mug": {
		name: "Viscosity of Air",
		vars: {
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		equation: "(0.0606 * log(t) - 0.2801)/3600",
		tex: "\\mu_g = \\frac{(0.0606 ln(T) - 0.2801)}{3600}",
	},
	"kc":{
		name:"Cunnigham Correction factor",
		subs: [
			"kn",		
		],
		vars:{},
		equation: "(1+kn*(1.257 +0.4*exp(-1.1/kn)))",
		tex: "K_c = 1+K_n(\\alpha+\\beta exp(-\\frac{\\epsilon}{K_n})",
	},
	"lambda":{
		name:"mean free path of gas molecules",
		subs: [
			"mug",	
		],
		constants: {
			pi: math.pi,
			r2: 8314
		},
		vars:{

			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35,
			},
		},
		equation: "(mug/(0.499*(p*1.01325*10^5)*sqrt(8*mw/(pi * r2 * t))))*10^6",
		tex: "\\lambda_g = \\frac{\\mu_g}{0.499P\\sqrt{\\frac{8MW}{\\pi RT}}}",
	},
	"kn":{
		name:"Knudsen number",
		subs: [
			"lambda",	
		],
		vars:{
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},	
		},
		equation: "2*lambda/dp",
		tex: "K_n = \\frac{2\\lambda_g}{d_p}",
	}
	
},	

	'cyclone':{
	'eta_cyclone_theoretical': {
		name: "Cyclone Efficiency,thoretical",
		subs: [
			'mug',
		],
		vars: {
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},	
			"rp": {
				name: "Density of Particle",
				"default": 1000,
				unit: 'kg/m^3',
				tex: '\\rho_p',
				"slider-min": 500,
				"slider-max": 5000
			},
			'qg': {
				name: "Gas Flow Rate",
				"default": 1,
				unit: "m^3/s",
				"slider-min": 0,
				"slider-max": 15,
				tex: "Q_g"
			},
			"w": {
				name: "Width of inlet",
				"default": 0.25,
				unit: "m",
				tex: "W/D_O",
				"slider-min": 0.5,
				"slider-max": 1,
			},
			'h': {
				name: "Height of inlet",
				"default": 0.5,
				unit: "m",
				tex: "H/D_o",
				"slider-min": 0.5,
				"slider-max": 1,
			},
			'l1': {
				name: "L1",
				"default": 2,
				unit: "m",
				tex: "L1/D_o",
				"slider-min": 2,
				"slider-max": 2,
			},
			'l2': {
				name: "L2",
				"default": 2,
				unit: "m",
				tex: "L2/D_o",
				"slider-min": 2,
				"slider-max": 2,
			},
			'do': {
				name: "Body diameter",
				"default": 1,
				unit: "um",
				"slider-min": 0.1,
				"slider-max": 3,
				tex: "D_o"
			},
		},
		
		constants: {
			pi: math.pi,
		},
	tex: "\\eta(d_p)_{Cyclone, theoretical} = \\frac{d_p^2 \\rho_p Q_g \\Pi N_e}{9 \\mu_g W^2 H}",
		equation: '(dp*10^-6)^2*rp*qg*pi*(1/h)*(l1+0.5*l2)/(9*mug*(w*do)^2*(h*do))'		
	},

	'eta': {
		name: "Cyclone Efficiency,empirical",
		subs: [
			'mug',
			'dpc',
		],
		vars: {
			'dp': {
				name: "Particle Size",
				"default": 1,
				unit: "um",
				"slider-min": 0.001,
				"slider-max": 100,
				tex: "d_p"
			},	
		},
		
	tex: "\\eta(d_p)_{Cyclone, empirical} =f(d_p/d_{pc})",
		compute: function (scope) {
				return math.eval('1/(1+(dpc/dp)^2)', scope)		
		}
	},
	
	'dpc':{	
	name:"Cyclone cutoff diameter",
		subs: [
			'mug',
		],
		vars: {	
			"w": {
				name: "Width of inlet",
				"default": 0.25,
				unit: "m",
				tex: "W/D_O",
				"slider-min": 0.5,
				"slider-max": 1,
			},
			'h': {
				name: "Height of inlet",
				"default": 0.5,
				unit: "m",
				tex: "H/D_o",
				"slider-min": 0.5,
				"slider-max": 1,
			},
			"rp": {
				name: "Density of Particle",
				"default": 1000,
				unit: 'kg/m^3',
				tex: '\\rho_p',
				"slider-min": 500,
				"slider-max": 5000
			},
			'qg': {
				name: "Gas Flow Rate",
				"default": 1,
				unit: "m^3/s",
				"slider-min": 0,
				"slider-max": 15,
				tex: "Q_g"
			},
			'l1': {
				name: "L1",
				"default": 2,
				unit: "m",
				tex: "L1/D_o",
				"slider-min": 2,
				"slider-max": 2,
			},
			'l2': {
				name: "L2",
				"default": 2,
				unit: "m",
				tex: "L2/D_o",
				"slider-min": 2,
				"slider-max": 2,
			},
			'do': {
				name: "Body diameter",
				"default": 1,
				unit: "um",
				"slider-min": 0.1,
				"slider-max": 3,
				tex: "D_o"
			},
		},
		
		constants: {
			pi: math.pi,
		},
	tex: "d_{pc} = \\sqrt{\\frac{9 \\mu_g W^2 H}{2 \\rho_p Q_g \\Pi N_e}}",
		equation: '(sqrt(9*mug*(w*do)^2*(h*do)/(2*rp*qg*pi*(1/h)*(l1+0.5*l2))))*10^6'
		
	},
	
	
	'deltap': {
		name: "Pressure drop across the cyclone",
		subs: [
			'rg',
		],
		
		vars: {
			'qg': {
				name: "Gas Flow Rate",
				"default": 1,
				unit: "m^3/s",
				"slider-min": 0,
				"slider-max": 15,
				tex: "Q_g"
			},
			"w": {
				name: "Width of inlet",
				"default": 0.25,
				unit: "m",
				tex: "W/D_O",
				"slider-min": 0.5,
				"slider-max": 1,
			},
			'h': {
				name: "Height of inlet",
				"default": 0.5,
				unit: "m",
				tex: "H/D_o",
				"slider-min": 0.5,
				"slider-max": 1,
			},
			'do': {
				name: "Body diameter",
				"default": 1,
				unit: "um",
				"slider-min": 0.1,
				"slider-max": 3,
				tex: "D_o"
			},
			'de': {
				name: "Exit diameter",
				"default": 0.5,
				unit: "um",
				"slider-min": 0.1,
				"slider-max": 2,
				tex: "D_e/D_o"
			},
			'k': {
				name: "Cyclone empiricla factor",
				"default": 16,
				unit: "",
				"slider-min": 7.5,
				"slider-max": 16,
				tex: "k"
			},
		},
		constants: {
			'g': 9.81,
			'rl':1000,
		},
//	equation: "qg^2*rg*k)/(2*g*1000*h*w*de^2",
		tex: "\\Delta_p (m \\:H_2O) = \\frac{\\overline{u_g}^2 \\rho_g}{2 g \\rho_L} k \\frac{HW}{D_e^2}= \\frac{Q_g^2 \\rho_g }{2 g \\rho_L H W D_e^2}k",
		
				compute: function (scope) {
				return math.eval('(qg^2*rg*k)/(2*g*1000*h*w*de^2)', scope)		
		}
	},
	
	
	'rg': {
		name: "Gas Density",
		vars: {
			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35,
			},
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		constants: {
			'r': 0.0821
		},
		equation: "(p * mw)/(r * t)",
		tex: "\\rho_g = \\frac{P MW}{R T}",
	},
	"mug": {
		name: "Viscosity of Air",
		vars: {
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		equation: "(0.0606 * log(t) - 0.2801)/3600",
		tex: "\\mu_g = \\frac{(0.0606 ln(T) - 0.2801)}{3600}",
	},	
	
	},
	
	'adsorption':{
		
	'qads': {
		name: "Freundlich adsorption isotherm",
		subs: [
		],
		vars: {
			'c': {
				name: "Concentration",
				"default": 10,
				unit: "mg/m3",
				"slider-min": 0,
				"slider-max": 1000,
				tex: "C"
			},	
			'k': {
				name: "Freundlich constant",
				"default": 10,
				unit: "",
				"slider-min": 0,
				"slider-max": 1000,
				tex: "K"
			},	
			
			'n': {
				name: "Freundlich power",
				"default": 1,
				unit: "",
				"slider-min": 0.001,
				"slider-max": 10,
				tex: "n"
			},	
		},
		
	tex: "q_{ads}=K C^{\\frac{1}{n}}",
			equation: "k*c^(1/n)",
	},

	'cads': {
		name: "Freundlich adsorption isotherm",
		subs: [
		],
		vars: {
			'beta': {
				name: "beta",
				"default": 10,
				unit: "mg/m3",
				"slider-min": 0.0001,
				"slider-max": 100,
			tex: "\\beta"
			},	
			'q': {
				name: "Freundlich constant",
				"default": 0.5,
				unit: "g/g",
				"slider-min": 0,
				"slider-max": 1,
				tex: "q_{sat}"
			},	
			'alpha': {
				name: "Freundlich power",
				"default": 1,
				unit: "",
				"slider-min": 0,
				"slider-max": 10,
				tex: "\\alpha"
			},	
		},
		
	tex: "\\frac{m_a}{V_{g,T}}=\\alpha (q_{sat})^{\\beta}",
			equation: "alpha*q^(beta)",
	},

	'uad': {
		name: "Velocity of adsorption zone",
		subs: [
				 "rg",
		],
		vars: {
			'm': {
				name: "mass feed rate",
				"default": 1,
				unit: "kg/s",
				"slider-min": 0,
				"slider-max": 100,
			tex: "\\dot{m}_{g,T}"
			},	
			'rads': {
				name: "apparent density",
				"default": 0.5,
				unit: "",
				"slider-min": 0,
				"slider-max": 1,
				tex: "\\rho_{ad}"
			},	
			'acsa': {
				name: "Cross sectional area",
				"default": 1,
				unit: "m^2",
				"slider-min": 0,
				"slider-max": 100,
				tex: "A_{CSA}"
			},	
			'alpha': {
				name: "Freundlich power",
				"default": 1,
				unit: "",
				"slider-min": 0,
				"slider-max": 10,
				tex: "\\alpha"
			},	
			'beta': {
				name: "beta",
				"default": 10,
				unit: "mg/m3",
				"slider-min": 1.1,
				"slider-max": 100,
			tex: "\\beta"
			},				
			'c': {
				name: "Concentration",
				"default": 10,
				unit: "mg/m3",
				"slider-min": 0,
				"slider-max": 1000,
				tex: "\\frac{m_a}{V_{g,T}}"
			},	
		},
		
	tex: "u_{ad}=\\frac{\\dot{m}_{g,T}}{\\rho_g \\:\\rho_{ad} A_{CSA}}\\alpha^{\\frac{1}{\\beta}}(\\frac{m_a}{V_{g,T}})^{\\frac{\\beta-1}{\\beta}}",
			equation: "m/(rg*rads*acsa)*(alpha^(1/beta))*c^((beta-1)/beta)",
	},

	'deltaad': {
		name: "Width of adsorption zone",
		subs: [
				"rg",
		],
		vars: {
			'm': {
				name: "mass feed rate",
				"default": 1,
				unit: "kg/s",
				"slider-min": 0,
				"slider-max": 100,
			tex: "\\dot{m}_{g,T}"
			},	
			'k': {
				name: "Mass transfer coefficient",
				"default": 0.5,
				unit: "",
				"slider-min": 0,
				"slider-max": 10,
				tex: "K"
			},	
			'acsa': {
				name: "Cross sectional area",
				"default": 1,
				unit: "m^2",
				"slider-min": 0,
				"slider-max": 100,
				tex: "A_{CSA}"
			},	
			'beta': {
				name: "beta",
				"default": 10,
				unit: "mg/m3",
				"slider-min": 1.1,
				"slider-max": 100,
				tex: "\\beta"
			},	
		},
		
	tex: "\\delta_{ad}=\\frac{\\dot{m}_{g,T}}{\\rho_g \\: A_{CSA} \\:K}(Ln(\\frac{0.99}{0.01})+(\\frac{1}{\\beta-1})Ln(\\frac{1-0.01^{(\\beta-1)}}{1-0.99^{(\\beta-1)}})",
		equation: "(m/(rg*acsa*k))*(log(0.99/0.01)+(1/(beta-1))*(log((1-0.01^(beta-1))/(1-0.99^(beta-1)))))",
	},


	'tb': {
		name: "Breakthrough time",
		subs: ["uad", "deltaad",
		],
		vars: {
			'l': {
				name: "Bed length",
				"default": 1,
				unit: "m",
				"slider-min": 0.0001,
				"slider-max": 100,
			tex: "L"
			},		
		},
		
	tex: "t_B=\\frac{L-\\delta_{ad}}{u_{ads}}",
			equation: "(l-deltaad)/uad",
	},	
	
	
	'rg': {
		name: "Gas Density",
		vars: {
			'p': {
				name: "Atmospheric Pressure",
				"default": 1,
				unit: 'atm',
				tex: "P",
				"slider-min": 0.8,
				"slider-max": 1.6,
	//			"step": 0.1
			},
			'mw': {
				name: "Molecular Weight",
				"default": 29,
				unit: "g/mol",
				tex: "MW",
				"slider-min": 25,
				"slider-max": 35,
			},
			't': {
				name: "Temperature",
				"default": 298,
				unit: "K",
				tex: "T",
				"slider-min": 273,
				"slider-max": 473
			},
		},
		constants: {
			'r': 0.0821
		},
		equation: "(p * mw)/(r * t)",
		tex: "\\rho_g = \\frac{P MW}{R T}",
	},
	},
	};
