define(function(require, exports, module) {
	"use strict";
	var FileSystem = brackets.getModule("filesystem/FileSystem"),
		FileUtils = brackets.getModule("file/FileUtils");


	function isSte(load_file, $dialog_connection, callback){
		//console.log(load_file);
		if(FileUtils.getFileExtension(load_file) === "ste"){
			ste_reader(load_file, function(ste){
				setSteValues(ste, $dialog_connection, callback);
			});
			return true;
		}else{
			return false;
		}
	}


	function setSteValues(ste, $dialog_connection, callback) {
		var moldedSte = {};
		moldedSte.connectingName = ste.siteName;

		if(ste.testingServer){
			moldedSte.siteUrl = ste.testingServer.weburl;
			if(ste.testingServer.useSFTP === "TRUE"){
				moldedSte.method = "sftp";
				moldedSte.port = 22;
				moldedSte.password = ste.testingServer.passphrase;
			} else if(ste.testingServer.accesstype === "lan") {
				moldedSte.method = "local";
			} else {
				moldedSte.method = "ftp";
				moldedSte.port = 21;
				moldedSte.password = ste.testingServer.pw;
			}
			if(ste.testingServer.port){
				moldedSte.port = ste.testingServer.port;
			}
			if(ste.testingServer.accesstype === "lan"){
				moldedSte.host = ste.testingServer.remoteroot;
			} else {
				moldedSte.host = ste.testingServer.host;
			}
			moldedSte.username = ste.testingServer.user;
			moldedSte.rsaPath = ste.testingServer.identityfileabsolutepath;
			moldedSte.serverPath = ste.testingServer.remoteroot;
			if(ste.save){
				moldedSte.save = true;
			}
			
		}else{
			moldedSte.method = "ftp";
		}

		if(ste.remoteServer){
			moldedSte.siteUrl_p = ste.remoteServer.weburl;
			if(ste.remoteServer.useSFTP === "TRUE"){
				moldedSte.method_p = "sftp";
				moldedSte.port_p = 22;
				moldedSte.password_p = ste.remoteServer.passphrase;
			} else if(ste.remoteServer.accesstype === "lan") {
				moldedSte.method_p = "local";
			} else {
				moldedSte.method_p = "ftp";
				moldedSte.port_p = 21;
				moldedSte.password_p = ste.remoteServer.pw;
			}
			if(ste.remoteServer.port){
				moldedSte.port_p = ste.remoteServer.port;
			}
			if(ste.remoteServer.accesstype === "lan"){
				moldedSte.host_p = ste.remoteServer.remoteroot;
			} else {
				moldedSte.host_p = ste.remoteServer.host;
			}
			moldedSte.username_p = ste.remoteServer.user;
			moldedSte.rsaPath_p = ste.remoteServer.identityfileabsolutepath;
			moldedSte.serverPath_p = ste.remoteServer.remoteroot;
			
		}else{
			moldedSte.method_p = "ftp";
		}

		callback(moldedSte);
	}


	function xml_reader(content) {
		var xml = content;
		var elm = document.createElement("div");
		elm.id = "xml_reader";
		document.body.appendChild(elm);
		elm.innerHTML = xml;
		return main();
	}


	function decode_pw(hash) {
		var pass = '';
		for (var i = 0; i < hash.length; i += 2) {
			pass += String.fromCharCode(parseInt(hash[i] + '' + hash[i + 1], 16) - (i / 2));
		}
		return pass;
	}


	function ste_reader(path, callback) {
		
		var rtn;
		var fileEntry, fileContent;

		if(path){
			path = path.replace(/\\|\\/g, '/');
		}

		fileEntry = FileSystem.getFileForPath(path);

		fileEntry.exists(function(err, exists) {
			if (exists) {
				
				fileContent = FileUtils.readAsText(fileEntry);
				fileContent.done(function(content) {
					try {
						rtn = xml_reader(content);
						callback(rtn);
					} catch (e) {}
				});
			}
		});
	}


	function main() {
		var siteName = document.querySelector("#xml_reader localinfo").getAttribute("sitename");
		siteName = decodeURI(siteName);
		var rtn = {};
		rtn.siteName = siteName;
		var servers = document.querySelectorAll("#xml_reader server");
		//console.log(servers.length);
		var attrArray = [
			"name",
			"accesstype",
			"host",
			"remoteroot",
			"user",
			"pw",
			"passphrase",
			"usepasv",
			"useSFTP",
			"identityfileabsolutepath",
			"weburl"
		];
		[].forEach.call(servers, function(server, i, arr) {
			var serverType = false;
			serverType = server.getAttribute("servertype");
			var accesstype = server.getAttribute("accesstype");
			if(!serverType){
				return;
			} else {
				rtn[serverType] = {};
				var serverObj = rtn[serverType];
				attrArray.forEach(function(attr) {
					if (!server.hasAttribute(attr)) {
						return;
					}
					var gettedAttr = server.getAttribute(attr);
					if (attr === "weburl" && !/^http(s|):\/\/.+?/.test(gettedAttr)) {
						return;
					}
					if (attr === "pw" || attr === "passphrase") {
						gettedAttr = decode_pw(gettedAttr);
					}
					if (attr === "host" && /:\d{1,5}$/.test(gettedAttr)) {
						var gettedAttrSplitArr = gettedAttr.split(":");
						gettedAttr = gettedAttrSplitArr[0];
						serverObj.port = gettedAttrSplitArr[1];
					}
					var decodedAttr = decodeURI(gettedAttr);
					serverObj[attr] = decodedAttr;
				});
			}
		});
		document.body.removeChild(document.getElementById("xml_reader"));
		return (rtn);
	}

	return {
		isSte: isSte
	};
});
