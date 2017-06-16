define(function(require, exports, module) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 AppInit							= brackets.getModule("utils/AppInit"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 Menus							= brackets.getModule("command/Menus"),
		 ExtensionUtils				= brackets.getModule("utils/ExtensionUtils"),
		 NodeDomain						= brackets.getModule("utils/NodeDomain"),
		
		 P_MANAGER						= require("modules/PreferencesManager"),
		 CF_MANAGER						= require("modules/ConfigurationManager"),
		 CS_MANAGER						= require("modules/ConnectionSettingManager"),
		 FL_MANAGER						= require("modules/FtpLogManager"),
		 SFTP_MANAGER					= require("modules/SftpManager"),
		 SFTP_SV_MANAGER				= require("modules/SftpServerManager"),
		 STRINGS							= require("modules/Strings"),
		
		 packageJSON					= require("text!package.json"),
		 packageName					= JSON.parse(packageJSON).name,
		 menu								= Menus.getMenu(packageName),
		 contextMenu					= Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
		
		_domainPath						= ExtensionUtils.getModulePath(module, "node/SftpUploadDomain"),
		_nodeDomain						= new NodeDomain("auSimpleSftpUpload", _domainPath);
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu() {
		
		var menuId1 = packageName + ".menu1",
			 menuId2 = packageName + ".menu2",
			 menuId3 = packageName + ".menu3",
			 menuId4 = packageName + ".menu4",
			 menuId5 = packageName + ".menu5",
			 menuId6 = packageName + ".menu6";
		
		if(!menu) {
			menu = Menus.addMenu(STRINGS.EXTENSION_NAME, packageName, Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);
		}
		
		// add Menu
		CS_MANAGER.addMenu(menu, menuId2);
		menu.addMenuDivider();
		CF_MANAGER.addMenu(menu, menuId1);
		menu.addMenuDivider();
		SFTP_SV_MANAGER.addMenu(menu, menuId6);
		menu.addMenuDivider();
		FL_MANAGER.addMenu(menu, menuId3);
		
		// add Context Menu
		CommandManager.register(STRINGS.TXT_TEST_UPLOAD, menuId4, SFTP_MANAGER.uploadTestSite);
		CommandManager.register(STRINGS.TXT_PRODUCTION_UPLOAD, menuId5, SFTP_MANAGER.uploadProductionSite);
		contextMenu.addMenuDivider();
		contextMenu.addMenuItem(menuId4, "");
		contextMenu.addMenuDivider();
		contextMenu.addMenuItem(menuId5, "");
		
		
	}
	
	
	/* init ------------------------------------------------------------ */
	AppInit.appReady( function() {
		
		ExtensionUtils.loadStyleSheet(module, "modules/style.css");
		
		addMenu();
		
		SFTP_MANAGER.init(_nodeDomain);
		SFTP_SV_MANAGER.init(_nodeDomain);
		
		if(!P_MANAGER.get("_storageLocation")) {
			CF_MANAGER.openDialog();
		}
		
	});
	
});