var instance_skel = require('../../../instance_skel')
var config = require('./config.js');
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var debug;

const colorsys = require('colorsys');

const { Client } = require('tplink-smarthome-api');

instance.prototype.INTERVAL = null; //used for polling device

instance.prototype.DEVICES = []; //array of objects to control strips
instance.prototype.DEVICEINFO = []; //data for each strip

instance.prototype.BRIGHTNESS_INTERVAL = null; //used for brightness up/down actions

instance.prototype.CHOICES_STRIPS = [ { id: 0, label: 'No Strips Configured'} ];
instance.prototype.CHOICES_STRIPS_FEEDBACKS = [ { id: 0, label: 'No Strips Configured'} ];

instance.prototype.CHOICES_CUSTOM_EFFECTS = [{ id: 'default', label: 'No Custom Effects Saved'}];

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	let self = this;

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	let self = this;

	self.stopInterval();
	self.brightness_fader_stop();

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	let self = this;

	debug = self.debug
	log = self.log

	self.status(self.STATUS_WARNING, 'connecting');

	self.openConnections();

	self.buildChoices();

	self.getInformation();
	self.setupInterval();

	self.init_actions();
	self.init_variables();
	self.init_feedbacks();
	self.init_presets();
	
	self.checkVariables();
	self.checkFeedbacks();
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	return config.setConfig.bind(this)();
}

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	let self = this;
	self.config = config

	self.status(self.STATUS_WARNING, 'connecting');

	self.closeConnections(); //close out any existing connections after a config update and re-initialize them
	
	self.openConnections();

	self.buildChoices();

	self.getInformation();
	self.setupInterval();

	self.init_actions();
	self.init_variables();
	self.init_feedbacks();
	self.init_presets();
	
	self.checkVariables();
	self.checkFeedbacks();
}

instance.prototype.closeConnections = function() {
	let self = this;

	for (let i = 0; i < self.DEVICES.length; i++) {
		self.DEVICES[i]
		.then((device) => {
			self.log('info', 'Closing Connection to Strip #' + (i+1));
			device.closeConnection();
		})
		.catch((error) => {
			self.handleError(i, error);	
		});
	}

	self.DEVICES = [];
};

instance.prototype.buildChoices = function () {
	let self = this;

	self.CHOICES_STRIPS = [];
	self.CHOICES_STRIPS_FEEDBACKS = [];

	for (let i = 0; i < self.config.stripcount; i++) {
		let listObj = {
			id: i,
			label: 'Strip #' + (i+1)
		}
		self.CHOICES_STRIPS.push(listObj);
		self.CHOICES_STRIPS_FEEDBACKS.push(listObj);
	}

	let allObj = {
		id: -1,
		label: 'All Strips'
	};
	self.CHOICES_STRIPS.push(allObj);
}

instance.prototype.openConnections = function () {
	let self = this;
	
	for (let i = 0; i < self.config.stripcount; i++) {
		if (self.config['host' + i] && self.config['host' + i] !== '') {
			try {
				if (!self.DEVICES[i]) {
					self.log('info', 'Opening Connection to Strip #' + (i+1));

					let client = new Client();
					self.DEVICES.splice(i, 0, {}); //make room for it if it doesn't exist
					self.DEVICES[i] = client.getDevice({ host: self.config['host' + i] });
				}

				self.DEVICES[i]
				.then((device) => {
					self.setAlias(i, self.config['alias' + i]);
				})
			}
			catch(error) {
				self.handleError(i, error);
				errorState = true;
			}
		}
	}
}

instance.prototype.setAliases = function () {
	let self = this;

	for (let i = 0; i < self.config.stripcount; i++) {
		self.setAlias(i, self.config['alias' + i]);
	}
}

