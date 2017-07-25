define(function(require) {
	"use strict";
	
	var AppInit							= brackets.getModule("utils/AppInit"),
		 Strings							= brackets.getModule("strings"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 WorkspaceManager				= brackets.getModule("view/WorkspaceManager"),
		 Mustache						= brackets.getModule("thirdparty/mustache/mustache"),
		 ProjectManager				= brackets.getModule("project/ProjectManager"),
		
		 CS_MANAGER,
		 STRINGS							= require("modules/Strings"),
		 
		 dialog_ftp_log_tmp			= require("text!html/dialog_ftp_log.html"),
		 panel,
		 $panel,
		 menuId,
		
		 context							= {Strings: Strings, MyStrings: STRINGS};
	
	
	/* outputLog ------------------------------------------------------------ */
	function outputLog(log) {
		
		$panel.find('ul').prepend( "<li>" + log + "</li>" );
		
	}
	
	
	/* panelToggle ------------------------------------------------------------ */
	function panelToggle() {
		
		if(panel.isVisible()) {
			panelClose();
		} else {
			panelOpen();
		}
		
	}
	
	
	/* panelOpen ------------------------------------------------------------ */
	function panelOpen() {
		
		if(!panel.isVisible()) {
			panel.show();
			CommandManager.get(menuId).setChecked(true);
		}
		
	}
	
	
	/* panelClose ------------------------------------------------------------ */
	function panelClose() {
		
		if(panel.isVisible()) {
			panel.hide();
			CommandManager.get(menuId).setChecked(false);
		}
		
	}
	
	/* setLink ------------------------------------------------------------ */
	function setLink(){
		
		$panel.find(".btn-test").hide();
		$panel.find(".btn-production").hide();
		
		CS_MANAGER.getConnectionSetting(function(val){
			var seiteUrl = val.siteUrl, siteUrl_p = val.siteUrl_p;
			if(seiteUrl) $panel.find(".btn-test").attr("href", seiteUrl).show();
			if(siteUrl_p) $panel.find(".btn-production").attr("href", siteUrl_p).show();
		});
		
	}
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		menuId = mid;
		CommandManager.register(STRINGS.TXT_FTP_LOG, mid, panelToggle);
		menu.addMenuItem(mid);
		
		panel = WorkspaceManager.createBottomPanel(mid, $(Mustache.render(dialog_ftp_log_tmp, context)),50);
		$panel = $("#au-ssftp-ftp_log_panel");
		
		$panel.on( 'click', '.close,.title', function() {
			panelToggle();
		} );
		
		setLink();
		
	}
	
	
	/* init ------------------------------------------------------------ */
	AppInit.appReady( function() {
		
		CS_MANAGER = require("modules/ConnectionSettingManager");
		
		ProjectManager.on("projectOpen", function() {
			setLink();
		});
		
	});
	
	
	/* return ------------------------------------------------------------ */
	return {
		addMenu: addMenu,
		outputLog: outputLog,
		panelOpen: panelOpen,
		panelClose: panelClose,
		setLink: setLink
	};
	
});