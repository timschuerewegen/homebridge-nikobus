'use strict';

var utils = require('./nikobus/utils');

function NikobusAccessorySwitchModuleOutput(log, platform, name, switchModule, switchModuleOutputNumber, serviceType)
{
	this.log = log;
	this.log('NikobusAccessorySwitchModuleOutput() enter', 5);
	this.log('name = ' + name + ', ' + 'type = ' + serviceType + ', ' + 'switch module = ' + utils.intToHex(switchModule.address, 4) + ', ' + 'output = ' + switchModuleOutputNumber, 7);
	this.platform = platform;
	this.name = name;
	this.switchModule = switchModule;
	this.switchModuleOutputNumber = switchModuleOutputNumber;
	this.serviceType = serviceType;
	this.log('NikobusAccessorySwitchModuleOutput() leave', 9);
}

NikobusAccessorySwitchModuleOutput.prototype.mylog = function(text, level)
{
	this.log('[' + this.name + '] ' + text, level);
}

NikobusAccessorySwitchModuleOutput.prototype.setPowerState = function(value, callback)
{
	this.mylog('NikobusAccessorySwitchModuleOutput.setPowerState() enter', 5);
	this.log('value = ' + value, 7);
	this.platform.nikobus.queue.push(this.name + ' setPowerState ' + value, {callback: callback},
		function(args, callback)
		{
			this.switchModule.setOutputState(this.switchModuleOutputNumber, (value ? 'FF' : '00'), 2500,
				function(err)
				{
					this.log('NikobusModuleSwitch.setOutputState() callback (err = ' + err + ')', err ? 1 : 8);
					args.callback(err);
					callback(err);
				}.bind(this)
			);
		}.bind(this)
	);
	this.mylog('NikobusAccessorySwitchModuleOutput.setPowerState() leave', 9);
}

NikobusAccessorySwitchModuleOutput.prototype.getPowerState = function(callback)
{
	this.mylog('NikobusAccessorySwitchModuleOutput.getPowerState() enter', 5);
	this.platform.nikobus.queue.push(this.name + ' getPowerState', {callback: callback},
		function(args, callback)
		{
			this.switchModule.getOutputState(this.switchModuleOutputNumber, 2500,
				function(err, answer)
				{
					this.log('NikobusModuleSwitch.getOutputState() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
					if (err)
					{
						args.callback(err, null);
						callback(err);
						return;
					}
					var value = (answer != '00');
					this.log('value = ' + value, 7);
					args.callback(null, value);
					callback(null);
				}.bind(this)
			);
		}.bind(this)
	);
	this.mylog('NikobusAccessorySwitchModuleOutput.getPowerState() leave', 9);
}

NikobusAccessorySwitchModuleOutput.prototype.getServices = function()
{
	this.mylog('NikobusAccessorySwitchModuleOutput.getServices() enter', 5);
	var services = [];

	var Service = this.platform.api.hap.Service;
	var Characteristic = this.platform.api.hap.Characteristic;

	var service = new Service.AccessoryInformation();
	service.setCharacteristic(Characteristic.Manufacturer, 'Niko');
	service.setCharacteristic(Characteristic.Model, this.switchModule.model); // e.g. '05-000-02'
	service.setCharacteristic(Characteristic.SerialNumber, utils.intToHex(this.switchModule.address, 4) + '-' + utils.intToDec(this.switchModuleOutputNumber, 2)); // e.g. '02B6-03'
	services.push(service);

	switch (this.serviceType)
	{
		case 'switch':
		{
			var service = new Service.Switch(this.name);
			service.getCharacteristic(Characteristic.On)
				.on('get', this.getPowerState.bind(this))
				.on('set', this.setPowerState.bind(this));
			services.push(service);
		}
		break;
		case 'lightbulb':
		{
			var service = new Service.Lightbulb(this.name);
			service.getCharacteristic(Characteristic.On)
				.on('get', this.getPowerState.bind(this))
				.on('set', this.setPowerState.bind(this));
			services.push(service);
		}
		break;
	}

	this.mylog('NikobusAccessorySwitchModuleOutput.getServices() leave', 9);
	return services;
}

module.exports =
{
	NikobusAccessorySwitchModuleOutput
}
