var ss = require('socketstream');

var self = module.exports = {

	init: function(app) {

		ss.client.define('main', {
			view: 'main.html',
			css: 'game.stylus',
			code: [
				'libs/jquery-1.8.2.min.js',
				'libs/davis-0.9.6.min.js',
				'libs/bootstrap.min.js',
				'admin',
				'main',
				'shared'
			],
			tmpl: '*'
		});

		ss.http.route('/', function(req, res) {
			res.serveClient('main');
		});

	}

};