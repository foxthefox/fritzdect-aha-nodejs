import { expect } from 'chai';
import { Fritz, FritzEmu } from '../index.js';

/*Setup*/
import { readFileSync } from 'fs';
import { xml2json } from 'xml2json-light';
import { join } from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('PATH is ' + join(__dirname, './data/'));
const xmlDevicesGroups = readFileSync(join(__dirname, './data/') + 'test_api_response.xml');
//var xmlDevicesGroups = fs.readFileSync('./test.xml');

const xmlTemplate = readFileSync(join(__dirname, './data/') + 'template_answer.xml');

const xmlTempStat = readFileSync(join(__dirname, './data/') + 'devicestat_temp_answer.xml');

const xmlPowerStats = readFileSync(join(__dirname, './data/') + 'devicestat_power_answer.xml');

const xmlColorDefaults = readFileSync(join(__dirname, './data/') + 'color_defaults.xml');
const devices2json = xml2json(String(xmlDevicesGroups));
let devices = [].concat((devices2json.devicelist || {}).device || []).map((device) => {
	// remove spaces in AINs
	device.identifier = device.identifier.replace(/\s/g, '');
	return device;
});
let groups = [].concat((devices2json.devicelist || {}).group || []).map((group) => {
	// remove spaces in AINs
	group.identifier = group.identifier.replace(/\s/g, '');
	return group;
});
const templates2json = xml2json(String(xmlTemplate));
let templates = [].concat((templates2json.templatelist || {}).template || []).map(function(template) {
	// remove spaces in AINs
	// template.identifier = group.identifier.replace(/\s/g, '');
	return template;
});

//apiresponse is the xml file with AINs not having the spaces inside
var apiresponse = {};
apiresponse['devicelist'] = { version: '1', device: devices, group: groups };
apiresponse['templatelist'] = { version: '1', template: templates };

/*Test*/
describe('Test of Fritzdect-AHA-API', () => {
	let port = 3311;
	let testfile = 'bla.xml';
	let testdevice = 'fritzbox';
	before('start the FB emulation', () => {
		const emulation = new FritzEmu(testfile, port, false);
		emulation.setupHttpServer(function() {});
	});
	var fritz;
	// if promise is returned = success
	it('should create a new fritzdect instance', function() {
		fritz = new Fritz('admin', 'password', 'http://localhost:3333', null);
	});
	it('login success returns true', async () => {
		const result = await fritz.login_SID();
		//assert.equal(result, true);
		expect(result).to.equal(true);
	});
	/*
	it('function getdevicelistinfos', async () => {
		const result = await fritz.getDeviceListInfos();
		//console.log('getdevicelistinfos result', JSON.parse(result));
		const devicelist = apiresponse['devicelist'];
		//console.log(switchlist);
		expect(parser.xml2json(result).devicelist).to.eql(devicelist);
	});
	*/
	it('function getswitchlist', async () => {
		const result = await fritz.getSwitchList();
		//console.log('getswitchlist result', JSON.parse(result));
		const switchlist = apiresponse['devicelist']['device']
			.filter((device) => device.hasOwnProperty('switch'))
			.map((device) => device.identifier)
			.concat(
				apiresponse['devicelist']['group']
					.filter((device) => device.hasOwnProperty('switch'))
					.map((device) => device.identifier)
			);
		//console.log(switchlist);
		expect(JSON.parse(result)).to.have.length(3);
		expect(JSON.parse(result)).to.eql(switchlist);
	});
	it('logout success returns true', async () => {
		const result = await fritz.logout_SID();
		expect(result).to.equal(false);
	});
});

/*
var assert = require('assert');
describe('login test', () => {
	const fritz = new Fritz('admin', 'password', 'http://localhost:3333', null);
	it('login success returns true', () => {
		return fritz.login_SID().then((result) => {
			assert.equal(result, true);
		});
	});
});
*/