instance.prototype.getInformation = async function () {
	//Get all information from Device
	let self = this;

	let errorState = false;

	for (let i = 0; i < self.config.stripcount; i++) {
		if (self.config['host' + i] && self.config['host' + i] !== '') {
			try {				
				self.DEVICES[i]
				.then((device) => {
					device.getSysInfo()
					.then((info) => {
						if (!self.DEVICEINFO[i]) {
							self.DEVICEINFO.splice(i, 0, {}); //make room for it if it doesn't exist
						}
						self.DEVICEINFO[i] = info;
		
						if (self.DEVICEINFO[i]) {
							self.setVariable('status' + (i+1), 'Connected');
		
							try {
								self.updateData(i);
								self.checkVariables();
								self.checkFeedbacks();
							}
							catch(error) {
								self.handleError(i, error);
								errorState = true;
							}
						}
					})
					.catch((error) => {
						self.handleError(i, error);
						errorState = true;
					});
				})
				.catch((error) => {
					self.handleError(i, error);
					errorState = true;
				});
			}
			catch(error) {
				self.handleError(i, error);
				errorState = true;
			}
			finally {
				self.checkVariables();
				self.checkFeedbacks();
			}
		}
	}

	if (errorState) {
		self.status(self.STATUS_ERROR);
	}
	else {
		self.status(self.STATUS_OK); 
	}
};

instance.prototype.handleError = function(i, err) {
	let self = this;

	self.log('error', 'Stopping Update interval due to an error with Strip # ' + (i+1) + '. Check the log for more information.');
	self.stopInterval();

	let error = err.toString();

	self.status(self.STATUS_ERROR);

	Object.keys(err).forEach(function(key) {
		if (key === 'code') {
			if (err[key] === 'ECONNREFUSED') {
				error = 'Unable to communicate with Strip #' + (i+1) + '. Connection refused. Is this the right IP address? Is it still online?';
			}
		}
	});

	self.setVariable('status' + (i+1), 'Error (see log)');
	self.log('error', error);
};

instance.prototype.setupInterval = function() {
	let self = this;

	if (self.INTERVAL !== null) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	self.config.interval = parseInt(self.config.interval);

	if (self.config.interval > 0) {
		self.log('info', 'Starting Update Interval.');
		self.INTERVAL = setInterval(self.getInformation.bind(self), self.config.interval);
	}
};

instance.prototype.stopInterval = function () {
	let self = this;

	if (self.INTERVAL) {
		self.log('info', 'Stopping Update Interval.');
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}
};

instance.prototype.updateData = function (i) {
	let self = this;

	let rebuild = false;

	if (self.DEVICEINFO[i]) {
		let oldHue = self.DEVICEINFO[i].CURRENT_HUE;
		let oldSaturation = self.DEVICEINFO[i].CURRENT_SATURATION;
		let oldColorTemp = self.DEVICEINFO[i].CURRENT_COLOR_TEMP;
		let oldBrightness = self.DEVICEINFO[i].CURRENT_BRIGHTNESS;

		let oldAlias = self.DEVICEINFO[i].CURRENT_ALIAS;	
	
		if ('hue' in self.DEVICEINFO[i].light_state) {
			self.DEVICEINFO[i].CURRENT_HUE = parseInt(self.DEVICEINFO[i].light_state.hue);
		}
	
		if ('saturation' in self.DEVICEINFO[i].light_state) {
			self.DEVICEINFO[i].CURRENT_SATURATION = parseInt(self.DEVICEINFO[i].light_state.saturation);
		}
	
		if ('color_temp' in self.DEVICEINFO[i].light_state) {
			self.DEVICEINFO[i].CURRENT_COLORTEMP = parseInt(self.DEVICEINFO[i].light_state.color_temp);
		}
	
		if ('brightness' in self.DEVICEINFO[i].light_state) {
			self.DEVICEINFO[i].CURRENT_BRIGHTNESS = parseInt(self.DEVICEINFO[i].light_state.brightness);
		}
	
		if ((oldHue !== self.DEVICEINFO[i].CURRENT_HUE) || (oldSaturation !== self.DEVICEINFO[i].CURRENT_SATURATION) || (oldColorTemp !== self.DEVICEINFO[i].CURRENT_COLOR_TEMP) || (oldBrightness !== self.DEVICEINFO[i].CURRENT_BRIGHTNESS)) {
			rebuild = true;
		}

		try {
			self.DEVICEINFO[i].CURRENT_COLOR_RGB = self.getRGB(self.DEVICEINFO[i].CURRENT_HUE, self.DEVICEINFO[i].CURRENT_SATURATION, self.DEVICEINFO[i].CURRENT_BRIGHTNESS);
			self.DEVICEINFO[i].CURRENT_COLOR_HEX = self.getHex(self.DEVICEINFO[i].CURRENT_HUE, self.DEVICEINFO[i].CURRENT_SATURATION, self.DEVICEINFO[i].CURRENT_BRIGHTNESS);
			self.DEVICEINFO[i].CURRENT_COLOR_DECIMAL = self.getDecimal(self.DEVICEINFO[i].CURRENT_HUE, self.DEVICEINFO[i].CURRENT_SATURATION, self.DEVICEINFO[i].CURRENT_BRIGHTNESS);
		}
		catch(error) {
			self.handleError(i, error);
		}

		if ('alias' in self.DEVICEINFO[i]) {
			self.DEVICEINFO[i].CURRENT_ALIAS = self.DEVICEINFO[i].alias;
		}

		if (oldAlias !== self.DEVICEINFO[i].CURRENT_ALIAS) {
			rebuild = true;
			self.CHOICES_STRIPS[i].label = 'Strip #' + (i+1) + ' (' + self.DEVICEINFO[i].alias + ')';
		}

		if (rebuild) {
			self.init_actions();
			self.init_feedbacks();
		}
	}
};

