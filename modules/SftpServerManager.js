define(function(require, exports, module) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 Dialogs							= brackets.getModule("widgets/Dialogs"),
		 Mustache						= brackets.getModule("thirdparty/mustache/mustache"),
		
		 CS_MANAGER						= require("modules/ConnectionSettingManager"),
		 SFTP_MANAGER					= require("modules/SftpManager"),
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		
		 dialog_server_manager_tmp	= require("text!html/dialog_server_manager.html"),
		 $dialog_server_manager,
		 
		 context							= {Strings: Strings, MyStrings: STRINGS},
		 
		 folderId						= 1,
		 
		 _nodeDomain;
	
	
	/* getList ------------------------------------------------------------ */
	function getList(accessPoint,folder,tg) {
		
		var serverConnectionSetting = {};
		
		CS_MANAGER.getConnectionSetting(function(connectionSetting){
			
			if(accessPoint == "test"){
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
			
			if(connectionSetting.method == "ftp"){
				_nodeDomain.exec("getLs", serverConnectionSetting.serverPath+folder, serverConnectionSetting, tg, folder).done(function(){
					
				}).fail(function (err) {
					console.error(err);
				});
			}
			
		});
		
	}
	
	
	/* getChTsDate ------------------------------------------------------------ */
	function getChTsDate(ts){
		var _d = new Date(ts),
			 d = _d.getFullYear() + "/" + ( _d.getMonth() + 1 ) + "/" + _d.getDate() + " " + _d.getHours() + ":" + _d.getMinutes();
		return d;
	}
	
	
	/* getKByte ------------------------------------------------------------ */
	function getKByte(bt){
		return ( Math.floor(( bt * 0.001 ) * 10) / 10 ) + " kb";
	}
	
	
	/* setUploadEvent ------------------------------------------------------------ */
	function setUploadEvent(){
		
		_nodeDomain.on('getLs', function(obj, res, tg, folder){
			
			var list = '<ul class="jstree-brackets jstree-no-dots jstree-no-icons" style="margin-left:10px;">';
			
			for (var i = 0; i < res.length; i++) {
				if(res[i]["type"] == 1){
					list += '<li class="jstree-closed jstree-folder" style="padding-left:10px" id="fid_' + folderId + '" data-folder="'+ folder + res[i]["name"] + '/">';
					list += '<ins class="jstree-icon"></ins>';
					list += '<a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"> </ins><span>' + res[i]["name"] + '</span><span class="delete">delete</span><span class="date">' + getChTsDate(res[i]["time"]) + '</span><span class="size">&nbsp;</span></a>';
					list += '</li>';
				}else if(res[i]["type"] == 0){
					var fname = res[i]["name"].split(/\.(?=[^.]+$)/);
					list += '<li class="jstree-leaf" data-folder="'+ folder + res[i]["name"] + '">';
					list += '<ins class="jstree-icon"></ins>';
					list += '<a href="#" class=""><div style="display:inline-block;"></div><ins class="jstree-icon"></ins><span>' + fname[0] + '</span><span class="extension">' + fname[1] + '</span><span class="delete">delete</span><span class="date">' + getChTsDate(res[i]["time"]) + '</span><span class="size">' + getKByte(res[i]["size"]) + '</span><span class="download">download</span></a>';
					list += '</li>';
				}
				folderId++;
			}
			list += '</ul>';
			$(tg).append(list);
			
			setFolder($(tg));
			
			function setFolder($tgs){
				$tgs.find(".jstree-folder a, .jstree-folder ins").each(function(){
					$(this).click(function(){
						if ( $(this).parent().hasClass("jstree-closed") ){
							$(this).parent().removeClass("jstree-closed");
							$(this).parent().addClass("jstree-open");
							getList($(this).closest(".tab-pane").attr("data-location"), $(this).parent().attr("data-folder"), "#"+$(this).parent().attr("id"));
							setFolder($(this).parent());
						}else{
							$(this).parent().removeClass("jstree-open");
							$(this).parent().addClass("jstree-closed");
							$(this).parent().find("ul").remove();
						}
					});
				});
				$tgs.find(".download").each(function(){
					$(this).unbind("click");
					$(this).click(function(){
						SFTP_MANAGER.downloadFile($(this).parent().parent().attr("data-folder"),$(this).closest(".tab-pane").attr("data-location"));
						$(this).addClass("comp");
						return false;
					});
				});
			}
			
		});
		
	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog(){
		
		
		var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_server_manager_tmp, context));
		$dialog_server_manager = dl.getElement();
		
		$dialog_server_manager.find(".nav-tabs a").click(function (e) {
			e.preventDefault();
			$(this).tab('show');
		});
		
		$dialog_server_manager.find("#tab1 .btn-conection").click(function (e) {
			$("#au-ssftp-server_manager_dialog #tab1 .jstree").find("ul").remove();
			getList("test", "", "#au-ssftp-server_manager_dialog #tab1 .jstree-brackets-wrap");
		});
		
		$dialog_server_manager.find("#tab2 .btn-conection").click(function (e) {
			$("#au-ssftp-server_manager_dialog #tab2 .jstree").find("ul").remove();
			getList("production", "", "#au-ssftp-server_manager_dialog #tab2 .jstree-brackets-wrap");
		});
		
		
		DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-server_manager_dialog"), { dragZone: ".modal-wrapper .modal-header", resizer: true });
		
	}
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		CommandManager.register(STRINGS.TXT_REMOTE_SITE_VIEW, mid, openDialog);
		menu.addMenuItem(mid);
		
	}
	
	
	/* init ------------------------------------------------------------ */
	function init(nodeDomain){
		
		_nodeDomain = nodeDomain;
		
		setUploadEvent();
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		init: init,
		addMenu: addMenu
	};
	
});