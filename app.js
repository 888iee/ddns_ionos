const https = require('node:https')
const axios = require('axios');
const cron  = require('node-cron');
require('dotenv').config();

const zoneUrl = "https://api.hosting.ionos.com/dns/v1/zones/"
let recordsUrl = "https://api.hosting.ionos.com/dns/v1/zones/{zoneId}/records/"
const options = {
	headers: {
		accept: 'application/json',
		'X-API-Key': process.env.api_key,
		'Content-Type': 'application/json'
	}
}
const args = {
	domain: process.env.domain,
	dns_type: process.env.dns_type,
	zoneId: process.env.zoneId,
	recordId: process.env.recordId,
	ttl: process.env.ttl,
	retrievedIp: 0
}
let NO_RECORD_FOUND = false

async function retrieveIp() {
	const { data } = await axios.get( "https://1.1.1.1/cdn-cgi/trace" )
	
	let array = data.match(/[^\r\n]+/g)
	args.retrievedIp = array[2].split("=")[1]
}

async function getCustomerZoneId() {

	const { data } = await axios.get(zoneUrl, options)
	const { id } = data[0]

	args.zoneId = id
	
	if ( args.recordId === undefined ) await getCZ()
}

async function getCZ() {
	const { data } = await axios.get( zoneUrl + args.zoneId, options)
	
	const [ dnsRecord ] = data.records.filter( x => x.name === args.domain && x.type === args.dns_type )
	
	if ( dnsRecord == undefined || dnsRecord.length === 0 ) NO_RECORD_FOUND = true
	else args.recordId = dnsRecord.id
	// args.ip = dnsRecord.content
}

async function getIpFromDnsRecord() {
	let url = recordsUrl.replace( '{zoneId}', args.zoneId )
	if ( url.indexOf( args.recordId ) == -1 ) url = url + args.recordId
	
	const { data } = await axios.get( url , options )
	
	
	if ( data == undefined || data.length === 0 ) NO_RECORD_FOUND = true
	else args.ip = data.content
}

async function SetNewIp() {
	let url = recordsUrl.replace( '{zoneId}', args.zoneId )
	if ( url.indexOf( args.recordId ) == -1 ) url = url + args.recordId
	
	let d = {
		"disabled": false,
		"content": args.retrievedIp,
		"ttl": args.ttl,
		"prio": 0
	}
	const { status } = await axios.put( url, d, options)
	
	onsole.log( status )
}

async function CreateDnsRecord() {
	let url = recordsUrl.replace( '{zoneId}', args.zoneId )
	
	await retrieveIp()
	let d = [
		{
		  "name": args.domain,
		  "type": args.dns_type,
		  "content": args.retrievedIp,
		  "ttl": args.ttl,
		  "prio": 0,
		  "disabled": false
		}
	]
	try {
		const { status } = await axios.post( url, d, options )
		console.log( status )
		
	} catch (error) {
		console.log(error.response)
	}
}

async function CheckIp() {
	await retrieveIp()
	if ( args.retrievedIp !== args.ip )	{
		console.log( `retrieved: ${args.retrievedIp}\ncurrent: ${args.ip}`)
		await SetNewIp()
	} else {
		console.log( "Ip is still the same" )
	}
}

async function main() {
	if ( args.zoneId === undefined ) await getCustomerZoneId()
	if ( args.ip === undefined && !NO_RECORD_FOUND ) await getIpFromDnsRecord()

	if ( NO_RECORD_FOUND ) await CreateDnsRecord()
	else await CheckIp()
}

cron.schedule( '*/2 * * * *', () => {
	console.log( 'running ddns service' )
	main()
	args.ip = undefined
	NO_RECORD_FOUND = false
	args.retrievedIp = ""
})
