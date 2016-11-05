'use strict';

var NikobusPlatform = require('./lib/NikobusPlatform').NikobusPlatform;

module.exports = function(homebridge)
{
	homebridge.registerPlatform('homebridge-nikobus', 'Nikobus', NikobusPlatform);
}
