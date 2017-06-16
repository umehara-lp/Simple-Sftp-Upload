define(function(require) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 ProjectManager				= brackets.getModule("project/ProjectManager"),
		 FileSystem						= brackets.getModule("filesystem/FileSystem"),
		
		 P_MANAGER						= require("modules/PreferencesManager"),
		 CS_MANAGER						= require("modules/ConnectionSettingManager"),
		 FL_MANAGER						= require("modules/FtpLogManager"),
		 STRINGS							= require("modules/Strings"),
		
		 context							= {Strings: Strings, MyStrings: STRINGS},
		
		 uploadCheck					= false,
		 date,
		 environment,
		 errorTxt						= "",
		
		 _nodeDomain;
	
	
	/* getNdate ------------------------------------------------------------ */
	function getNdate() {
		
		var ndate = 'YYYY-MM-DD hh:mm:ss';
		date = new Date();
		ndate = ndate.replace(/YYYY/g, date.getFullYear());
		ndate = ndate.replace(/MM/g, date.getMonth());
		ndate = ndate.replace(/DD/g, date.getDate());
		ndate = ndate.replace(/hh/g, date.getHours());
		ndate = ndate.replace(/mm/g, date.getMinutes());
		ndate = ndate.replace(/ss/g, date.getSeconds());
		
		return ndate;
		
	}
	
	
	/* uploadItem ------------------------------------------------------------ */
	function uploadItem(localPath, remotePath, serverConnectionSetting) {
		
		_nodeDomain.exec('upload', localPath, remotePath, serverConnectionSetting).done(function(){
			
		}).fail(function(err){
//			var _errorTxt = '<span class="log error"><span class="o">[ERROR]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + err + '</span></span>';
//			if(errorTxt != _errorTxt){
//				FL_MANAGER.outputLog('<span class="log error"><span class="o">[ERROR]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + err + '</span></span>');
//				errorTxt = _errorTxt;
//			}
		});
		
	}
	
	
	/* uploadDirectory ------------------------------ */
	function uploadDirectory(localPath, remotePath, serverConnectionSetting) {
		
		_nodeDomain.exec('uploadDirectory', localPath, remotePath, serverConnectionSetting).done(function(){
			
		}).fail(function(err){
//			var _errorTxt = '<span class="log error"><span class="o">[ERROR]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + err + '</span></span>';
//			if(errorTxt != _errorTxt){
//				FL_MANAGER.outputLog('<span class="log error"><span class="o">[ERROR]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + err + '</span></span>');
//				errorTxt = _errorTxt;
//			}
		});
		
	}
	
	
	/* server upload ------------------------------------------------------------ */
	function serverUpload(accessPoint,uploadOnSave,_item,_remotePath) {
		
		/*if( uploadCheck ){
			alert(STRINGS.TXT_START_UPLOADING_Q_NOW);
			return false;
		}*/
		
		FL_MANAGER.panelOpen();
		
		if(!P_MANAGER.get("_storageLocation")) {
			FL_MANAGER.outputLog('<span class="log warning"><span class="o">[WARNING]</span><span class="e"></span><span class="t">' + getNdate() + '</span><span class="d">' + STRINGS.TXT_SETTING_ERROR + '</span></span>');
			return false;
		}
		
		var serverConnectionSetting = {},
			 item,
			 item_full,
			 projectUrl,
			 remotePath;
		
		if(uploadOnSave){
			item_full = _item;
			remotePath = _remotePath;
		}else{
			item = ProjectManager.getSelectedItem();
			item_full = item.fullPath;
			projectUrl = ProjectManager.getProjectRoot().fullPath;
			remotePath = item.fullPath.replace(projectUrl, '');
		}
		
		CS_MANAGER.getConnectionSetting(function(connectionSetting){
			
			if(accessPoint == "test"){
				environment = STRINGS.TXT_TESTING_ENVIRONMENT;
				serverConnectionSetting = {
					method: connectionSetting.method,
					host: connectionSetting.host,
					port: connectionSetting.port,
					username: connectionSetting.username,
					rsaPath: connectionSetting.rsaPath,
					password: connectionSetting.password,
					serverPath: connectionSetting.serverPath
				};
			}else if(accessPoint == "production"){
				environment = STRINGS.TXT_PRODUCTION_ENVIRONMENT;
				serverConnectionSetting = {
					method: connectionSetting.method_p,
					host: connectionSetting.host_p,
					port: connectionSetting.port_p,
					username: connectionSetting.username_p,
					rsaPath: connectionSetting.rsaPath_p,
					password: connectionSetting.password_p,
					serverPath: connectionSetting.serverPath_p
				};
			}
			
			var auto = "";
			if(uploadOnSave && !connectionSetting.save) return false;
			if(uploadOnSave) auto = " auto";
			
			if(serverConnectionSetting.host){
				
				//uploadCheck = true;
				
				FL_MANAGER.outputLog('<span class="log start"><span class="o">[' + STRINGS.TXT_START_UPLOADING_Q + auto + ']</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + item_full + "&nbsp;--->&nbsp;" + serverConnectionSetting.host + "/" +  serverConnectionSetting.serverPath + remotePath + '</span></span>');
				
				if(uploadOnSave){
					uploadItem(item_full, remotePath, serverConnectionSetting);
				}else{
					if(item.isFile){
						uploadItem(item_full, remotePath, serverConnectionSetting);
					}else{
						uploadDirectory(item_full, remotePath, serverConnectionSetting);
					}
				}
				
			} else {
				FL_MANAGER.outputLog('<span class="log warning"><span class="o">[WARNING]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + STRINGS.TXT_NO_CONNECTION_HOST + '</span></span>');
			}
			
		});
		
		
	}
	
	/* uploadTestSite ------------------------------------------------------------ */
	function uploadTestSite(){
		
		serverUpload("test", false);
		
	}
	
	
	/* uploadProductionSite ------------------------------------------------------------ */
	function uploadProductionSite(){
		
		serverUpload("production", false);
		
	}
	
	
	/* setUploadEvent ------------------------------------------------------------ */
	function setUploadEvent(){
		
		_nodeDomain.on('uploading', function(obj, remotePath){
			var uid = getUniqueId(remotePath);
			FL_MANAGER.outputLog('<span class="log"><span id="' + uid + '" class="o">[' + STRINGS.TXT_UPLOADING + ']</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + remotePath+ '</span></span>');
		});
		
		_nodeDomain.on('uploaded', function(obj, remotePath){
			var uid = getUniqueId(remotePath);
			$("#" + uid).html("[" + STRINGS.TXT_UPLOADING_COMP + "]");
		});
		
		_nodeDomain.on('jobCompleted', function(err, msg){
			FL_MANAGER.outputLog('<span class="log complete"><span class="o">[' + STRINGS.TXT_UPLOADING_COMP_Q + ']</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d"></span></span>');
			//uploadCheck = false;
		});
		
		_nodeDomain.on('error', function(err, msg){
			var _errorTxt = '<span class="log error"><span class="o">[ERROR]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + msg + '</span></span>';
			if(errorTxt != _errorTxt){
				FL_MANAGER.outputLog('<span class="log error"><span class="o">[ERROR]</span><span class="e">' + environment + '</span><span class="t">' + getNdate() + '</span><span class="d">' + msg + '</span></span>');
				errorTxt = _errorTxt;
				//uploadCheck = false;
			}
		});
		
	}
	
	
	/* getUniqueId ------------------------------------------------------------ */
	function getUniqueId(remotePath){
		
		var projectRoot = ProjectManager.getProjectRoot(),
			 _id = "id" + projectRoot._path + remotePath,
			 id = symbolCheck(encodeURI(_id));
		
		return id;
		
	}
	
	
	/* symbolCheck ------------------------------------------------------------ */
	function symbolCheck(val) {
		return val.replace(/[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]/g, '');
	}
	
	
	/* setUploadOnSave ------------------------------------------------------------ */
	function setUploadOnSave(){
		
		FileSystem.on( 'change', function( event, entry, created, deleted ) {
			
			if(entry !== null){
				var path = entry._path,
					 projectUrl = ProjectManager.getProjectRoot().fullPath;
				
				if( path.indexOf(projectUrl) === 0 ){
					serverUpload("test", true, path, path.replace(projectUrl, ''));
				}
			}
			
		});
		
	}
	
	
	/* init ------------------------------------------------------------ */
	function init(nodeDomain){
		
		_nodeDomain = nodeDomain;
		
		setUploadEvent();
		
		setUploadOnSave();
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		init: init,
		uploadTestSite: uploadTestSite,
		uploadProductionSite: uploadProductionSite
	};
	
});