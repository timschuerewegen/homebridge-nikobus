'use strict';

var utils = require('./utils');

function NikobusModuleSwitch(log, api, name, model, address)
{
	this.log = log;
	this.log('NikobusModuleSwitch() enter', 5);
	this.log('name = ' + name + ', ' + 'model = ' + model + ', ' + 'address = ' + utils.intToHex(address, 4), 7);
	this.api = api;
	this.name = name;
	this.model = model;
	this.address = address;
	this.log('NikobusModuleSwitch() leave', 9);
}

NikobusModuleSwitch.prototype.getGroupOutputState = function(group, timeout, callback)
{
	this.log('NikobusModuleSwitch.getGroupOutputState() enter', 5);
	this.log('group = ' + group + ', ' + 'timeout = ' + timeout, 7);
	this.api.getOutputState(this.address, group, timeout,
		function(err, answer)
		{
			// 00FF000000FF
			this.log('NikobusApi.getOutputState() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
			callback(err, answer);
		}.bind(this)
	);
	this.log('NikobusModuleSwitch.getGroupOutputState() leave', 9);
}

NikobusModuleSwitch.prototype.setGroupOutputState = function(group, value, timeout, callback)
{
	this.log('NikobusModuleSwitch.setGroupOutputState() enter', 5);
	this.log('group = ' + group + ', ' + 'value = ' + value + ', ' + 'timeout = ' + timeout, 7);
	this.api.setOutputState(this.address, group, value, timeout,
		function(err, answer)
		{
			// FF00
			this.log('NikobusApi.setOutputState() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
			callback(err, answer);
		}.bind(this)
	);
	this.log('NikobusModuleSwitch.setGroupOutputState() leave', 9);
}

NikobusModuleSwitch.prototype.getOutputState = function(number, timeout, callback)
{
	this.log('NikobusModuleSwitch.getOutputState() enter', 5);
	this.log('number = ' + number + ', ' + 'timeout = ' + timeout, 7);
	var groupNumber = Math.floor((number + 5) / 6);
	var groupOutputNumber = (number - 1) % 6;
	this.api.getOutputState(this.address, groupNumber, timeout,
		function(err, answer)
		{
			// 00FF000000FF
			this.log('NikobusApi.getOutputState() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
			if (err)
			{
				callback(err, null);
				return;
			}
			answer = answer.substr(groupOutputNumber * 2, 2);
			callback(null, answer);
		}.bind(this)
	);
	this.log('NikobusModuleSwitch.getOutputState() leave', 9);
}

NikobusModuleSwitch.prototype.setOutputState = function(number, value, timeout, callback)
{
	this.log('NikobusModuleSwitch.setOutputState() enter', 5);
	this.log('number = ' + number + ', ' + 'value = ' + value + ', ' + 'timeout = ' + timeout, 7);
	var groupNumber = Math.floor((number + 5) / 6);
	var groupOutputNumber = (number - 1) % 6;
	this.api.getOutputState(this.address, groupNumber, timeout,
		function(err, answer)
		{
			// 00FF000000FF
			this.log('NikobusApi.getOutputState() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
			if (err)
			{
				callback(err);
				return;
			}
			var old_value = answer;
			var new_value = old_value.substr(0, groupOutputNumber * 2) + value + old_value.substr((groupOutputNumber + 1) * 2, (6 - groupOutputNumber - 1) * 2);
			//this.log('old value = ' + old_value, 9);
			//this.log('new value = ' + new_value, 9);
			if (old_value == new_value)
			{
				this.log('no need to change output state', 9);
				callback(null);
				return;
			}
			this.api.setOutputState(this.address, groupNumber, new_value, timeout,
				function(err, answer)
				{
					// FF00
					this.log('NikobusApi.setOutputState() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
					if (err)
					{
						callback(err);
						return;
					}
					if (answer != 'FF00')
					{
						callback(new Error('unexpected answer (' + answer + ')'));
						return;
					}
					callback(null);
				}.bind(this)
			);
		}.bind(this)
	);
	this.log('NikobusModuleSwitch.setOutputState() leave', 9);
}

module.exports =
{
	NikobusModuleSwitch
}
