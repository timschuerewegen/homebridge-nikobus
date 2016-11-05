'use strict';

var SerialPort = require('serialport').SerialPort;

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var TaskQueue = require('./TaskQueue').TaskQueue;

function Nikobus(log, path)
{
	this.log = log;
	this.log('Nikobus() enter', 5);
	this.log('path = ' + path, 7);

	EventEmitter.call(this);

	this.getAnswerCallback = null;
	this.getAnswerTimeout = null;
	this.waitCommandAck = '';
	this.serial_rx_data = '';

	this.serialPort = new SerialPort(path, { baudrate: 9600 }, false); // serialPort 3.x.x
	//this.serialPort = new serialPort.SerialPort(path, { baudrate: 9600, autoOpen: false }); // serialPort 4.x.x

	this.queue = new TaskQueue(this.log, 1);

	this.log('Nikobus() leave', 9);
}

util.inherits(Nikobus, EventEmitter);

Nikobus.prototype.open = function(callback)
{
	this.log('Nikobus.open() enter', 5);
	this.serialPort.on('data', this.serialPortOnData.bind(this));
	this.serialPort.open(
		function(err)
		{
			this.log('SerialPort.open() callback (err = ' + err + ')', err ? 1 : 8);
			if (callback)
			{
				callback(err);
			}
		}.bind(this)
	);
	this.log('Nikobus.open() leave', 9);
}

Nikobus.prototype.close = function(callback)
{
	this.log('Nikobus.close() enter', 5);
	if (this.serialPort.isOpen())
	{
		this.serialPort.close(
			function(err)
			{
				this.log('SerialPort.close() callback (err = ' + err + ')', err ? 1 : 8);
				if (callback)
				{
					callback(err);
				}
			}.bind(this)
		);
	}
	this.log('Nikobus.close() leave', 9);
}

Nikobus.prototype.serialPortOnData = function(data)
{
	var s = data.toString();
	for (var i = 0; i < s.length; i++)
	{
		var c = s[i];
		if (c == '\r')
		{
			this.log('serial rx [' + this.serial_rx_data + '] (cr)', 2);
			this.emit('command', this.serial_rx_data);
			if (this.getAnswerCallback != null)
			{
				// xxx$0512$1CB6020000FF000000FFC2B316
				// xxx$0515$0EFFB6020030
				// xxx$0516$0EFFB6020030
				// xxx$0517$1CB60200FF0000000000D253EE
				// xxx$0519$0EFFB6020030
				var line = this.serial_rx_data;
				var j = line.lastIndexOf('$');
				if ((j >= 5) && (line.substr(j - 5, 5) == this.waitCommandAck))
				{
					line = line.slice(j);
					// $1CB6020000FF000000FFC2B316
					// $0EFFB6020030
					this.log('answer received', 2);
					if (this.getAnswerTimeout != null)
					{
						clearTimeout(this.getAnswerTimeout);
						this.getAnswerTimeout = null;
					}
					var callback = this.getAnswerCallback;
					this.getAnswerCallback = null;
					callback(null, line);
				}
			}
			this.serial_rx_data = '';
		}
		else
		{
			this.serial_rx_data += c;
		}
	}
}

Nikobus.prototype.sendCommand = function(command, callback)
{
	this.log('Nikobus.sendCommand() enter', 5);
	this.log('command = ' + command, 7);
	this.log('serial tx [' + command + '] (cr)', 2);
	this.serialPort.write(command + '\r',
		function(err)
		{
			this.log('SerialPort.write() callback (err = ' + err + ')', err ? 1 : 8);
			callback(err);
		}.bind(this)
	);
	this.log('Nikobus.sendCommand() leave', 9);
}

Nikobus.prototype.sendCommandGetAnswer = function(command, timeout, callback)
{
	this.log('Nikobus.sendCommandGetAnswer() enter', 5);
	this.log('command = ' + command + ', ' + 'timeout = ' + timeout, 7);
	this.getAnswerCallback = callback;
	this.waitCommandAck = '$05' + command.substr(3, 2); // $1012B6027576C9 => $0512
	this.log('serial tx [' + command + '] (cr)', 2);
	this.serialPort.write(command + '\r',
		function(err)
		{
			this.log('SerialPort.write() callback (err = ' + err + ')', err ? 1 : 8);
			if (err)
			{
				callback(err, null);
				return;
			}
			this.log('wait for answer...', 2);
			this.getAnswerTimeout = setTimeout(
				function()
				{
					this.log('timeout', 2);
					this.getAnswerCallback = null;
					callback(new Error('timeout'), null);
				}.bind(this),
				timeout
			);
		}.bind(this)
	);
	this.log('Nikobus.sendCommandGetAnswer() exit', 9);
}

module.exports =
{
	Nikobus
}
