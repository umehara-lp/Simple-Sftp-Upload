define(function(require) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 Dialogs							= brackets.getModule("widgets/Dialogs"),
		 FileSystem						= brackets.getModule("filesystem/FileSystem"),
		 Mustache						= brackets.getModule("thirdparty/mustache/mustache"),
		
		 P_MANAGER						= require("modules/PreferencesManager"),
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		
		 dialog_configuration_tmp	= require("text!html/dialog_configuration.html"),
		 $dialog_configuration,
		
		 context							= {Strings: Strings, MyStrings: STRINGS};
	
	
	/* savePrefs ------------------------------------------------------------ */
	function savePrefs(config) {
		config = config.replace(/\\|\\/g, '/');
		if(config.slice(-1) != "/")  config += "/";
		P_MANAGER.set("_storageLocation", config);
	}
	
	
	/* loadPrefs ------------------------------------------------------------ */
	function loadPrefs() {
		$dialog_configuration.find('.location_path').val(P_MANAGER.get("_storageLocation"));
	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog(){
		
		var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_configuration_tmp, context));
		$dialog_configuration = dl.getElement();
		
		loadPrefs();
		
		$dialog_configuration.on( 'click', '.dialog-button-save', function() {
			savePrefs($dialog_configuration.find( ".location_path" ).val());
		} );
		
		$dialog_configuration.on( 'click', '.dialog-button-reference', function() {
			FileSystem.showOpenDialog(false, true, STRINGS.TXT_SELECT_SAVE_FOLDER, null, null, function(str, paths) {
				$dialog_configuration.find( ".location_path" ).val(paths);
			});
		} );
		
		DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-configuration_dialog"), { dragZone: ".modal-wrapper .modal-header", resizer: false });
		
	}
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		CommandManager.register(STRINGS.TXT_SETTING, mid, openDialog);
		menu.addMenuItem(mid);
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		addMenu: addMenu,
		openDialog: openDialog
	};
	
});