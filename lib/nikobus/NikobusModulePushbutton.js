'use strict';

var utils = require('./utils');

function makeCommand(addr, area)
{
	var data = 0;
	switch (area)
	{
		case  'A': data = 2; break;
		case  'B': data = 3; break;
		case  'C': data = 0; break;
		case  'D': data = 1; break;
		case '1A': data = 2; addr = addr |  1; break;
		case '1B': data = 3; addr = addr |  1; break;
		case '1C': data = 0; addr = addr |  1; break;
		case '1D': data = 1; addr = addr |  1; break;
		case '2A': data = 2; addr = addr & ~1; break;
		case '2B': data = 3; addr = addr & ~1; break;
		case '2C': data = 0; addr = addr & ~1; break;
		case '2D': data = 1; addr = addr & ~1; break;
	}
	for (var i = 0; i < 22; i++)
	{
		data = (data << 1) | ((addr >> i) & 1);
	}
	return '#N' + utils.intToHex(data, 6);
}

function NikobusModulePushbutton(log, api, name, model, address)
{
	this.log = log;
	this.log('NikobusModulePushbutton() enter', 5);
	this.log('name = ' + name + ', ' + 'model = ' + model + ', ' + 'address = ' + utils.intToHex(address, 6), 7);
	this.api = api;
	this.name = name;
	this.model = model;
	this.address = address;
	this.log('NikobusModulePushbutton() leave', 9);
}

NikobusModulePushbutton.prototype.mylog = function(text, level)
{
	this.log('[' + this.name + '] ' + text, level);
}

NikobusModulePushbutton.prototype.push = function(button, callback)
{
	this.mylog('NikobusModulePushbutton.push() enter', 5);
	this.log('button = ' + button, 7);
	this.api.sendCommand(makeCommand(this.address, button),
		function(err)
		{
			this.log('NikobusApi.sendCommand() callback (err = ' + err + ')', err ? 1 : 8);
			callback(err);
		}.bind(this)
	);
	this.mylog('NikobusModulePushbutton.push() leave', 9);
}

module.exports =
{
	NikobusModulePushbutton
}
