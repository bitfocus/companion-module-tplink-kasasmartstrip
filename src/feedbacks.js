const colorsys = require('colorsys');
const actions = require('./actions');

module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function () {
		var self = this;
		var feedbacks = {}

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		feedbacks.powerState = {
			type: 'boolean',
			label: 'Power State',
			description: 'Indicate if Strip is On or Off',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: 0,
					choices: self.CHOICES_STRIPS_FEEDBACKS
				},
				{
					type: 'dropdown',
					label: 'Indicate in X State',
					id: 'option',
					default: 1,
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
					],
				}
			],
			callback: function (feedback, bank) {
				var opt = feedback.options

				if (self.DEVICEINFO[opt.strip]) {
					if (self.DEVICEINFO[opt.strip].light_state) {
						if (self.DEVICEINFO[opt.strip].light_state.on_off === opt.option) {
							return true;
						}
					}
				}

				return false
			}
		}

		feedbacks.color = {
			type: 'advanced',
			label: 'Show Strip Color',
			description: 'Show the current strip color on the button',
			options: [
				{
					type: 'dropdown',
					label: 'Strip',
					id: 'strip',
					default: 0,
					choices: self.CHOICES_STRIPS_FEEDBACKS
				}
			],
			callback: function (feedback, bank) {
				var opt = feedback.options

				if (self.DEVICEINFO[opt.strip]) {
					if ('light_state' in self.DEVICEINFO[opt.strip]) {
						if ('hue' in self.DEVICEINFO[opt.strip].light_state) {
							let lightState = self.DEVICEINFO[opt.strip].light_state;
							let rgb = colorsys.hsv2Rgb(lightState.hue, lightState.saturation, lightState.brightness)
							return { bgcolor: self.rgb(rgb.r, rgb.g, rgb.b) }
						}
					}
				}

				return false
			}
		}

		return feedbacks
	}
}
