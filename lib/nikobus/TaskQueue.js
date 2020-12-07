'use strict';

var async = require('async');

function TaskQueue(log, concurrency)
{
	this.log = log;
	this.queue = async.queue(
		function(task, callback)
		{
			this.log('Task "' + task.name + '" execute', 7);
			task.execute(task.args,
				function(err)
				{
					this.log('Task "' + task.name + '" execute callback (err = ' + err + ')', err ? 1 : 7);
					callback(); // next task
				}.bind(this)
			);
		}.bind(this), concurrency
	);
	/* this.queue.drain = function(){}; */
        this.queue.drain(async () => {});
}

TaskQueue.prototype.push = function(name, args, callback)
{
	this.queue.push({name: name, args: args, execute: callback}, null);
}

module.exports =
{
	TaskQueue
}
