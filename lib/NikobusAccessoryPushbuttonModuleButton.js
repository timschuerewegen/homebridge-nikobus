'use strict';

var utils = require('./nikobus/utils');

function NikobusAccessoryPushbuttonModuleButton(log, platform, name, pushbutton, pushbuttonArea, serviceType)
{
	this.log = log;
	this.log('NikobusAccessoryPushbuttonModuleButton() enter', 5);
	this.log('name = ' + name + ', ' + 'pushbutton module = ' + utils.intToHex(pushbutton.address, 6) + ', ' + 'button = ' + pushbuttonArea, 7);
	this.platform = platform;
	this.name = name;
	this.pushbutton = pushbutton;
	this.pushbuttonArea = pushbuttonArea;
	this.serviceType = serviceType;
	this.state = false;
	this.log('NikobusAccessoryPushbuttonModuleButton() leave', 9);
}

NikobusAccessoryPushbuttonModuleButton.prototype.mylog = function(text, level)
{
	this.log('[' + this.name + '] ' + text, level);
}

NikobusAccessoryPushbuttonModuleButton.prototype.setPowerState = function(value, callback)
{
	this.mylog('NikobusAccessoryPushbuttonModuleButton.setPowerState() enter', 5);
	this.log('value = ' + value, 7);
	this.platform.nikobus.queue.push(this.name + ' setPowerState ' + value, {callback: callback},
		function(args, callback)
		{
			this.pushbutton.push(this.pushbuttonArea,
				function(err)
				{
					this.log('NikobusModulePushbutton.push() callback (err = ' + err + ')', err ? 1 : 8);
					args.callback(err);
					callback(err);
				}.bind(this)
			);
		}.bind(this)
	);
	this.mylog('NikobusAccessoryPushbuttonModuleButton.setPowerState() leave', 9);
}

NikobusAccessoryPushbuttonModuleButton.prototype.getPowerState = function(callback)
{
	this.mylog('NikobusAccessoryPushbuttonModuleButton.getPowerState() enter', 5);
	var value = this.state;
	this.log('value = ' + value, 7);
	callback(null, value);
	this.mylog('NikobusAccessoryPushbuttonModuleButton.getPowerState() leave', 9);
}

NikobusAccessoryPushbuttonModuleButton.prototype.getServices = function()
{
	this.mylog('NikobusAccessoryPushbuttonModuleButton.getServices() enter', 5);
	var services = [];

	var Service = this.platform.api.hap.Service;
	var Characteristic = this.platform.api.hap.Characteristic;

	var service = new Service.AccessoryInformation();
	service.setCharacteristic(Characteristic.Manufacturer, 'Niko');
	service.setCharacteristic(Characteristic.Model, this.pushbutton.model); // e.g. '05-064-01'
	service.setCharacteristic(Characteristic.SerialNumber, utils.intToHex(this.pushbutton.address, 6) + '-' + this.pushbuttonArea); // e.g. '1CFB18-A'
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

	this.mylog('NikobusAccessoryPushbuttonModuleButton.getServices() leave', 9);
	return services;
}

module.exports =
{
	NikobusAccessoryPushbuttonModuleButton
}
