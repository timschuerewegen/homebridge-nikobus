'use strict';

function intToHex(value, digits)
{
	return ('00000000' + value.toString(16).toUpperCase()).slice(-digits);
}

function hexToInt(value)
{
	return parseInt(value, 16);
}

function intToDec(value, digits)
{
	return ('00000000' + value.toString(10).toUpperCase()).slice(-digits);
}

function decToInt(value)
{
	return parseInt(value, 10);
}

module.exports =
{
	intToHex,
	hexToInt,
	intToDec,
	decToInt
}
