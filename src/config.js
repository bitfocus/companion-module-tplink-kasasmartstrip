const { setFeedbacks } = require("./feedbacks");

module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	setConfig: function () {
		let self = this;

		self.config.stripcount = (self.config.stripcount ? self.config.stripcount : 10); //default of 10 if undefined

		let configFields = [];

		configFields.push(
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					"This module controls TP-Link Kasa Smart LED Strips.",
			},
			{
				type: 'text',
				id: 'dummyblock',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'textinput',
				id: 'stripcount',
				label: 'Strip Count (How many strips to control)',
				width: 3,
				default: 10
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: ' ',
				value: `
				<div class="alert alert-warning">
					<div>
						<strong>After changing the strip count, click "Save" and then return to this config page for the correct number of strip fields to load.</strong>
					</div>
				</div>
				`,
			}
		);

		for (let i = 0; i < self.config.stripcount; i++) {
			configFields.push(
				{
					type: 'textinput',
					id: 'host' + i,
					label: 'Strip IP #' + (i+1),
					width: 3
				},
				{
					type: 'textinput',
					id: 'alias' + i,
					label: 'Strip Alias #' + (i+1),
					default: '',
					width: 3
				},
				{
					type: 'text',
					id: 'dummy' + i,
					width: 12,
					label: ' ',
					value: ' '
				},
			)
		}

		configFields.push(
			{
				type: 'text',
				id: 'intervalInfo',
				width: 12,
				label: 'Update Interval',
				value: 'Please enter the amount of time in milliseconds to request new information from the strip(s). Set to 0 to disable.',
			},
			{
				type: 'textinput',
				id: 'interval',
				label: 'Update Interval',
				width: 3,
				default: 0
			},
			{
				type: 'text',
				id: 'dummyexperimental',
				width: 12,
				label: ' ',
				value: ' '
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Experimental Features',
				value: `
				<div class="alert alert-danger">
					<div>
						<strong>Some features are available that are still experimental and in testing. They may not work with your device at all or may cause it to lock up. Use with caution!</strong>
					</div>
				</div>
				`,
			},
			{
				type: 'checkbox',
				id: 'experimental',
				width: 12,
				label: 'Enable',
				default: false
			}
		);

		return configFields;
	}
}