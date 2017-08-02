define(function(require, exports, module) {
	"use strict";
	
	var Strings					= brackets.getModule("strings"),
		 AppInit					= brackets.getModule("utils/AppInit"),
		 CommandManager		= brackets.getModule("command/CommandManager"),
		 Menus					= brackets.getModule("command/Menus"),
		 ExtensionUtils		= brackets.getModule("utils/ExtensionUtils"),
		 NodeDomain				= brackets.getModule("utils/NodeDomain"),
		
		 P_MANAGER				= require("modules/PreferencesManager"),
		 CF_MANAGER				= require("modules/ConfigurationManager"),
		 CS_MANAGER				= require("modules/ConnectionSettingManager"),
		 FL_MANAGER				= require("modules/FtpLogManager"),
		 SFTP_MANAGER			= require("modules/SftpManager"),
		 SFTP_SV_MANAGER		= require("modules/SftpServerManager"),
		 MF_MANAGER				= require("modules/ModifyLogManager"),
		 SF_MANAGER				= require("modules/SelectFileManager"),
		 LS_MANAGER				= require("modules/LocalSaveManager"),
		 RCF_MANAGER			= require("modules/RecentlyChangedFilesManager"),
		 STRINGS					= require("modules/Strings"),
		
		 packageJSON			= require("text!package.json"),
		 packageName			= JSON.parse(packageJSON).name,
		 menu						= Menus.getMenu(packageName),
		 contextMenu			= Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
		 editorContextMenu	= Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU),
		
		_domainPath				= ExtensionUtils.getModulePath(module, "node/SftpUploadDomain"),
		_nodeDomain				= new NodeDomain("auSimpleSftpUpload", _domainPath),
	
		_domainPath2			= ExtensionUtils.getModulePath(module, "node/LocalSaveDomein"),
		_nodeDomain2			= new NodeDomain("auLocalSaveDomein", _domainPath2);
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu() {
		
		var menuId1 = packageName + ".menu1",
			 menuId2 = packageName + ".menu2",
			 menuId3 = packageName + ".menu3",
			 menuId4 = packageName + ".menu4",
			 menuId5 = packageName + ".menu5",
			 menuId6 = packageName + ".menu6",
			 menuId7 = packageName + ".menu7",
			 menuId8 = packageName + ".menu8",
			 menuId9 = packageName + ".menu9",
			 menuId10 = packageName + ".menu10";
		
		if(!menu) {
			menu = Menus.addMenu(STRINGS.EXTENSION_NAME, packageName, Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);
		}
		
		// add Menu
		CF_MANAGER.addMenu(menu, menuId1);
		menu.addMenuDivider();
		CS_MANAGER.addMenu(menu, menuId2);
		menu.addMenuDivider();
		SFTP_SV_MANAGER.addMenu(menu, menuId6);
		menu.addMenuDivider();
		MF_MANAGER.addMenu(menu, menuId8);
		menu.addMenuDivider();
		RCF_MANAGER.addMenu(menu, menuId10);
		menu.addMenuDivider();
		FL_MANAGER.addMenu(menu, menuId3);
		
		// add Context Menu
		CommandManager.register(STRINGS.TXT_TEST_UPLOAD, menuId4, SFTP_MANAGER.uploadTestSite);
		CommandManager.register(STRINGS.TXT_PRODUCTION_UPLOAD, menuId5, function(){
			if( window.confirm(STRINGS.TXT_PRODUCTION_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
				SFTP_MANAGER.uploadProductionSite();
			}
		});
		CommandManager.register(STRINGS.TXT_ADD_MODIFY_LOG, menuId7, MF_MANAGER.setLog);
		CommandManager.register(STRINGS.TXT_SELECT_UPLOAD, menuId9, SF_MANAGER.openDialog);
		contextMenu.addMenuDivider();
		contextMenu.addMenuItem(menuId7, "");
		contextMenu.addMenuDivider();
		contextMenu.addMenuItem(menuId4, "");
		contextMenu.addMenuDivider();
		contextMenu.addMenuItem(menuId5, "");
		
		// add editorContextMenu Menu
		editorContextMenu.addMenuItem(menuId9, "", Menus.FIRST);
		editorContextMenu.addMenuItem(menuId4, "", Menus.AFTER, menuId9);
		editorContextMenu.addMenuItem(menuId5, "", Menus.AFTER, menuId4);
		editorContextMenu.addMenuDivider(Menus.BEFORE, menuId4);
		editorContextMenu.addMenuDivider(Menus.BEFORE, menuId5);
		editorContextMenu.addMenuDivider(Menus.AFTER, menuId5);
	}
	
	
	/* init ------------------------------------------------------------ */
	AppInit.appReady( function() {
		
		ExtensionUtils.loadStyleSheet(module, "modules/style.css");
		
		addMenu();
		
		SFTP_MANAGER.init(_nodeDomain);
		SFTP_SV_MANAGER.init(_nodeDomain);
		LS_MANAGER.init(_nodeDomain2);
		RCF_MANAGER.init(_nodeDomain2);
		
		if(!P_MANAGER.get("_storageLocation")) {
			CF_MANAGER.openDialog();
		}
		
	});
	
});