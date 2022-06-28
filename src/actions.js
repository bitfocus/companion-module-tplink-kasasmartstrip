const dgram = require('dgram');
const colorsys = require('colorsys');

const c = require('./choices.js');

module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function () {
		let self = this;
		let actions = {}

		// ########################
		// #### Power Actions ####
		// ########################

		actions.power = {
			label: 'Power On/Off',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'dropdown',
					label: 'On/Off',
					id: 'onoff',
					default: 1,
					choices: [ { id: 0, label: 'Off'}, { id: 1, label: 'On'}, { id: 2, label: 'Toggle'}]
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let strip = action.options.strip;
				let powerState = action.options.onoff;
				let optionsObj = {};
				optionsObj.brightness = 100;
				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				if (strip == -1) {
					for (let i = 0; i < self.config.stripcount; i++) {
						if (powerState == 2) {
							self.powerToggle(i);
						}
						else {
							self.setPower(powerState, transition, optionsObj, i);
						}
						
					}
				}
				else {
					if (powerState == 2) {
						self.powerToggle(strip);
					}
					else {
						self.setPower(powerState, transition, optionsObj, strip);
					}
				}
			}
		}

		// ############################
		// #### Brightness Actions ####
		// ############################

		actions.brightness = {
			label: 'Set Brightness',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'number',
					label: 'Brightness',
					id: 'brightness',
					tooltip: 'Sets the brightness (0 - 100)',
					min: 0,
					max: 100,
					default: self.CURRENT_BRIGHTNESS,
					step: 1,
					required: true,
					range: true
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let strip = action.options.strip;

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				self.BRIGHTNESS_STRIP_INDEX = action.options.strip;

				self.setBrightness(parseInt(transition), action.options.brightness);
			}
		}

		actions.brightnessUp = {
			label: 'Brightness Up Continuously',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'textinput',
					label: 'Increase Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let rate = action.options.rate;
				self.parseVariables(rate, function (value) {
					rate = value;
				});
				rate = parseInt(rate);

				self.BRIGHTNESS_STRIP_INDEX = action.options.strip;

				self.brightness_fader('up', 'start', rate);
			}
		}

		actions.brightnessUpStop = {
			label: 'Brightness Up Stop',
			callback: function (action, bank) {
				self.brightness_fader('up', 'stop', null);
			}
		}

		actions.brightnessDown = {
			label: 'Brightness Down Continuously',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'textinput',
					label: 'Decrease Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let rate = action.options.rate;
				self.parseVariables(rate, function (value) {
					rate = value;
				});
				rate = parseInt(rate);

				self.BRIGHTNESS_STRIP_INDEX = action.options.strip;

				self.brightness_fader('down', 'start', rate);
			}
		}

		actions.brightnessDownStop = {
			label: 'Brightness Down Stop',
			callback: function (action, bank) {
				self.brightness_fader('down', 'stop', null);
			}
		}

		// ########################
		// #### Color Actions #####
		// ########################

		actions.colorTemp = {
			label: 'Set White Color Temperature',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'number',
					label: 'Color Temp',
					id: 'colortemp',
					tooltip: 'Sets the color temperature (2500K - 6500K)',
					min: 2500,
					max: 6500,
					default: (self.CURRENT_COLORTEMP < 2500 ? 2500 : self.CURRENT_COLORTEMP),
					step: 5,
					required: true,
					range: true
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let strip = action.options.strip;

				let optionsObj = {};
				optionsObj.color_temp = action.options.colortemp;

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				if (strip == -1) {
					for (let i = 0; i < self.config.stripcount; i++) {
						self.setColorTemp(parseInt(transition), optionsObj, i);				
					}
				}
				else {
					self.setColorTemp(parseInt(transition), optionsObj, strip);	
				}
			}
		}

		actions.colorPicker = {
			label: 'Set To Color by Picker',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'colorpicker',
					label: 'Color',
					id: 'color',
					default: self.CURRENT_COLOR_DECIMAL
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let optionsObj = {};

				let strip = action.options.strip;

				let rgb = self.rgbRev(action.options.color);
				let hsv = colorsys.rgb2Hsv(rgb.r, rgb.g, rgb.b);

				optionsObj.mode = 'normal';
				optionsObj.hue = hsv.h;
				optionsObj.saturation = hsv.s;
				optionsObj.color_temp = 0;
				optionsObj.brightness = hsv.v;

				self.CURRENT_BRIGHTNESS = hsv.v;
				self.setVariable('brightness', hsv.v);

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				if (strip == -1) {
					for (let i = 0; i < self.config.stripcount; i++) {
						self.setColor(transition, optionsObj, i);						
					}
				}
				else {
					self.setColor(transition, optionsObj, strip);
				}
			}
		}

		actions.colorHsv = {
			label: 'Set To Color by Hue, Saturation, Brightness',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'textinput',
					label: 'Hue (0 - 360)',
					id: 'hue',
					default: self.CURRENT_HUE,
					required: true
				},
				{
					type: 'textinput',
					label: 'Saturation (0 - 100)',
					id: 'saturation',
					default: self.CURRENT_SATURATION,
					required: true
				},
				{
					type: 'textinput',
					label: 'Brightness (0 - 100)',
					id: 'brightness',
					default: self.CURRENT_BRIGHTNESS,
					required: true
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let optionsObj = {};

				let strip = action.options.strip;

				let hue = action.options.hue;
				self.parseVariables(hue, function (value) {
					hue = value;
				});
				hue = parseInt(hue);
				if (hue < 0) {
					hue = 0;
				}
				else if (hue > 360) {
					hue = 360;
				}

				let saturation = action.options.saturation;
				self.parseVariables(saturation, function (value) {
					saturation = value;
				});
				saturation = parseInt(saturation);
				if (saturation < 0) {
					saturation = 0;
				}
				else if (saturation > 100) {
					saturation = 100;
				}				

				let brightness = action.options.brightness;
				self.parseVariables(brightness, function (value) {
					brightness = value;
				});
				brightness = parseInt(brightness);
				if (brightness < 0) {
					brightness = 0;
				}
				else if (brightness > 100) {
					brightness = 100;
				}

				optionsObj.mode = 'normal';
				optionsObj.hue = hue;
				optionsObj.saturation = saturation;
				optionsObj.color_temp = 0;
				optionsObj.brightness = brightness;

				self.CURRENT_BRIGHTNESS = brightness;
				self.setVariable('brightness', brightness);

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				if (strip == -1) {
					for (let i = 0; i < self.config.stripcount; i++) {
						self.setColor(transition, optionsObj, i);						
					}
				}
				else {
					self.setColor(transition, optionsObj, strip);
				}
			}
		}

		actions.setEffect = {
			label: 'Set Predefined Lighting Effect',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: -1,
					choices: self.CHOICES_STRIPS
				},
				{
					type: 'dropdown',
					label: 'Effect',
					id: 'effect',
					default: c.CHOICES_EFFECTS[0].id,
					choices: c.CHOICES_EFFECTS
				}
			],
			callback: function (action, bank) {
				let strip =  action.options.strip;

				let effectsObj = c.CHOICES_EFFECTS.find((EFFECT) => EFFECT.id == action.options.effect);

				if (effectsObj) {
					if (strip == -1) {
						for (let i = 0; i < self.config.stripcount; i++) {
							self.setEffect(effectsObj.data, i);
						}
					}
					else {
						self.setEffect(effectsObj.data, strip);
					}
				}				
			}
		}

		if (self.config.experimental) {
			actions.saveCustomEffect = {
				label: 'Save Current Custom Lighting Effect to Memory (Experimental)',
				options: [
					{
						type: 'dropdown',
						label: 'Strip',
						id: 'strip',
						default: 0,
						choices: self.CHOICES_STRIPS_FEEDBACKS
					}
				],
				callback: function (action, bank) {
					let strip =  action.options.strip;
	
					let stripInfo = self.DEVICEINFO[strip].lighting_effect_state;

					if (stripInfo.custom) { //only save it  if it is a custom effect
						if (self.CHOICES_CUSTOM_EFFECTS.length == 1) {
							//make sure this isn't the default entry, if it is, go ahead and delete it
							if (self.CHOICES_CUSTOM_EFFECTS[0].id == 'default') {
								self.CHOICES_CUSTOM_EFFECTS = [];
							}
						}
		
						//make sure the effect is not already in the list
						let effectsObj = self.CHOICES_CUSTOM_EFFECTS.find((EFFECT) => EFFECT.id == stripInfo.id);
		
						if (!effectsObj) {
							//now add it to the list
							let memObj = {};
							memObj.id = stripInfo.id;
							memObj.label = stripInfo.name;
							memObj.data = stripInfo;
							self.CHOICES_CUSTOM_EFFECTS.push(memObj);
						}
		
						self.init_actions();
						self.init_presets();
					}
				}
			}
	
			actions.setCustomEffect = {
				label: 'Set Custom Lighting Effect (Experimental)',
				options: [
					{
						type: 'dropdown',
						label: 'Strip',
						id: 'strip',
						default: -1,
						choices: self.CHOICES_STRIPS
					},
					{
						type: 'dropdown',
						label: 'Effect',
						id: 'effect',
						default: self.CHOICES_CUSTOM_EFFECTS[0].id,
						choices: self.CHOICES_CUSTOM_EFFECTS
					}
				],
				callback: function (action, bank) {
					let strip =  action.options.strip;
	
					let effectsObj = self.CHOICES_CUSTOM_EFFECTS.find((EFFECT) => EFFECT.id == action.options.effect);
	
					if (effectsObj && effectsObj.id !== 'default') {
						if (strip == -1) {
							for (let i = 0; i < self.config.stripcount; i++) {
								self.setEffect(effectsObj.data, i);
							}
						}
						else {
							self.setEffect(effectsObj.data, strip);
						}
					}				
				}
			}
		}

		return actions
	}
}