instance.prototype.getRGB = function(hue, sat, brightness) {
	let self = this;

	return colorsys.hsv2Rgb(hue, sat, brightness);
};

instance.prototype.getHex = function (hue, sat, brightness) {
	let self = this;

	let rgb = self.getRGB(hue, sat, brightness);

	return colorsys.rgbToHex(rgb.r, rgb.g, rgb.b);
};

instance.prototype.getDecimal = function(hue, sat, brightness) {
	let self = this;

	return parseInt(self.getHex(hue, sat, brightness).replace('#',''), 16);
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.init_actions = function (system) {
	this.setActions(actions.setActions.bind(this)());
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks.bind(this)());
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables.bind(this)());
}

// Set Initial Variable Values
instance.prototype.checkVariables = function () {
	variables.checkVariables.bind(this)();
}

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets.bind(this)());
}

// ###############################################
// ##### Power, Brightness, Color Functions ######
// ###############################################

instance.prototype.setPower = function(powerState, transition, options, i) {
	let self = this;

	if (self.config['host' + i] && self.config['host' + i] != '') {
		try {		
			self.DEVICES[i]
			.then((device) => {
				self.log('info', 'Turning Strip #' + (i+1) + ' ' + (powerState == 1 ? 'On' : 'Off'));
				device.setPowerState(powerState);
			})
			.catch((error) => {
				self.handleError(i, error);
			});
		}
		catch(error) {
			self.handleError(i, error);
		}
	};
};

instance.prototype.powerToggle = function(i) {
	let self = this;

	if (self.config['host' + i] && self.config['host' + i] != '') {
		try {			
			self.DEVICES[i]
			.then((device) => {
				self.log('info', 'Toggling Power for Strip #' + (i+1));
				device.togglePowerState();
			})
			.catch((error) => {
				self.handleError(i, error);	
			});
		}
		catch(error) {
			self.handleError(i, error);
		}
	};
};

instance.prototype.setBrightness = function(transition, brightness) {
	let self = this;

	if (self.BRIGHTNESS_STRIP_INDEX == -1) {
		for (let i = 0; i < self.config.stripcount; i++) {
			self.setBrightnessStrip(transition, brightness, i);
		}
	}
	else if (self.BRIGHTNESS_STRIP_INDEX >=0) {
		self.setBrightnessStrip(transition, brightness, self.BRIGHTNESS_STRIP_INDEX);
	}
};

instance.prototype.setBrightnessStrip = function(transition, brightness, i) {
	let self = this;

	if (self.config['host' + i]) {
		try {				
			self.DEVICES[i]
			.then((device) => {
				//self.log('info', 'Setting Strip #' + (i+1) + ' Brightness to: ' + brightness) + '%';
				let cmd = {
					'smartlife.iot.lightStrip': {
						set_light_state: {
							ignore_default: 1,
							on_off: 1,
							transition: transition,
							brightness: brightness
						}
					}
				};
				device.send(cmd);
			});
		}
		catch(error) {
			self.handleError(i, error);
		}
	};
};


