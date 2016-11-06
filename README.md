# homebridge-nikobus

Nikobus platform plugin for Homebridge (https://github.com/nfarina/homebridge)

## Installation

1. Install Homebridge.
* `npm install -g homebridge`
2. Install this plugin.
* `npm install -g homebridge-nikobus`
3. Configure the plugin by editing your Homebridge configuration file (config.json).
* see `sample-config.json` in this repository for an example
4. Start Homebridge

## Configuration

See `sample-config.json` in this repository for a complete example.

This is the syntax for the Nikobus platform:

```json
{
	"platforms": [
		{
			"platform": "Nikobus",
			"name": "Nikobus",
			"port": "/dev/ttyS0",
			"loglevel": 0,
			"modules": [
				...
			]
		}
	]
}
```

* ```platform``` has to be ```Nikobus```
* ```name``` can be anything
* ```port``` is the name of the serial port
* ```loglevel``` is the log level (0, 1, 2, ...)
* ```modules``` is an array of modules

### Switch module

This is the syntax for a Switch module:

```json
{
	"type": "switch",
	"name": "Switch Module 1",
	"address": "1234",
	"model": "05-000-02",
	"outputs": [
    	...
	]
}
```

* ```type``` has to be ```switch```
* ```name``` can be anything
* ```address``` is the address of the module
* ```model``` can be anything
* ```outputs``` is an array of outputs

This is the syntax for an output:

```json
{
	"number": 3,
	"name": "Light 2",
	"service": "lightbulb"
}
```

* ```number``` is the number of the output (1, 2, 3, ...)
* ```name``` can be anything
* ```service``` has to be ```lightbulb``` or ```switch```

### Pushbutton module

This is the syntax for a Pushbutton module:

```json
{
	"type": "pushbutton",
	"name": "Pushbutton 1",
	"address": "123456",
	"model": "05-000-02",
	"buttons": [
    	...
	]
}
```

* ```type``` has to be ```pushbutton```
* ```name``` can be anything
* ```address``` is the address of the module
* ```model``` can be anything
* ```buttons``` is an array of buttons

This is the syntax for a button:

```json
{
	"number": "A",
	"name": "Television On",
	"service": "lightbulb"
}
```

* ```number``` is the number of the button (has to be `A`, `B`, `C`, `D` with an optional `1` or `2` prefix)
* ```name``` can be anything
* ```service``` has to be ```lightbulb``` or ```switch```
