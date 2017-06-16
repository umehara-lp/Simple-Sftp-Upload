define(function(require, exports, module) {
	"use strict";
	var FileSystem = brackets.getModule("filesystem/FileSystem"),
		FileUtils = brackets.getModule("file/FileUtils");


	function isSte(load_file, $dialog_connection){
		console.log(load_file);
		if(FileUtils.getFileExtension(load_file) === "ste"){
			ste_reader(load_file, function(ste){
				setSteValues(ste, $dialog_connection);
			});
			return true;
		}else{
			return false;
		}
	}


	function setSteValues(ste, $dialog_connection) {
		$dialog_connection.find('.input-connecting-name').val(ste.siteName);

		if(ste.testingServer.useSFTP === "TRUE"){
			$dialog_connection.find('.input-method').val("sftp");
			$dialog_connection.find('.input-port').val(22);
			$dialog_connection.find('.input-password').val(ste.testingServer.passphrase);
		} else {
			$dialog_connection.find('.input-method').val("ftp");
			$dialog_connection.find('.input-port').val(21);
			$dialog_connection.find('.input-password').val(ste.testingServer.pw);
		}
		if(ste.testingServer.port){
			$dialog_connection.find('.input-port').val(ste.testingServer.port);
		}
		$dialog_connection.find('.input-host').val(ste.testingServer.host);
		$dialog_connection.find('.input-username').val(ste.testingServer.user);
		$dialog_connection.find('.input-rsa-path').val(ste.testingServer.identityfileabsolutepath);
		$dialog_connection.find('.input-server-path').val(ste.testingServer.remoteroot);
		if(ste.save){
			$dialog_connection.find('.input-save').prop('checked', true);
		}

		if(ste.remoteServer.useSFTP === "TRUE"){
			$dialog_connection.find('.input-method-p').val("sftp");
			$dialog_connection.find('.input-port-p').val(22);
			$dialog_connection.find('.input-password-p').val(ste.remoteServer.passphrase);
		} else {
			$dialog_connection.find('.input-method-p').val("ftp");
			$dialog_connection.find('.input-port-p').val(21);
			$dialog_connection.find('.input-password-p').val(ste.remoteServer.pw);
		}
		if(ste.remoteServer.port){
			$dialog_connection.find('.input-port-p').val(ste.remoteServer.port);
		}
		$dialog_connection.find('.input-host-p').val(ste.remoteServer.host);
		$dialog_connection.find('.input-username-p').val(ste.remoteServer.user);
		$dialog_connection.find('.input-rsa-path-p').val(ste.remoteServer.identityfileabsolutepath);
		$dialog_connection.find('.input-server-path-p').val(ste.remoteServer.remoteroot);

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

		return rtn;
	}


	function main() {
		var siteName = document.querySelector("#xml_reader localinfo").getAttribute("sitename");
		siteName = decodeURI(siteName);
		var rtn = {};
		rtn.siteName = siteName;
		var servers = document.querySelectorAll("#xml_reader server");
		var attrArray = ["name", "accesstype", "host", "remoteroot", "user", "pw", "passphrase", "usepasv", "useSFTP", "identityfileabsolutepath"];
		[].forEach.call(servers, function(server, i, arr) {
			var serverType = false;
			serverType = server.getAttribute("servertype");
			var accesstype = server.getAttribute("accesstype");
			if(!serverType || accesstype === "lan"){
				return;
			} else {
				rtn[serverType] = {};
				var serverObj = rtn[serverType];
				attrArray.forEach(function(attr) {
					if (!server.hasAttribute(attr)) {
						return;
					}
					var gettedAttr = server.getAttribute(attr);
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
