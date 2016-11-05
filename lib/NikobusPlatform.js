'use strict';

var async = require('async');

var Nikobus = require('./nikobus/Nikobus').Nikobus;
var NikobusApi = require('./nikobus/NikobusApi').NikobusApi;
var NikobusModulePcLink = require('./nikobus/NikobusModulePcLink').NikobusModulePcLink;
var NikobusModuleSwitch = require('./nikobus/NikobusModuleSwitch').NikobusModuleSwitch;
var NikobusModulePushbutton = require('./nikobus/NikobusModulePushbutton').NikobusModulePushbutton;

var NikobusAccessorySwitchModuleOutput = require('./NikobusAccessorySwitchModuleOutput').NikobusAccessorySwitchModuleOutput;
var NikobusAccessoryPushbuttonModuleButton = require('./NikobusAccessoryPushbuttonModuleButton').NikobusAccessoryPushbuttonModuleButton;

var utils = require('./nikobus/utils');

function NikobusPlatform(log, config, api)
{
	this.log = function(text, level)
		{
			if ((level || 0) <= (config.loglevel || 0))
			{
				log(text);
			}
		};
	this.log('NikobusPlatform() enter', 5);
	this.log('config = ' + JSON.stringify(config), 7);
	this.config = config;
	this.api = api;
	this.log('NikobusPlatform() leave', 9);
}

NikobusPlatform.prototype.accessories = function(callback)
{
	this.log('NikobusPlatform.accessories() enter', 5);

	this.nikobus = new Nikobus(this.log, this.config.port);
	this.nikobus.on('command',
		function(command)
		{
			this.log('received command: ' + command, 2);
		}.bind(this)
	);

	this.nikobusApi = new NikobusApi(this.log, this.nikobus);

	var foundAccessories = [];

	if (this.config.modules)
	{
		for (var i = 0; i < this.config.modules.length; i++)
		{
			var module = this.config.modules[i];
			this.log('module ' + (i + 1) + ' = ' + JSON.stringify(module), 9);
			switch (module.type)
			{
				case 'pclink':
				{
					var modulex = new NikobusModulePcLink(this.log, this.nikobusApi, module.name || ('Module ' + (i + 1)), module.model || '?', utils.hexToInt(module.address));
				}
				break;
				case 'switch':
				{
					var modulex = new NikobusModuleSwitch(this.log, this.nikobusApi, module.name || ('Module ' + (i + 1)), module.model || '?', utils.hexToInt(module.address));
					if (module.outputs)
					{
						for (var j = 0; j < module.outputs.length; j++)
						{
							var output = module.outputs[j];
							this.log('output ' + (j + 1) + ' = ' + JSON.stringify(output), 9);
							var accessory = new NikobusAccessorySwitchModuleOutput(this.log, this, output.name || ('Output ' + output.number), modulex, output.number, output.service);
							foundAccessories.push(accessory);
						}
					}
				}
				break;
				case 'pushbutton':
				{
					var modulex = new NikobusModulePushbutton(this.log, this.nikobusApi, module.name || ('Module ' + (i + 1)), module.model || '?', utils.hexToInt(module.address));
					if (module.buttons)
					{
						for (var j = 0; j < module.buttons.length; j++)
						{
							var button = module.buttons[j];
							this.log('button ' + (j + 1) + ' = ' + JSON.stringify(button), 9);
							var accessory = new NikobusAccessoryPushbuttonModuleButton(this.log, this, button.name || ('Button ' + button.number), modulex, button.number, button.service);
							foundAccessories.push(accessory);
						}
					}
				}
				break;
				default:
				{
					throw new Error('unknown module type (' + module.type + ')');
				}
				break;
			}
		}
	}

	var arg_callback = callback;

	async.series([
		function(callback)
		{
			this.nikobus.open(
				function(err)
				{
					this.log('Nikobus.open() callback (err = ' + err + ')', err ? 1 : 8);
					callback(err);
				}.bind(this)
			);
		}.bind(this),
		function(callback)
		{
			this.nikobus.sendCommand('#E1',
				function(err)
				{
					this.log('Nikobus.sendCommand() callback (err = ' + err + ')', err ? 1 : 8);
					callback(err);
				}.bind(this)
			);
		}.bind(this),
		function(callback)
		{
			arg_callback(foundAccessories);
		}.bind(this)
	]);

	this.log('NikobusPlatform.accessories() leave', 9);
}

module.exports =
{
	NikobusPlatform
}
