// @ts-nocheck
//server to emulate the fritzbox responses
const http = require('http');
const { parse } = require('querystring');
const parser = require('./xml2json.js');
const crypto = require('crypto');

//hashing stuff
const challenge = (4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8);
const challenge2 = (4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8);
const password = 'password';
const challengeResponse =
	challenge + '-' + crypto.createHash('md5').update(Buffer.from(challenge + '-' + password, 'utf16le')).digest('hex');
const mocksid =
	(4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8) +
	(4294967295 + Math.floor(Math.random() * 4294967295)).toString(16).slice(-8);

// the emulation class
let server;
class FritzEmu {
	constructor(
		port,
		debugmode,
		xmlDevGroups,
		xmlTemplates,
		xmlTrigger,
		xmlColors,
		xmlTempStats,
		xmlPowerStats,
		guestWlan,
		hkr_batt
	) {
		this.emuport = port;
		this.debugmode = debugmode;
		this.xmlDevGroups = xmlDevGroups;
		this.xmlTemplates = xmlTemplates;
		this.xmlTrigger = xmlTrigger;
		this.xmlColors = xmlColors;
		this.xmlTempStats = xmlTempStats;
		this.xmlPowerStats = xmlPowerStats;
		this.guestWlan = guestWlan;
		this.hkr_batt = hkr_batt;
		this.apiresponse = {};
	}
	setupHttpServer(callback) {
		this.xml2ApiResponse(this.xmlDevGroups, this.xmlTemplates, this.xmlTrigger);
		console.log('\x1b[33m', '  _____ ____       _    _   _    _  ');
		console.log('\x1b[33m', ' |  ___| __ )     / \\  | | | |  / \\   ');
		console.log('\x1b[33m', ' | |_  |  _ \\    / _ \\ | |_| | / _ \\  ');
		console.log('\x1b[33m', ' |  _| | |_) |  / ___ \\|  _  |/ ___ \\ ');
		console.log('\x1b[33m', ' |_|   |____/  /_/   \\_\\_| |_/_/   \\_\\ ');
		console.log('\x1b[32m', ' _____                  _       _   _     ');
		console.log('\x1b[32m', '| ____| _ __ ___  _   _| | __ _| |_(_) ___  _ __  ');
		console.log('\x1b[32m', '|  _|  | `_ ` _ \\| | | | |/ _` | __| |/ _ \\| `_ \\ ');
		console.log('\x1b[32m', '| |___ | | | | | | |_| | | (_| | |_| | (_) | | | |');
		console.log('\x1b[32m', '|_____||_| |_| |_|\\__,_|_|\\__,_|\\__|_|\\___/|_| |_|');
		console.log('\x1b[0m');
		//We need a which handles requests and send response
		//Create a server
		// handleHttpRequest can not be separate function, hence it does not recognize this context, functions called are not recognized
		server = http.createServer((request, response) => {
			console.log('HTTP-Server (Fritzbox Emulation): Request: ' + request.method + ' ' + request.url);
			// requesturl zerlegen .split('?')
			// erste Teil ist entweder login oder webservice
			let reqstring = request.url.split('?');
			let switchcmd = null,
				sid = null,
				ain = null,
				onoff = null,
				param = null,
				endtimestamp = null,
				colorcmd = null,
				hue = null,
				saturation = null,
				temperature = null,
				duration = null,
				target = null,
				level = null,
				active = null,
				username = null,
				version = null,
				logout = null,
				userresponse = null;

			let command = reqstring[1].split('&');
			//right part of the http after '?'
			for (let i = 0; i < command.length; i++) {
				let commandsplit = command[i].split('=');
				switch (commandsplit[0]) {
					case 'sid':
						sid = commandsplit[1];
						console.log('\x1b[36m', '-> sid  : ', commandsplit[1]);
						break;
					case 'switchcmd':
						switchcmd = commandsplit[1];
						console.log('\x1b[36m', '-> switchcmd : ', commandsplit[1]);
						break;
					case 'ain':
						ain = commandsplit[1];
						console.log('\x1b[36m', '-> ain : ', commandsplit[1]);
						break;
					case 'onoff':
						onoff = commandsplit[1];
						console.log('\x1b[36m', '-> onoff : ', commandsplit[1]);
						break;
					case 'param':
						param = commandsplit[1];
						console.log('\x1b[36m', '-> param : ', commandsplit[1]);
						break;
					case 'endtimestamp':
						endtimestamp = commandsplit[1];
						console.log('\x1b[36m', '-> endtimestamp  : ', commandsplit[1]);
						break;
					case 'hue':
						colorcmd = 'hue';
						hue = commandsplit[1];
						console.log('\x1b[36m', '-> hue  : ', commandsplit[1]);
						break;
					case 'saturation':
						colorcmd = 'saturation';
						saturation = commandsplit[1];
						console.log('\x1b[36m', '-> saturation  : ', commandsplit[1]);
						break;
					case 'temperature':
						temperature = commandsplit[1];
						console.log('\x1b[36m', '-> temperature  : ', commandsplit[1]);
						break;
					case 'duration':
						duration = commandsplit[1];
						console.log('\x1b[36m', '-> duration  : ', commandsplit[1]);
						break;
					case 'target':
						target = commandsplit[1];
						console.log('\x1b[36m', '-> target  : ', commandsplit[1]);
						break;
					case 'version':
						version = commandsplit[1];
						console.log('\x1b[36m', '-> version  : ', commandsplit[1]);
						break;
					case 'username':
						username = commandsplit[1];
						console.log('\x1b[36m', '-> username : ', commandsplit[1]);
						break;
					case 'response':
						response = commandsplit[1];
						console.log('\x1b[36m', '-> response  : ', commandsplit[1]);
						break;
					case 'level':
						level = commandsplit[1];
						console.log('\x1b[36m', '-> level  : ', commandsplit[1]);
						break;
					case 'active':
						active = commandsplit[1];
						console.log('\x1b[36m', '-> active  : ', commandsplit[1]);
						break;
					case 'logout':
						logout = commandsplit[1];
						console.log('\x1b[36m', '-> logout  : ', commandsplit[1]);
						break;
					default:
						break;
				}
			}
			console.log('\x1b[0m');

			if (reqstring[0] == '/login_sid.lua') {
				if (version == 2) {
					//console.log(request);
					response = this.loginoutAnswerV2(response, sid, request.method, username, userresponse, request);
				} else {
					response = this.loginoutAnswerV1(response, sid, request.method, username, userresponse, request);
				}
			} else if (reqstring[0] == '/webservices/homeautoswitch.lua' && sid === mocksid) {
				response = this.homeautoswitchAnswer(
					response,
					switchcmd,
					ain,
					onoff,
					param,
					endtimestamp,
					colorcmd,
					hue,
					saturation,
					temperature,
					duration,
					target,
					level,
					active
				);
			} else if (request.url == '/wlan/guest_access.lua?0=0&sid=' + mocksid) {
				//check the URL of the current request
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(this.guestWlan));
				response.end();
			} else if (request.url == '/data.lua' && request.method === 'POST') {
				//check the URL of the current request
				let body = '';
				request.on('data', (chunk) => {
					body += chunk.toString(); // convert Buffer to string
				});
				request.on('end', () => {
					const form = parse(body);
					console.log(form);
					if (form.sid === sid && form.xhr === '1' && form.page === 'overview') {
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
						response.write(
							JSON.stringify({
								data: {
									naslink: 'nas',
									SERVICEPORTAL_URL:
										'https://www.avm.de/fritzbox-service-portal.php?hardware=156&oem=avm&language=de&country=049&version=84.06.85&subversion=',
									fritzos: {
										Productname: 'FRITZ!Box Fon WLAN 7390',
										NoPwd: false,
										ShowDefaults: false,
										expert_mode: '1',
										nspver_lnk: '/home/pp_fbos.lua?sid=' + sid,
										nspver: '06.85',
										isLabor: false,
										FirmwareSigned: false,
										fb_name: '',
										isUpdateAvail: false,
										energy: '40',
										boxDate: '13:22:00 09.12.2018'
									}
								}
							})
						);
						response.end();
					} else if (
						form.sid === sid &&
						form.xhr === '1' &&
						form.device === '20' &&
						form.oldpage === '/net/home_auto_hkr_edit.lua' &&
						form.back_to_page === '/net/network.lua'
					) {
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
						response.write(String(this.hkr_batt));
						response.end();
					}
				});
			} else {
				console.log('\x1b[31m', '->  not supported call ' + request.method + '  ' + request.url);
				response.statusCode = 403;
				response.write(String(''));
				response.end();
			}
		});
		//Lets start our server
		server.listen(this.emuport, () => {
			//Callback triggered when server is successfully listening. Hurray!
			console.log(
				'\x1b[34m',
				'MOCK HTTP-Server (Fritzbox Emulation) listening on: http://localhost:' + this.emuport
			);
			console.log();
			console.log('\x1b[34m', 'for testing, setup in iobroker for second instance admin:password');
			console.log('\x1b[0m', '-------------------------------------------------------------------');
			callback();
		});
	}
	JSONtoXML(obj) {
		let xml = '';
		for (let prop in obj) {
			xml += obj[prop] instanceof Array ? '' : '<' + prop + '>';
			if (obj[prop] instanceof Array) {
				for (let array in obj[prop]) {
					xml += '\n<' + prop + '>\n';
					xml += JSONtoXML(new Object(obj[prop][array]));
					xml += '</' + prop + '>';
				}
			} else if (typeof obj[prop] == 'object') {
				xml += JSONtoXML(new Object(obj[prop]));
			} else {
				xml += obj[prop];
			}
			xml += obj[prop] instanceof Array ? '' : '</' + prop + '>\n';
		}
		xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
		return xml;
	}
	json2xml(o, tab) {
		var toXml = function(v, name, ind) {
				var xml = '';
				if (v instanceof Array) {
					for (var i = 0, n = v.length; i < n; i++) xml += ind + toXml(v[i], name, ind + '\t') + '\n';
				} else if (typeof v == 'object') {
					var hasChild = false;
					xml += ind + '<' + name;
					for (var m in v) {
						if (m.charAt(0) == '@') xml += ' ' + m.substr(1) + '="' + v[m].toString() + '"';
						else hasChild = true;
					}
					xml += hasChild ? '>' : '/>';
					if (hasChild) {
						for (var m in v) {
							if (m == '#text') xml += v[m];
							else if (m == '#cdata') xml += '<![CDATA[' + v[m] + ']]>';
							else if (m.charAt(0) != '@') xml += toXml(v[m], m, ind + '\t');
						}
						xml += (xml.charAt(xml.length - 1) == '\n' ? ind : '') + '</' + name + '>';
					}
				} else {
					xml += ind + '<' + name + '>' + v.toString() + '</' + name + '>';
				}
				return xml;
			},
			xml = '';
		for (var m in o) xml += toXml(o[m], m, '');
		return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, '');
	}
	// Functions for reply on the requests
	loginoutAnswerV2(response, sid, method, username, userresponse, request) {
		if (!sid && method == 'GET') {
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
					challenge +
					'</Challenge><BlockTime>0</BlockTime><Rights></Rights></SessionInfo>'
			);
			response.end();
			return response;
		} else if (!sid && method == 'POST') {
			let body = '';
			request.on('data', (chunk) => {
				body += chunk.toString(); // convert Buffer to string
			});
			request.on('end', () => {
				const form = parse(body);
				console.log('user: ' + form.username);
				console.log('pbkf2 response: ' + form.response);
				// pbkf2 ausrechnen und vergleichen
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
				response.write(
					'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
						mocksid +
						'</SID><Challenge>' +
						challenge2 +
						'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights></SessionInfo>'
				);
				response.end();
				return response;
			});
		} else if (sid && method == 'GET') {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
					mocksid +
					'</SID><Challenge>' +
					challenge2 +
					'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
			);
			response.end();
			return response;
		} else if (sid && logout === 1 && method == 'GET') {
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
					challenge2 +
					'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
			);
			response.end();
			return response;
		}
	}
	loginoutAnswerV1(response, sid, method, username, userresponse) {
		if (!sid && method == 'GET') {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
					challenge +
					'</Challenge><BlockTime>0</BlockTime><Rights></Rights></SessionInfo>'
			);
			response.end();
			return response;
		} else if (!sid && username === 'admin') {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
					challenge +
					'</Challenge><BlockTime>0</BlockTime><Rights></Rights></SessionInfo>'
			);
			response.end();
			return response;
		} else if (!sid && username === 'admin' && userresponse == challengeResponse) {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
					mocksid +
					'</SID><Challenge>' +
					challenge2 +
					'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights></SessionInfo>'
			);
			response.end();
			return response;
		} else if (sid) {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>' +
					mocksid +
					'</SID><Challenge>' +
					challenge2 +
					'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
			);
			response.end();
			return response;
		} else if (sid == mocksid && logout == 1) {
			//check the URL of the current request
			response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/xml' });
			response.write(
				'<?xml version="1.0" encoding="utf-8"?><SessionInfo><SID>0000000000000000</SID><Challenge>' +
					challenge2 +
					'</Challenge><BlockTime>0</BlockTime><Rights><Name>Dial</Name><Access>2</Access><Name>App</Name><Access>2</Access><Name>HomeAuto</Name><Access>2</Access><Name>BoxAdmin</Name><Access>2</Access><Name>Phone</Name><Access>2</Access><Name>NAS</Name><Access>2</Access></Rights><Users><User last="1">admin</User></Users></SessionInfo>'
			);
			response.end();
			return response;
		}
	}
	errorAnswer(response, code) {
		response.statusCode = code;
		//response.writeHead(code, { 'Content-Type': 'application/x-www-form-urlencoded' });
		response.end();
		return response;
	}
	homeautoswitchAnswer(
		response,
		switchcmd,
		ain,
		onoff,
		param,
		endtimestamp,
		colorcmd,
		hue,
		saturation,
		temperature,
		duration,
		target,
		level,
		active
	) {
		switch (switchcmd) {
			case 'getdevicelistinfos':
				const devicelistinfos = this.apiresponse['devicelist']['device'].concat(
					this.apiresponse['devicelist']['group']
				);
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				//response.write(String(devicelistinfos));
				response.write(String(this.xmlDevGroups));
				response.end();
				return response;
				break;
			case 'getdeviceinfos':
				console.log('getdeviceinfos ' + ain);
				const deviceinfos = this.apiresponse['devicelist']['device'].filter(
					(device) => device.identifier === ain
				);
				if (deviceinfos) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(this.json2xml({ device: deviceinfos })));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'gettemplatelistinfos':
				// todo empty templates
				//const templatelistinfos = this.apiresponse['templatelist']['template']
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				//response.write(String(templatelistinfo));
				response.write(String(this.xmlTemplates));
				response.end();
				return response;
				break;
			case 'applytemplate':
				const template = this.apiresponse['templatelist']['template'].filter(
					(template) => template.hasOwnProperty('identifier') && template.identifier === ain
				);
				if (template) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(template[0].id);
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in templates ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			//alles zu switches
			case 'getswitchlist':
				//check the URL of the current request
				const switchlist = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('switch'))
					.map((device) => device.identifier)
					.concat(
						this.apiresponse['devicelist']['group']
							.filter((device) => device.hasOwnProperty('switch'))
							.map((device) => device.identifier)
					);
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(switchlist));
				response.end();
				return response;
				break;
			case 'setswitchon':
			case 'setswitchoff':
			case 'setswitchtoggle':
				const setswitchstate = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
					.map((device) => device.switch.state);
				const setgroupstate = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
					.map((group) => group.switch.state);
				if (setswitchstate.length == 1) {
					const pos = this.findAin('device', ain);
					if (switchcmd == 'setswitchon') {
						this.apiresponse.devicelist.device[pos].switch.state = 1;
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
						response.write(String('1'));
						response.end();
					} else if (switchcmd == 'setswitchoff') {
						this.apiresponse.devicelist.device[pos].switch.state = 0;
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
						response.write(String('0'));
						response.end();
					} else if (switchcmd == 'setswitchtoggle') {
						let sstate = setswitchstate == '1' ? '0' : '1';
						this.apiresponse.devicelist.device[pos].switch.state = sstate;
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
						response.write(String(sstate));
						response.end();
					}
				} else if (setgroupstate.length == 1) {
					const pos = this.findAin('group', ain);
					if (switchcmd == 'setswitchon') {
						this.apiresponse.devicelist.group[pos].switch.state = 1;
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
						response.write(String('1'));
						response.end();
					} else if (switchcmd == 'setswitchoff') {
						this.apiresponse.devicelist.group[pos].switch.state = 0;
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
						response.write(String('0'));
						response.end();
					} else if (switchcmd == 'setswitchtoggle') {
						let gstate = setgroupstate == '1' ? '0' : '1';
						this.apiresponse.devicelist.group[pos].switch.state = gstate;
						response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
						response.write(String(gstate));
						response.end();
					}
				} else {
					console.log(' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'gettemperature':
				const gettemp = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('temperature') && device.identifier === ain)
					.map((device) => device.temperature.celsius);
				const getgrouptemp = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('temperature') && device.identifier === ain)
					.map((group) => group.temperature.celsius);
				if (gettemp.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(gettemp));
					response.end();
				} else if (getgrouptemp.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(getgrouptemp));
					response.end();
				} else {
					console.log(' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'getswitchname':
			case 'getswitchpresent':
				const item = switchcmd.replace('getswitch', '');
				const devicevalue = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty(item) && device.identifier === ain)
					.map((device) => device[item]);
				const groupvalue = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty(item) && group.identifier === ain)
					.map((group) => group[item]);
				if (devicevalue.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					//response.write(JSON.stringify([ "'" + devicevalue + "'" ]));
					response.write(String(devicevalue));
					response.end();
				} else if (groupvalue.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					//response.write(JSON.stringify([ "'" + groupvalue + "'" ]));
					response.write(String(groupvalue));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'getswitchstate':
				const getswitchstate = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
					.map((device) => device.switch.state);
				const getgroupstate = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
					.map((group) => group.switch.state);
				if (getswitchstate.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					//response.write(JSON.stringify([ "'" + getswitchstate + "'" ]));
					response.write(String(getswitchstate));
					response.end();
				} else if (getgroupstate.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					//response.write(JSON.stringify([ "'" + getgroupstate + "'" ]));
					response.write(String(getgroupstate));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'getswitchpower':
			case 'getswitchenergy':
				const item2 = switchcmd.replace('getswitch', '');
				const getswitchmeter = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
					.map((device) => device.powermeter[item2]);
				const getgroupmeter = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
					.map((group) => group.powermeter[item2]);
				if (getswitchmeter.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					//response.write(JSON.stringify([ "'" + getswitchmeter + "'" ]));
					response.write(String(getswitchmeter));
					response.end();
				} else if (getgroupmeter.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					//response.write(JSON.stringify([ "'" + getgroupmeter + "'" ]));
					response.write(String(getgroupmeter));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					//verursacht StatusCode400
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			//alles HKR
			case 'gethkrtsoll':
			case 'gethkrkomfort':
			case 'gethkrabsenk':
				const item3 = switchcmd.replace('gethkr', '');
				const gethkrtemp = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
					.map((device) => device.hkr[item3]);
				const getgrouphkrtemp = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
					.map((group) => group.hkr[item3]);
				if (gethkrtemp.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(gethkrtemp));
					response.end();
				} else if (getgrouphkrtemp.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(getgrouphkrtemp));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.Answer(response, 400);
				}
				return response;
				break;
			case 'sethkrtsoll':
				console.log('tsoll = ' + param);
				const sethkrtemp = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
					.map((device) => device.hkr.tsoll);
				const setgrouphkrtemp = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
					.map((group) => group.hkr.tsoll);
				if (sethkrtemp.length > 0) {
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].hkr.tsoll = param;
					response.statusCode = 200;
					response.write(String(param));
					response.end();
				} else if (setgrouphkrtemp.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].hkr.tsoll = param;
					response.statusCode = 200;
					response.write(String(param));
					response.end();
				} else {
					console.log('\x1b[31m', '->  did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			//different
			case 'getbasicdevicestats':
				// todo prüfen ob gruppen statistik haben können
				const thermostat = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
					.map((device) => device.temperature);
				const groupthermo = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
					.map((group) => group.temperature);
				const switcher = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('switch') && device.identifier === ain)
					.map((device) => device.switch);
				const groupswitcher = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('switch') && group.identifier === ain)
					.map((group) => group.switch);
				if (thermostat.length > 0) {
					//check the URL of the current request
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(this.xmlTempStats));
					response.end();
				} else if (switcher.length > 0) {
					//check the URL of the current request
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(this.xmlPowerStats));
					response.end();
				} else if (groupthermo.length > 0 || groupswitcher.length > 0) {
					//check the URL of the current request
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String('<devicestats></devicestats>'));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'setsimpleonoff':
				console.log('simple status ' + onoff);
				const simplevalue = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('simpleonoff') && device.identifier === ain)
					.map((device) => device.simpleonoff.state);
				const groupsimplevalue = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('simpleonoff') && group.identifier === ain)
					.map((group) => group.simpleonoff.state);
				let newstate = null;

				if (simplevalue.length > 0) {
					if (onoff == 2) {
						newstate = simplevalue == '1' ? '0' : '1';
					} else {
						//ohne prüfung ob auch 0 oder 1 geschickt wird
						newstate = onoff;
					}
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].simpleonoff.state = newstate;
					response.statusCode = 200;
					response.write(String(newstate));
					response.end();
				} else if (groupsimplevalue.length > 0) {
					if (onoff == 2) {
						newstate = groupsimplevalue == '1' ? '0' : '1';
					} else {
						//ohne prüfung ob auch 0 oder 1 geschickt wird
						newstate = onoff;
					}
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].simpleonoff.state = newstate;
					response.statusCode = 200;
					response.write(String(newstate));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response);
				}
				return response;
				break;
			case 'setlevel':
				console.log('level ' + level);
				const levelvalue = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('levelcontrol') && device.identifier === ain)
					.map((device) => device.levelcontrol.level);
				const grouplevel = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('levelcontrol') && group.identifier === ain)
					.map((group) => group.levelcontrol.level);
				if (levelvalue.length > 0) {
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].levelcontrol.level = level;
					this.apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = Math.floor(
						Number(level) / 255 * 100
					);
					response.write(String(level));
					response.statusCode = 200;
					response.end();
				} else if (grouplevel.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].levelcontrol.level = level;
					this.apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = Math.floor(
						Number(level) / 255 * 100
					);
					response.statusCode = 200;
					response.write(String(level));
					response.end();
				} else {
					console.log(' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response);
				}
				return response;
				break;
			case 'setlevelpercentage':
				console.log('level ' + level);
				const levelvalueperc = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('levelcontrol') && device.identifier === ain)
					.map((device) => device.levelcontrol.levelpercentage);
				const grouplevelperc = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('levelcontrol') && group.identifier === ain)
					.map((group) => group.levelcontrol.levelpercentage);
				if (levelvalueperc.length > 0) {
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].levelcontrol.level = Math.floor(Number(level) / 100 * 255);
					this.apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = level;
					response.statusCode = 200;
					response.write(String(level));
					response.end();
				} else if (grouplevelperc.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].levelcontrol.level = Math.floor(Number(level) / 100 * 255);
					this.apiresponse.devicelist.device[pos].levelcontrol.levelpercentage = level;
					response.statusCode = 200;
					response.write(String(level));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'setcolor':
				console.log('colorcmd ' + colorcmd);
				console.log('hue ' + hue);
				console.log('saturation ' + saturation);
				console.log('additional cmd duration' + duration);
				const colorvalue = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('colorcontrol') && device.identifier === ain)
					.map((device) => device.colorcontrol[colorcmd]);
				const groupcolor = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('colorcontrol') && group.identifier === ain)
					.map((group) => group.colorcontrol[colorcmd]);
				const newvalue = hue || saturation;
				if (colorvalue.length > 0) {
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].colorcontrol[colorcmd] = newvalue;
					response.statusCode = 200;
					//todo was kommt wirklich zurück?
					response.write(String(newvalue));
					response.end();
				} else if (groupcolor.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].colorcontrol[colorcmd] = newvalue;
					response.statusCode = 200;
					//todo was kommt wirklich zurück?
					response.write(String(newvalue));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'setcolortemperature':
				console.log('temperature ' + temperature);
				const settempvalue = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('colorcontrol') && device.identifier === ain)
					.map((device) => device.colorcontrol.temperature);
				const setgrouptemp = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('colorcontrol') && group.identifier === ain)
					.map((group) => group.colorcontrol.temperature);
				if (settempvalue.length > 0) {
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].colorcontrol.temperature = temperature;
					response.statusCode = 200;
					//todo was kommt wirklich zurück?
					response.write(String(temperature));
					response.end();
				} else if (setgrouptemp.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].colorcontrol.temperature = temperature;
					response.statusCode = 200;
					//todo was kommt wirklich zurück?
					response.write(String(temperature));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'getcolordefaults':
				//wird unabhängig von Lampen geschickt
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(this.xmlColors));
				response.end();
				return response;
				break;
			case 'sethkrboost':
				console.log('endtimestamp ' + endtimestamp);
				const hkrboost = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
					.map((device) => device.hkr.boostactiveendtime);
				const groupboost = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
					.map((group) => group.hkr.boostactiveendtime);
				const now = new Date();
				/*
				// auch in vergangenheit liegende Zeitstempel werden als gültig angesehen
				if (parseInt(endtimestamp) < now.getTime()) {
					endtimestamp = '';
				}
				*/

				if (parseInt(endtimestamp) * 1000 > now.getTime() + 86400) {
					console.log('\x1b[31m', ' endtime > now +24h ' + ain);
					response = this.errorAnswer(response, 500);
				} else if (hkrboost.length > 0) {
					const pos = this.findAin('device', ain);
					this.apiresponse.devicelist.device[pos].hkr.boostactiveendtime = endtimestamp;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(endtimestamp));
					response.end();
				} else if (groupboost.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].hkr.boostactiveendtime = endtimestamp;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(endtimestamp));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'sethkrwindowopen':
				console.log('endtimestamp ' + endtimestamp);
				const hkrwindow = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('hkr') && device.identifier === ain)
					.map((device) => device.hkr.windowopenactiveendtime);
				const groupwindow = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('hkr') && group.identifier === ain)
					.map((group) => group.hkr.windowopenactiveendtime);
				const now2 = new Date();
				/*
				// auch in vergangenheit liegende Zeitstempel werden als gültig angesehen
				if (parseInt(endtimestamp) < now2.getTime()) {
					endtimestamp = '';
				}
				*/
				if (parseInt(endtimestamp) > now2.getTime() + 86400) {
					console.log('\x1b[31m', ' endtime > now +24h ' + ain);
					response = this.errorAnswer(response, 500);
				} else if (hkrwindow.length > 0) {
					const pos = this.findAin('device', ain);
					//this.apiresponse.devicelist.device[pos].hkr.windowopenactiveendtime = endtimestamp;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(endtimestamp));
					response.end();
				} else if (groupwindow.length > 0) {
					const pos = this.findAin('group', ain);
					this.apiresponse.devicelist.group[pos].hkr.windowopenactiveendtime = endtimestamp;
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(endtimestamp));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'setblind':
				console.log('target ' + target);
				const blindvalue = this.apiresponse['devicelist']['device']
					.filter((device) => device.hasOwnProperty('blind') && device.identifier === ain)
					.map((device) => device.blind.mode);
				const groupblind = this.apiresponse['devicelist']['group']
					.filter((group) => group.hasOwnProperty('blind') && group.identifier === ain)
					.map((group) => group.blind.mode);
				if (blindvalue.length > 0) {
					response.statusCode = 200;
					response.write(String(target));
					response.end();
				} else if (groupblind.length > 0) {
					response.statusCode = 200;
					response.write(String(target));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in devices/groups ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'setname':
				response.statusCode = 200;
				response.write(String(name));
				response.end();
				return response;
				break;
			case 'setmetadata':
				break;
			case 'gettriggerlistinfos':
				// todo empty templates
				response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
				response.write(String(this.xmlTrigger));
				response.end();
				return response;
				break;
			case 'settriggeractive':
				console.log('active ' + active);
				const trigger = this.apiresponse['triggerlist']['trigger'].filter(
					(trigger) => trigger.hasOwnProperty('identifier') && trigger.identifier === ain
				);
				if (trigger.length > 0) {
					response.writeHead(200, { 'xmlDevicesGroups-Type': 'application/json' });
					response.write(String(active));
					response.end();
				} else {
					console.log('\x1b[31m', ' did not find the ain in trigger ' + ain);
					response = this.errorAnswer(response, 400);
				}
				return response;
				break;
			case 'setmappedcolor':
				break;
			case 'setcolortemperature':
				break;
			case 'addcolorleveltemplate':
				break;
			case 'startulesubscription':
				break;
			case 'getsubscriptionstate':
				break;
			default:
				console.log('\x1b[31m', 'switchcmd no case found ' + switchcmd);
				response = this.errorAnswer(response, 400);
				return response;
				break;
		}
	}
	// helper function
	findAin(type, ain) {
		let position = null;
		if (type === 'device') {
			for (let i = 0; i < this.apiresponse['devicelist']['device'].length; i++) {
				if (this.apiresponse['devicelist']['device'][i].identifier === ain) {
					position = i;
					break;
				}
			}
		} else if (type === 'group') {
			for (let i = 0; i < this.apiresponse['devicelist']['group'].length; i++) {
				if (this.apiresponse['devicelist']['group'][i].identifier === ain) {
					position = i;
					break;
				}
			}
		}
		return position;
	}
	xml2ApiResponse(xmlDevGroups, xmlTemplates, xmlTrigger) {
		//Devices and Groups derved from xmlDevicesGroups
		const devices2json = parser.xml2json(String(xmlDevGroups));
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
		//Templates derived from xmlTemplate
		const templates2json = parser.xml2json(String(xmlTemplates));
		let templates = [].concat((templates2json.templatelist || {}).template || []).map(function(template) {
			// remove spaces in AINs
			// template.identifier = group.identifier.replace(/\s/g, '');
			return template;
		});
		const trigger2json = parser.xml2json(String(xmlTrigger));
		let triggers = [].concat((trigger2json.triggerlist || {}).trigger || []).map((trigger) => {
			return trigger;
		});
		//apiresponse is the xml file with AINs not having the spaces inside
		//used in the response
		this.apiresponse['devicelist'] = { version: '1', device: devices, group: groups };
		this.apiresponse['templatelist'] = { version: '1', template: templates };
		this.apiresponse['triggerlist'] = { version: '1', trigger: triggers };
		//console.log(apiresponse);
	}
}

module.exports = FritzEmu;

// ausprobieren bei echter FB ob getswitchname, getswitchpresent, gettemperature auch auf thermostat geht
// gettemperature hat 0.1
// gethkrtemps hat 0,5 Schrittweite
// was kommt bei logout von FB zurück?
