module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function () {
		let self = this;
		let variables = []

		for (let i = 1; i <= self.config.stripcount; i++) {
			variables.push({ name: 'status' + i, label: 'Strip Status' });

			variables.push({ name: 'sw_ver' + i, label: 'SW Version' });
			variables.push({ name: 'hw_ver' + i, label: 'HW Version' });
			variables.push({ name: 'model' + i, label: 'Model' });
			variables.push({ name: 'deviceId' + i, label: 'Device ID' });
			variables.push({ name: 'oemId' + i, label: 'OEM ID' });
			variables.push({ name: 'hwId' + i, label: 'HW ID' });
			variables.push({ name: 'rssi' + i, label: 'RSSI' });
			variables.push({ name: 'latitude' + i, label: 'Latitude' });
			variables.push({ name: 'longitude' + i, label: 'Longitude' });
			variables.push({ name: 'alias' + i, label: 'Alias' });

			variables.push({ name: 'description' + i, label: 'Description' });
			variables.push({ name: 'mic_type' + i, label: 'MIC Type' });
			variables.push({ name: 'mic_mac' + i, label: 'MIC MAC' });
			
			variables.push({ name: 'power' + i, label: 'Power State' });
			variables.push({ name: 'mode' + i, label: 'Mode' });
			variables.push({ name: 'hue' + i, label: 'Hue' });
			variables.push({ name: 'saturation' + i, label: 'Saturation' });
			variables.push({ name: 'color_temp' + i, label: 'Color Temperature' });
			variables.push({ name: 'brightness' + i, label: 'Brightness' });

			variables.push({ name: 'current_effect' + i, label: 'Current Effect' });
	
			variables.push({ name: 'color_rgb' + i, label: 'Current Color RGB' });
			variables.push({ name: 'color_hex' + i, label: 'Current Color Hex' });
			variables.push({ name: 'color_decimal' + i, label: 'Current Color Decimal' });
		}		

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function () {
		let self = this;

		try {
			for (let i = 0; i < self.DEVICEINFO.length; i++) {
				if ('sw_ver' in self.DEVICEINFO[i]) {
					self.setVariable('sw_ver' + (i+1), self.DEVICEINFO[i].sw_ver);
				}
	
				if ('hw_ver' in self.DEVICEINFO[i]) {
					self.setVariable('hw_ver' + (i+1), self.DEVICEINFO[i].hw_ver);
				}
	
				if ('model' in self.DEVICEINFO[i]) {
					self.setVariable('model' + (i+1), self.DEVICEINFO[i].model);
				}
	
				if ('deviceId' in self.DEVICEINFO[i]) {
					self.setVariable('deviceId' + (i+1), self.DEVICEINFO[i].deviceId);
				}
	
				if ('oemId' in self.DEVICEINFO[i]) {
					self.setVariable('oemId' + (i+1), self.DEVICEINFO[i].oemId);
				}
	
				if ('hwId' in self.DEVICEINFO[i]) {
					self.setVariable('hwId' + (i+1), self.DEVICEINFO[i].hwId);
				}
	
				if ('rssi' in self.DEVICEINFO[i]) {
					self.setVariable('rssi' + (i+1), self.DEVICEINFO[i].rssi);
				}
	
				if ('latitude_i' in self.DEVICEINFO[i]) {
					self.setVariable('latitude' + (i+1), self.DEVICEINFO[i].latitude_i);
				}
	
				if ('longitude_i' in self.DEVICEINFO[i]) {
					self.setVariable('longitude' + (i+1), self.DEVICEINFO[i].longitude_i);
				}
	
				if ('alias' in self.DEVICEINFO[i]) {
					self.setVariable('alias' + (i+1), self.DEVICEINFO[i].alias);
				}
		
				if ('description' in self.DEVICEINFO[i]) {
					self.setVariable('description' + (i+1), self.DEVICEINFO[i].description);
				}
	
				if ('mic_type' in self.DEVICEINFO[i]) {
					self.setVariable('mic_type' + (i+1), self.DEVICEINFO[i].mic_type);
				}
	
				if ('mic_mac' in self.DEVICEINFO[i]) {
					self.setVariable('mic_mac' + (i+1), self.DEVICEINFO[i].mic_mac);
				}

				if ('light_state' in self.DEVICEINFO[i]) {
					if ('on_off' in self.DEVICEINFO[i].light_state) {
						self.setVariable('power' + (i+1), (self.DEVICEINFO[i].light_state.on_off == 1 ? 'On' : 'Off'));
	
						if (self.DEVICEINFO[i].light_state.on_off == 1) {
							if ('mode' in self.DEVICEINFO[i].light_state) {
								self.setVariable('mode' + (i+1), self.DEVICEINFO[i].light_state.mode);
							}
				
							if ('hue' in self.DEVICEINFO[i].light_state) {
								self.setVariable('hue' + (i+1), self.DEVICEINFO[i].light_state.hue);
							}
				
							if ('saturation' in self.DEVICEINFO[i].light_state) {
								self.setVariable('saturation' + (i+1), self.DEVICEINFO[i].light_state.saturation);
							}
				
							if ('color_temp' in self.DEVICEINFO[i].light_state) {
								self.setVariable('color_temp' + (i+1), self.DEVICEINFO[i].light_state.color_temp);
							}
				
							if ('brightness' in self.DEVICEINFO[i].light_state) {
								self.setVariable('brightness' + (i+1), self.DEVICEINFO[i].light_state.brightness);
							}
				
							self.setVariable('color_rgb' + (i+1), self.DEVICEINFO[i].CURRENT_COLOR_RGB.r + ',' + self.DEVICEINFO[i].CURRENT_COLOR_RGB.g + ',' + self.DEVICEINFO[i].CURRENT_COLOR_RGB.b);
							self.setVariable('color_hex' + (i+1), self.DEVICEINFO[i].CURRENT_COLOR_HEX);
							self.setVariable('color_decimal' + (i+1), self.DEVICEINFO[i].CURRENT_COLOR_DECIMAL);
						}
						else { //these properties don't exist when the light is off, so just set some blanks
							self.setVariable('mode' + (i+1), '');
							self.setVariable('hue' + (i+1), '');
							self.setVariable('saturation' + (i+1), '');
							self.setVariable('color_temp' + (i+1), '');
							self.setVariable('brightness' + (i+1), '');
							self.setVariable('color_rgb' + (i+1), '');
							self.setVariable('color_hex' + (i+1), '');
							self.setVariable('color_decimal' + (i+1), '');
						}
					}
				}
				if ('lighting_effect_state' in self.DEVICEINFO[i]) {
					if (self.DEVICEINFO[i].lighting_effect_state.enable) {
						self.setVariable('current_effect' + (i+1), self.DEVICEINFO[i].lighting_effect_state.name);
					}
					else {
						self.setVariable('current_effect' + (i+1), '(Off)');
					}
				}	
			}		
		}
		catch(error) {
			if (String(error).indexOf('Cannot use \'in\' operator to search') === -1) {
				self.log('error', 'Error from Strip: ' + String(error));
			}
			else {
				self.log('error', 'Error from Strip: ' + String(error));
			}
		}
	}
}
