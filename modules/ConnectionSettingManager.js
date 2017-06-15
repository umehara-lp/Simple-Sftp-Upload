define(function(require) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 Dialogs							= brackets.getModule("widgets/Dialogs"),
		 FileSystem						= brackets.getModule("filesystem/FileSystem"),
		 FileUtils						= brackets.getModule("file/FileUtils"),
		 ProjectManager				= brackets.getModule("project/ProjectManager"),
		 Mustache						= brackets.getModule("thirdparty/mustache/mustache"),
		
		 P_MANAGER						= require("modules/PreferencesManager"),
		 CF_MANAGER						= require("modules/ConfigurationManager"),
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		 
		 dialog_connection_tmp		= require("text!html/dialog_connection.html"),
		 $dialog_connection,
		
		 context							= {Strings: Strings, MyStrings: STRINGS};
	
	
	/* savePrefs ------------------------------------------------------------ */
	function savePrefs(config) {
		var projectRoot = ProjectManager.getProjectRoot();
		P_MANAGER.set(projectRoot._path, config);
	}
	
	
	/* setInputValues ------------------------------------------------------------ */
	function setInputValues(settings) {
		
		$dialog_connection.find('.input-connecting-name').val(settings.connectingName);
			
		$dialog_connection.find('.input-method').val(settings.method);
		$dialog_connection.find('.input-host').val(settings.host);
		$dialog_connection.find('.input-port').val(settings.port);
		$dialog_connection.find('.input-username').val(settings.username);
		$dialog_connection.find('.input-rsa-path').val(settings.rsaPath);
		$dialog_connection.find('.input-password').val(settings.password);
		$dialog_connection.find('.input-server-path').val(settings.serverPath);
		if(settings.save){
			$dialog_connection.find('.input-save').prop('checked', true);
		}
		
		$dialog_connection.find('.input-method-p').val(settings.method_p);
		$dialog_connection.find('.input-host-p').val(settings.host_p);
		$dialog_connection.find('.input-port-p').val(settings.port_p);
		$dialog_connection.find('.input-username-p').val(settings.username_p);
		$dialog_connection.find('.input-rsa-path-p').val(settings.rsaPath_p);
		$dialog_connection.find('.input-password-p').val(settings.password_p);
		$dialog_connection.find('.input-server-path-p').val(settings.serverPath_p);
		
	}
	
	
	/* getInputValues ------------------------------------------------------------ */
	function getInputValues() {
		
		return {
			connectingName:	$dialog_connection.find('.input-connecting-name').val(),
			
			method:				$dialog_connection.find('.input-method').val(),
			host:					pathExchange($dialog_connection.find('.input-host').val(), "false", "false"),
			port:					$dialog_connection.find('.input-port').val(),
			username:			$dialog_connection.find('.input-username').val(),
			rsaPath:				pathExchange($dialog_connection.find('.input-rsa-path').val(), "false", "false"),
			password:			$dialog_connection.find('.input-password').val(),
			serverPath:			pathExchange($dialog_connection.find('.input-server-path').val(), "through", "true"),
			save:					$dialog_connection.find('.input-save').is(':checked'),
			
			method_p:			$dialog_connection.find('.input-method-p').val(),
			host_p:				pathExchange($dialog_connection.find('.input-host-p').val(), "false", "false"),
			port_p:				$dialog_connection.find('.input-port-p').val(),
			username_p:			$dialog_connection.find('.input-username-p').val(),
			rsaPath_p:			pathExchange($dialog_connection.find('.input-rsa-path-p').val(), "false", "false"),
			password_p:			$dialog_connection.find('.input-password-p').val(),
			serverPath_p:		pathExchange($dialog_connection.find('.input-server-path-p').val(), "through", "true")
		};
		
	}
	
	
	/* pathExchange ------------------------------------------------------------ */
	function pathExchange( _path, slashStart, slashEnd ) {
		
		var path = _path;
		if(path){
			path = path.replace(/\\|\\/g, '/');
			if(slashStart == "true"){
				if(path.slice(0, 1) != "/")  path = "/" + path;
			}else if(slashStart == "false"){
				if(path.slice(0, 1) == "/")  path = path.substr(1);
			}
			if(slashEnd == "true"){
				if(path.slice(-1) != "/")  path += "/";
			}else if(slashEnd == "false"){
				if(path.slice(-1) == "/")  path = path.substr(0, path.length-1);
			}
		}
		return path;
		
	}
	
	
	/* saveConnectionSetting ------------------------------------------------------------ */
	function saveConnectionSetting() {
		
		var newSettings = getInputValues(),
			 fileName = newSettings.connectingName + ".prf",
			 fileEntry = FileSystem.getFileForPath( P_MANAGER.get("_storageLocation") + fileName );
		
		newSettings["prfver"] = "1";
		
		FileUtils.writeText( fileEntry, JSON.stringify( newSettings, null, '\t' ), true ).done( function() {} );
		
		savePrefs(fileName);
		
	}
	
	
	/* loadConnectionSetting ------------------------------------------------------------ */
	function loadConnectionSetting(load_file,callback) {
		
		var projectRoot = ProjectManager.getProjectRoot(), fileEntry, fileContent, fileSettings = {};
		
		if(load_file){
			fileEntry = FileSystem.getFileForPath( load_file );
		} else {
			fileEntry = FileSystem.getFileForPath( P_MANAGER.get("_storageLocation") + P_MANAGER.get(projectRoot._path) );
		}
		
		fileEntry.exists( function( err, exists ) {
			if ( exists ) {
				fileContent = FileUtils.readAsText( fileEntry );
				fileContent.done( function( content ) {
					try {
						fileSettings = JSON.parse( content );
						if(callback){
							callback(fileSettings);
						}else{
							setInputValues(fileSettings);
						}
					} catch ( e ) {}
				} ).always( function() {
					return fileSettings;
				} );
			}
		} );
	}
	
	
	function getConnectionSetting(callback) {
		loadConnectionSetting(false,callback);
	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog() {
		
		if(!P_MANAGER.get("_storageLocation")) {
			CF_MANAGER.openDialog();
		} else {
		
			var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_connection_tmp, context));
			$dialog_connection = dl.getElement();
			
			loadConnectionSetting();
			
			$dialog_connection.on( 'click', '.dialog-button-save', function() {
				saveConnectionSetting();
			} );
			
			$dialog_connection.find(".nav-tabs a").click(function (e) {
				e.preventDefault();
				$(this).tab('show');
			});
			
			$dialog_connection.on( 'click', '.dialog-button-reference', function() {
				FileSystem.showOpenDialog(false, false, STRINGS.TXT_CONNECTION_SETTING_LOAD, P_MANAGER.get("_storageLocation"), null, function(str, paths) {
					loadConnectionSetting(paths[0]);
				});
			} );
			
			$dialog_connection.on( 'click', '.dialog-button-rsa-reference', function() {
				FileSystem.showOpenDialog(false, false, STRINGS.TXT_CONNECTION_SETTING_LOAD, null, null, function(str, paths) {
					$dialog_connection.find( ".input-rsa-path" ).val(paths);
				});
			} );
			
			$dialog_connection.on( 'click', '.dialog-button-rsa-reference-p', function() {
				FileSystem.showOpenDialog(false, false, STRINGS.TXT_CONNECTION_SETTING_LOAD, null, null, function(str, paths) {
					$dialog_connection.find( ".input-rsa-path-p" ).val(paths);
				});
			} );
			
			DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-connection_dialog"), { dragZone: ".modal-wrapper .modal-header", resizer: false });
			
		}
		
	}
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		CommandManager.register(STRINGS.TXT_CONNECTING_SETTING, mid, openDialog);
		menu.addMenuItem(mid);
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		addMenu: addMenu,
		getConnectionSetting: getConnectionSetting
	};
	
});