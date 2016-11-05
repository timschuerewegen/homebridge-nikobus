'use strict';

var utils = require('./utils');

function NikobusModulePcLink(log, api, name, model, address)
{
	this.log = log;
	this.log('NikobusModulePcLink() enter', 5);
	this.log('name = ' + name + ', ' + 'model = ' + model + ', ' + 'address = ' + utils.intToHex(address, 4), 7);
	this.api = api;
	this.name = name;
	this.model = model;
	this.address = address;
	this.log('NikobusModulePcLink() leave', 9);
}

NikobusModulePcLink.prototype.getTime = function(callback)
{
	this.log('NikobusModulePcLink.getTime() enter', 5);
	setTimeout(
		function()
		{
			var value = '112233445566';
			this.log('value = ' + value, 7);
			callback(null, value);
		}.bind(this), 1000
	);
	this.log('NikobusModulePcLink.getTime() leave', 9);
}

NikobusModulePcLink.prototype.setTime = function(value, callback)
{
	this.log('NikobusModulePcLink.setTime() enter', 5);
	this.log('value = ' + value, 7);
	setTimeout(
		function()
		{
			callback(null);
		}, 1000
	);
	this.log('NikobusModulePcLink.setTime() leave', 9);
}

module.exports =
{
	NikobusModulePcLink
}
