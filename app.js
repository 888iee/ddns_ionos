const https = require('node:https')
require('dotenv').config();

let RetrievedIp = 0;

function retrieveIp() {
	https.get('https://1.1.1.1/cdn-cgi/trace', res => {

		res.setEncoding('utf-8').on( 'data', d =>  {
			let array = d.match(/[^\r\n]+/g)
			RetrievedIp = array[2].split("=")[1]
		})

	})
}

function getCustomerZone() {
	// let zoneUrl = "api.hosting.ionos.com"
	let zoneUrl = "https://api.hosting.ionos.com/dns/v1/zones/"
	let options = {
		host: 'api.hosting.ionos.com/',
		// port: 443,
		path: '/dns/v1/zones',
		method: 'GET',
		// headers: {
		// 	accept: 'application/json',
		// 	'X-API-Key': process.env.api_key
		// }

	}
	https.get( options, (res) => {
		console.log(res.statusCode)
		res.setEncoding('utf-8').on( 'data', d => console.log(d))
		res.on('error', function (err) {
			console.log('error: ' + err.message);
		});
		
		// res.end();
	})
}

getCustomerZone()
