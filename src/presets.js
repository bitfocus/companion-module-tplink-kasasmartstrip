const c = require('./choices.js');

module.exports = {
	setPresets: function () {
		let self = this;
		let presets = []

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		// ########################
		// #### Power Presets ####
		// ########################

		presets.push({
			category: 'Power',
			label: 'Power On All Strips',
			bank: {
				style: 'text',
				text: 'Power\\nON ALL',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'power',
					options: {
						strip: -1,
						onoff: 1,
						transition: 1000
					}
				}
			],
			feedbacks: [
				{
					type: 'powerState',
					options: {
						option: 1
					},
					style: {
						color: foregroundColor,
						bgcolor: backgroundColorRed
					}
				}
			]
		})

		presets.push({
			category: 'Power',
			label: 'Power Off All Strips',
			bank: {
				style: 'text',
				text: 'Power\\nOFF ALL',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'power',
					options: {
						strip: -1,
						onoff: 0,
						transition: 1000
					}
				}
			]
		})

		presets.push({
			category: 'Power',
			label: 'Power Toggle All Strips',
			bank: {
				style: 'text',
				text: 'Power\\nTOGGLE',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'power',
					options: {
						strip: - 1,
						onoff: 2,
						transition: 1000
					}
				}
			]
		})

		for (let i = 0; i < self.config.stripcount; i++) {
			presets.push({
				category: 'Power',
				label: 'Power On ' + (i+1),
				bank: {
					style: 'text',
					text: 'Power\\nON ' + (i+1),
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'power',
						options: {
							strip: i,
							onoff: 1,
							transition: 1000
						}
					}
				],
				feedbacks: [
					{
						type: 'powerState',
						options: {
							option: i
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})
	
			presets.push({
				category: 'Power',
				label: 'Power Off ' + (i+1),
				bank: {
					style: 'text',
					text: 'Power\\nOFF ' + (i+1),
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'power',
						options: {
							strip: i,
							onoff: 0,
							transition: 1000
						}
					}
				],
				feedbacks: [
					{
						type: 'powerState',
						options: {
							option: i
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})
	
			presets.push({
				category: 'Power',
				label: 'Power Toggle ' + (i+1),
				bank: {
					style: 'text',
					text: 'Power\\nTOGGLE ' + (i+1),
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'power',
						options: {
							strip: i,
							onoff: 2,
							transition: 1000
						}
					}
				],
				feedbacks: [
					{
						type: 'powerState',
						options: {
							option: i
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed
						}
					}
				]
			})
		}

		presets.push({
			category: 'Brightness',
			label: 'Brightness Up',
			bank: {
				style: 'text',
				text: 'Brightness Up',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'brightnessUp',
					options: {
						rate: 50
					}
				}
			],
			release_actions: [
				{
					action: 'brightnessUpStop'
				}
			]
		})

		presets.push({
			category: 'Brightness',
			label: 'Brightness Down',
			bank: {
				style: 'text',
				text: 'Brightness Down',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0),
			},
			actions: [
				{
					action: 'brightnessDown',
					options: {
						rate: 50
					}
				}
			],
			release_actions: [
				{
					action: 'brightnessDownStop'
				}
			]
		})

		for (let i = 10; i <= 100; i = i + 10) {
			presets.push({
				category: 'Brightness',
				label: 'Brightness ' + i + '%',
				bank: {
					style: 'text',
					text: i + '%',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'brightness',
						options: {
							brightness: i,
							transition: 0
						}
					}
				]
			})
		}

		let PRESETS_COLORTEMPS = [2700, 3000, 3200, 3400, 4000, 5000, 6000];

		for (let i = 0; i < PRESETS_COLORTEMPS.length; i++) {
			presets.push({
				category: 'Color Temperature',
				label: 'Color Temp ' + PRESETS_COLORTEMPS[i] + 'K',
				bank: {
					style: 'text',
					text: PRESETS_COLORTEMPS[i] + 'K',
					size: '18',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'colorTemp',
						options: {
							colortemp: PRESETS_COLORTEMPS[i],
							transition: 0
						}
					}
				]
			})
		}

		presets.push({
			category: 'Set Colors',
			label: 'Red',
			bank: {
				style: 'text',
				text: '',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(255, 0, 0),
			},
			actions: [
				{
					action: 'colorPicker',
					options: {
						color: self.rgb(255, 0, 0),
						transition: 0
					}
				}
			]
		})

		presets.push({
			category: 'Set Colors',
			label: 'Green',
			bank: {
				style: 'text',
				text: '',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 255, 0),
			},
			actions: [
				{
					action: 'colorPicker',
					options: {
						color: self.rgb(0, 255, 0),
						transition: 0
					}
				}
			]
		})

		presets.push({
			category: 'Set Colors',
			label: 'Blue',
			bank: {
				style: 'text',
				text: '',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 255),
			},
			actions: [
				{
					action: 'colorPicker',
					options: {
						color: self.rgb(0, 0, 255),
						transition: 0
					}
				}
			]
		})

		// #################################
		// #### Lighting Effect Presets ####
		// #################################

		for (let i = 0; i < c.CHOICES_EFFECTS.length; i++) {
			presets.push({
				category: 'Predefined Effects',
				label: c.CHOICES_EFFECTS[i].label,
				bank: {
					style: 'text',
					text: c.CHOICES_EFFECTS[i].label,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'setEffect',
						options: {
							strip: -1,
							effect: c.CHOICES_EFFECTS[i].id
						}
					}
				]
			});
		}

		if (self.CHOICES_CUSTOM_EFFECTS[0].id != 'default') { //make sure this isn't the default entry
			for (let i = 0; i < self.CHOICES_CUSTOM_EFFECTS.length; i++) {
				presets.push({
					category: 'Custom Effects',
					label: self.CHOICES_CUSTOM_EFFECTS[i].label,
					bank: {
						style: 'text',
						text: self.CHOICES_CUSTOM_EFFECTS[i].label,
						size: '14',
						color: '16777215',
						bgcolor: self.rgb(0, 0, 0),
					},
					actions: [
						{
							action: 'setCustomEffect',
							options: {
								strip: -1,
								effect: self.CHOICES_CUSTOM_EFFECTS[i].id
							}
						}
					]
				});
			}
		}

		return presets
	}
}