instance.prototype.brightness_change = function(direction) {
	let self = this;

	let newLevel;

	if (self.BRIGHTNESS_STRIP_INDEX == -1) {
		newLevel = self.DEVICEINFO[0].CURRENT_BRIGHTNESS;
	}
	else {
		newLevel = self.DEVICEINFO[self.BRIGHTNESS_STRIP_INDEX].CURRENT_BRIGHTNESS;
	}

	if (direction === 'up') {
		newLevel++;
	}
	else {
		newLevel--;
	}

	if ((newLevel > 100) || (newLevel < 0)) {
		self.brightness_fader(direction, 'stop', null);
		self.BRIGHTNESS_STRIP_INDEX = undefined;
	}
	else {
		self.setBrightness(0, newLevel, self.BRIGHTNESS_STRIP_INDEX);
		if (self.BRIGHTNESS_STRIP_INDEX == -1) {
			for (let i = 0; i < self.config.stripcount; i++) {
				self.DEVICEINFO[i].CURRENT_BRIGHTNESS = newLevel;
				self.setVariable('brightness' + (i+1), newLevel);
			}
		}
		else {
			self.DEVICEINFO[self.BRIGHTNESS_STRIP_INDEX].CURRENT_BRIGHTNESS = newLevel;
			self.setVariable('brightness' + (self.BRIGHTNESS_STRIP_INDEX+1), newLevel);
		}
	}
};

instance.prototype.brightness_fader = function(direction, mode, rate) {
	let self = this;

	self.brightness_fader_stop();

	if (mode === 'start') {
		self.stopInterval(); //stop the regular update interval as it will mess with the brightness otherwise
		self.BRIGHTNESS_INTERVAL = setInterval(self.brightness_change.bind(self), parseInt(rate), direction);
	}
	else {
		self.setupInterval(); //restart regular update interval if needed
	}
};

instance.prototype.brightness_fader_stop = function() {
	let self = this;

	if (self.BRIGHTNESS_INTERVAL !== null) {
		clearInterval(self.BRIGHTNESS_INTERVAL);
		self.BRIGHTNESS_INTERVAL = null;
		self.BRIGHTNESS_STRIP_INDEX = undefined;
	}
}

instance.prototype.setColorTemp = function(transition, options, i) {
	let self = this;

	if (self.config['host' + i] && self.config['host' + i] != '') {
		try {		
			self.DEVICES[i]
			.then((device) => {
				self.log('info', 'Turning Strip #' + (i+1) + ' to Color Temp: '  + options.color_temp + 'K');
				let cmd = {
					'smartlife.iot.lightStrip': {
						set_light_state: {
							ignore_default: 1,
							on_off: 1,
							transition: transition,
							...options
						}
					}
				};
				device.send(cmd);
			})
			.catch((error) => {
				self.handleError(i, error);	
			});
		}
		catch(error) {
			self.handleError(i, error);
		}
	};
};

instance.prototype.setColor = function(transition, options, i) {
	let self = this;

	if (self.config['host' + i] && self.config['host' + i] != '') {
		try {				
			self.DEVICES[i]
			.then((device) => {
				self.log('info', 'Turning Strip #' + (i+1) + ' ' + ' to Color: ' + self.getRGB(options.hue, options.saturation, options.brightness));

				let cmd = {
					'smartlife.iot.lightStrip': {
						set_light_state: {
							ignore_default: 1,
							on_off: 1,
							transition: transition,
							...options
						}
					}
				};
				device.send(cmd);
			})
			.catch((error) => {
				self.handleError(i, error);	
			});
		}
		catch(error) {
			self.handleError(i, error);
		}
	};
};

instance.prototype.setEffect = function(effect) {
	let self = this;

	for (let i = 0; i < self.config.stripcount; i++) {
		if (self.config['host' + i] && self.config['host' + i] != '') {
			try {				
				self.DEVICES[i]
				.then((device) => {
					self.log('info', 'Setting Strip #' + (i+1) + ' ' + ' to Effect: ' + effect.name);
					let cmd = {
						'smartlife.iot.lighting_effect': {
							set_lighting_effect: effect
						}
					};
					device.send(cmd);
				})
				.catch((error) => {
					self.handleError(i, error);	
				});
			}
			catch(error) {
				self.handleError(i, error);
			}
		};
	}
};

instance.prototype.setAlias = function(i, newName) {
	let self = this;

	if (self.DEVICES[i]) {
		try {
			if (self.config['alias' + i] !== '') {
				self.log('info', 'Setting Strip #' + (i+1) + ' Alias to: ' + newName);
				
				self.DEVICES[i]
				.then((device) => {
					device.setAlias(newName);
				});
			}
		}
		catch(error) {
			self.handleError(i, error);
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;