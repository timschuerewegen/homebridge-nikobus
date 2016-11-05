'use strict';

var Nikobus = require('./Nikobus').Nikobus;

var utils = require('./utils');

function NikobusApi(log, nikobus)
{
	this.log = log;
	this.log('NikobusApi() enter', 5);
	this.nikobus = nikobus;
	this.log('NikobusApi() leave', 9);
}

NikobusApi.prototype.sendCommand = function(command, callback)
{
	this.log('NikobusApi.sendCommand() enter', 5);
	this.log('command = ' + command, 7);
	this.nikobus.sendCommand(command,
		function(err)
		{
			this.log('Nikobus.sendCommand() callback (err = ' + err + ')', err ? 1 : 8);
			callback(err);
		}.bind(this)
	);
	this.log('NikobusApi.sendCommand() leave', 9);
}

NikobusApi.prototype.getOutputState = function(address, group, timeout, callback)
{
	this.log('NikobusApi.getOutputState() enter', 5);
	this.log('address = ' + utils.intToHex(address, 4) + ', ' + 'group = ' + group + ', ' + 'timeout = ' + timeout, 7);
	var cmd = '';
	if (group == 1)
	{
		cmd = makePcLinkCommand(0x12, address); // $1C12B602xxxxxx
	}
	if (group == 2)
	{
		cmd = makePcLinkCommand(0x17, address); // $1C17B602xxxxxx
	}
	this.nikobus.sendCommandGetAnswer(cmd, timeout,
		function(err, answer)
		{
			// $1CB6020000FF000000FFC2B316
			// $1CB60200FF0000000000D253EE
			this.log('Nikobus.sendCommandGetAnswer() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
			if (err)
			{
				callback(err, null);
				return;
			}
			// check length
			if (answer.length != 1 + 2 + 4 + 14 + 4 + 2)
			{
				callback(new Error('unexpected answer length (' + answer.length + ')'), null);
				return;
			}
			// check pc-link checksum
			var crc1, crc2;
			crc1 = utils.hexToInt(answer.substr(answer.length - 2, 2));
			crc2 = calcCRC2(answer.substr(0, answer.length - 2));
			if (crc1 != crc2)
			{
				callback(new Error('pc-link checksum error (' + utils.intToHex(crc1, 2) + '/' + utils.intToHex(crc2, 2) + ')'), null);
				return;
			}
			// $1CB6020000FF000000FFC2B316 => B6020000FF000000FFC2B3
			// $1CB6020000FF000000FFC2B316 => B6020000FF000000FFC2B3
			answer = answer.substr(1 + 2, answer.length - 2 - 1 - 2);
			// check nikobus checksum
			crc1 = utils.hexToInt(answer.substr(answer.length - 4, 4));
			crc2 = calcCRC1(answer.substr(0, answer.length - 4));
			if (crc1 != crc2)
			{
				callback(new Error('nikobus checksum error (' + utils.intToHex(crc1, 4) + '/' + utils.intToHex(crc2, 4) + ')'), null);
				return;
			}
			// B6020000FF000000FFC2B3 => 00FF000000FF
			answer = answer.substr(4 + 2, 6 * 2);
			// ...
			callback(null, answer);
		}.bind(this)
	);
	this.log('NikobusApi.getOutputState() leave', 9);
}

NikobusApi.prototype.setOutputState = function(address, group, value, timeout, callback)
{
	this.log('NikobusApi.setOutputState() enter', 5);
	this.log('address = ' + utils.intToHex(address, 4) + ', ' + 'group = ' + group + ', ' + 'value = ' + value + ', ' + 'timeout = ' + timeout, 7);
	var cmd = '';
	if (group == 1)
	{
		cmd = makePcLinkCommand(0x15, address, value + 'FF'); // $1E15B602xxxxxxxxxxxxFFxxxxxx
	}
	if (group == 2)
	{
		cmd = makePcLinkCommand(0x16, address, value + 'FF'); // $1E16B602xxxxxxxxxxxxFFxxxxxx
	}
	this.nikobus.sendCommandGetAnswer(cmd, timeout,
		function(err, answer)
		{
			// $0EFFB6020030
			this.log('Nikobus.sendCommandGetAnswer() callback (err = ' + err + ', answer = ' + answer + ')', err ? 1 : 8);
			if (err)
			{
				callback(err, null);
				return;
			}
			// check length
			if (answer.length != 1 + 2 + 8 + 2)
			{
				callback(new Error('unexpected answer length (' + answer.length + ')'), null);
				return;
			}
			// check pc-link checksum
			var crc1, crc2;
			crc1 = utils.hexToInt(answer.substr(answer.length - 2, 2));
			crc2 = calcCRC2(answer.substr(0, answer.length - 2));
			if (crc1 != crc2)
			{
				callback(new Error('pc-link checksum error (' + utils.intToHex(crc1, 2) + '/' + utils.intToHex(crc2, 2) + ')'), null);
				return;
			}
			// $0EFFB6020030 => FFB60200
			answer = answer.substr(1 + 2, answer.length - 2 - 1 - 2);
			// FFB60200 => FF00 (if FF01 or FE00 then nikobus.exe says 'setting output 1->6 failed')
			answer = answer.substr(0, 2) + answer.substr(2 + 4, 2);
			// ...
			callback(null, answer);
		}.bind(this)
	);
	this.log('NikobusApi.setOutputState() leave', 9);
}

function calcCRC1(data)
{
	var crc = 0xFFFF;
	for (var j = 0; j < data.length / 2; j++)
	{
		crc = crc ^ (parseInt(data.substr(j * 2, 2), 16) << 8);
		for (var i = 0; i < 8; i++)
		{
			if (((crc >> 15) & 1) != 0)
			{
				crc = (crc << 1) ^ 0x1021;
			}
			else
			{
				crc = crc << 1;
			}
		}
	}
	return crc & 0xFFFF;
}

function calcCRC2(data)
{
	var crc = 0;
	for (var i = 0; i < data.length; i++)
	{
		crc = crc ^ data.charCodeAt(i);
		for (var j = 0; j < 8; j++)
		{
			if (((crc & 0xFF) >> 9) != 0)
			{
				crc = crc << 1;
				crc = crc ^ 0x99;
			}
			else
			{
				crc = crc << 1;
			}
		}
	}
	return crc & 0xFF;
}

function appendCRC1(data)
{
	return data + utils.intToHex(calcCRC1(data), 4);
}

function appendCRC2(data)
{
	return data + utils.intToHex(calcCRC2(data), 2);
}

function makePcLinkCommand(func, addr, args)
{
	var data = utils.intToHex(func, 2) + utils.intToHex((addr >> 0) & 0xFF, 2) + utils.intToHex((addr >> 8) & 0xFF, 2);
	if (args !== undefined)
	{
		data += args;
	}
	return appendCRC2('$' + utils.intToHex(data.length + 10, 2) + appendCRC1(data));
}

module.exports =
{
	NikobusApi
}
