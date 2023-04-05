//--------------- sample code ----------------

const Fritz = require('./index.js').Fritz;

const fritz = new Fritz('admin', 'password', 'http://localhost:3333', false);

async function test() {
	const login = await fritz.login_SID().catch((e) => {
		console.log('fault calling login() ', e);
	});
	console.log('login', login);
	if (login) {
		await fritz
			.getDeviceListInfos()
			.then(function(response) {
				console.log('Devices' + response);
			})
			.catch((e) => {
				console.log('Fehler Devicelist ', e);
			});

		await fritz
			.getUserPermissions()
			.then(function(response) {
				console.log('Rights : ' + response);
			})
			.catch((e) => {
				console.log('Fehler getUserPermissions', e);
			});

		await fritz
			.check_SID()
			.then(function(response) {
				console.log('Checkresponse : ' + response);
			})
			.catch((e) => {
				console.log('Fehler checkSID', e);
			});
		await fritz
			.logout_SID()
			.then(function(response) {
				console.log('logout : ' + response);
			})
			.catch((e) => {
				console.log('Fehler logout_SID', e);
			});
	}
	//with relogin
	await fritz
		.getDeviceListInfos()
		.then(function(response) {
			console.log('Devices' + response);
		})
		.catch((e) => {
			console.log('Fehler Devicelist ', e);
		});
	await fritz
		.logout_SID()
		.then(function(response) {
			console.log('logout : ' + response);
		})
		.catch((e) => {
			console.log('Fehler logout_SID', e);
		});
}
test();
