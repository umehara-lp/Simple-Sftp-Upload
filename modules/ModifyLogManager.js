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
		 LS_MANAGER						= require("modules/LocalSaveManager"),
		 SFTP_MANAGER,
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		 
		 dialog_modify_log_tmp		= require("text!html/dialog_modify_log.html"),
		 $dialog_modify_log,
		
		 context							= {Strings: Strings, MyStrings: STRINGS},
		 
		 queue							= [],
		 isRunning						= false;
	
	/* getNdate ------------------------------------------------------------ */
	function getNdate() {
		
		var ndate = 'YYYY-MM-DD hh:mm:ss',
		date = new Date();
		ndate = ndate.replace(/YYYY/g, date.getFullYear());
		ndate = ndate.replace(/MM/g, date.getMonth()+1);
		ndate = ndate.replace(/DD/g, date.getDate());
		ndate = ndate.replace(/hh/g, date.getHours());
		ndate = ndate.replace(/mm/g, date.getMinutes());
		ndate = ndate.replace(/ss/g, date.getSeconds());
		
		return ndate;
		
	}
	
	
	/* saveModifyLog ------------------------------------------------------------ */
	function saveModifyLog(path) {
		
		var date = getNdate(),
			 userName = P_MANAGER.get("_userName");
			
		queue.push({ date:date, user:userName, path:path });
		
	}
	
	
	/* setLog ------------------------------------------------------------ */
	function setLog() {
		
		var item = ProjectManager.getSelectedItem(),
			 projectUrl = ProjectManager.getProjectRoot().fullPath,
			 path = item.fullPath.replace(projectUrl, '');
		
		saveModifyLog(path);
		saveLog();
		
	}
	
	
	/* saveLog ------------------------------------------------------------ */
	function saveLog(clear) {
		
		isRunning = true;
		var nowQueue = queue.concat();
		queue = [];
		
		var projectRoot = ProjectManager.getProjectRoot(),
			 folderPath = P_MANAGER.get("_storageLocation") + "mdify_log",
			 filePath = P_MANAGER.get(projectRoot._path).replace(".prf", ".mfg"),
			 fileEntry = FileSystem.getFileForPath( folderPath + "/" + filePath ),
			 fileContent,
			 log = "";
		
		FileSystem.getDirectoryForPath( folderPath ).create();
		
		fileEntry.exists( function( err, exists ) {
			if ( exists ) {
				fileContent = FileUtils.readAsText( fileEntry );
				fileContent.done( function( content ) {
					try {
						if(clear){
							FileUtils.writeText( fileEntry, "[]", true ).done( function() {} );
							loadLog();
						}else{
							log = JSON.parse( content );
							for(var i=0; i<nowQueue.length; i++) {
								log.push(nowQueue[i]);
							}
							FileUtils.writeText( fileEntry, JSON.stringify( log, null, '\t' ), true ).done( function() {} );
						}
					} catch( e ) {}
				} ).always( function() {} );
			} else {
				var newlogs = nowQueue;
				FileUtils.writeText( fileEntry, JSON.stringify( newlogs, null, '\t' ), true ).done( function() {} );
			}
		} );
		
		if(queue.length > 0){
			saveLog();
		} else {
			isRunning = false;
		}
		
	}
	
	
	/* getSelectedItem ------------------------------------------------------------ */
	function getSelectedItem() {
		
		var selectDom = $dialog_modify_log.find(".check .p"),
			 selectItem = [];
		
		for(var i=0;i<selectDom.length;i++){
			selectItem.push(selectDom[i].innerText);
		}
		
		return selectItem;
	}
	
	
	/* clearSelect ------------------------------------------------------------ */
	function clearSelect() {
		
		var selectItem = getSelectedItem();
		
		var projectRoot = ProjectManager.getProjectRoot(),
			 folderPath = P_MANAGER.get("_storageLocation") + "mdify_log",
			 filePath = P_MANAGER.get(projectRoot._path).replace(".prf", ".mfg"),
			 fileEntry = FileSystem.getFileForPath( folderPath + "/" + filePath ),
			 fileContent,
			 log = "";
		
		fileEntry.exists( function( err, exists ) {
			if ( exists ) {
				fileContent = FileUtils.readAsText( fileEntry );
				fileContent.done( function( content ) {
					try {
						log = JSON.parse( content );
						for(var i=0;i<log.length;i++){
							if($.inArray(log[i].path, selectItem) !==-1 ){
								log.splice(i,1);
								i--;
							}
						}
						FileUtils.writeText( fileEntry, JSON.stringify( log, null, '\t' ), true ).done( function() {} );
						loadLog();
					} catch( e ) {}
				} ).always( function() {} );
			} else {}
		} );
	}
	
	
	/* listControl ------------------------------------------------------------ */
	function listControl() {
		
		$dialog_modify_log.find("tr").on("click",function(){
			var $this = $(this), cls = "check";
			if($this.hasClass(cls)){
				$this.removeClass(cls);
			}else{
				$this.addClass(cls);
			}
		});
		
	}
	
	
	/* selectAll ------------------------------------------------------------ */
	function selectAll() {
		
		$dialog_modify_log.find("tr").each(function(){
			var cls = "check";
			$(this).addClass(cls);
		});
		
	}
	
	
	/* optimisation ------------------------------------------------------------ */
	function optimisation(contentJson) {
		
		var mlog = {}, listHtml;
		
		listHtml = '';
		
		Array.prototype.getLastVal = function (){ return this[this.length -1];}
		
		for(var i=0;i<contentJson.length;i++){
			if(!(contentJson[i]["path"] in mlog)) mlog[contentJson[i]["path"]] = [];
			mlog[contentJson[i]["path"]].push(contentJson[i]);
		}
		console.log(mlog);
		for(var key in mlog){
			/*mlog[key].sort(function(a,b){
				if(a.date > b.date) return -1;
				if(a.date < b.date) return 1;
				return 0;
			});*/
			for(var i=0;i<mlog[key].length;i++){
				if(i == 0){
					var lastDate = mlog[key].getLastVal();
					listHtml += '<tr><td class="p">' + lastDate["path"] + '</td><td class="d">' + lastDate["date"] + '</td><td class="u">' + lastDate["user"] + '</td></tr>';
				}else{
					
				}
			}
		}
		$dialog_modify_log.find(".table-wrap tbody").html(listHtml);
		listControl();
		$dialog_modify_log.find("th.s-d").trigger("click");
	}
	
	
	/* loadLog ------------------------------------------------------------ */
	function loadLog() {
		
		var projectRoot = ProjectManager.getProjectRoot(),
			 folderPath = P_MANAGER.get("_storageLocation") + "mdify_log",
			 filePath,
			 fileEntry,
			 fileContent;
		
		if( !P_MANAGER.get(projectRoot._path) ) return false;
		
		filePath = P_MANAGER.get(projectRoot._path).replace(".prf", ".mfg");
		fileEntry = FileSystem.getFileForPath( folderPath + "/" + filePath );
		
		fileEntry.exists( function( err, exists ) {
			if ( exists ) {
				fileContent = FileUtils.readAsText( fileEntry );
				fileContent.done( function( content ) {
					try {
						optimisation(JSON.parse( content ));
					} catch( e ) {}
				} ).always( function() {} );
			} else {
				
			}
		} );
		
	}
	
	
	/* uploadList ------------------------------------------------------------ */
	function uploadList(accessPoint) {
		
		var selectItem = getSelectedItem(),
			 projectUrl = ProjectManager.getProjectRoot().fullPath;
		
		for(var i = 0; i<selectItem.length; i++){
			var item = projectUrl + selectItem[i],
				 remotePath = selectItem[i];
			if( accessPoint == "test" ) SFTP_MANAGER.uploadTestSite(item, remotePath);
			if( accessPoint == "production" ) SFTP_MANAGER.uploadProductionSite(item, remotePath);
		}
		
	}
	
	
	/* saveLocal ------------------------------------------------------------ */
	function saveLocal(items, savePath) {
		
		var selectItem;
		
		if(items){
			selectItem = items;
		}else{
			selectItem = getSelectedItem();
		}
		
		for(var i = 0; i<selectItem.length; i++){
			var localPath = selectItem[i];
			LS_MANAGER.saveLocal(localPath, savePath);
		}
		
	}
	
	
	/* setTableSort ------------------------------------------------------------ */
	function setTableSort() {
		
		var $tg = $dialog_modify_log.find("th");
		$tg.on("click", function(){
			var $tg = $(this),
				 tgCls = $tg.attr("class").replace("s-", ""),
				 type = $tg.attr("data-type"),
				 oder = $tg.attr("data-sortoder"),
				 $tgs = $dialog_modify_log.find("tbody > tr");
			
			$tgs.sort(function(a,b){
				var oderIndex = ( $(a).find("."+tgCls).text() > $(b).find("."+tgCls).text() ) ? 1 : -1;
				return oderIndex * oder;
			});
			$dialog_modify_log.find("th span").html("");
			var arrow = (oder == -1 ) ? "　▲" : "　▼";
			$tg.find("span").html(arrow);
			$tg.attr("data-sortoder", oder *= -1);
			$dialog_modify_log.find("tbody").html($tgs);
			listControl();
		});
		
	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog() {
		
		var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_modify_log_tmp, context));
		$dialog_modify_log = dl.getElement();
		
		setTableSort();
		
		DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-dialog_modify_log"), { dragZone: ".modal-wrapper .modal-header", resizer: true });
		
		var projectRoot = ProjectManager.getProjectRoot();
		
		if( P_MANAGER.get(projectRoot._path) ){
			
			$dialog_modify_log.find(".btn-update").click(function (e) {
				loadLog();
			});
			
			$dialog_modify_log.find(".btn-all-select").click(function (e) {
				selectAll();
			});
			
			$dialog_modify_log.find(".btn-clear-all").click(function (e) {
				if( window.confirm(STRINGS.TXT_IS_IT_REALLY_GOOD)){
					saveLog(true);
				}
			});
			
			$dialog_modify_log.find(".btn-clear").click(function (e) {
				if( window.confirm(STRINGS.TXT_IS_IT_REALLY_GOOD)){
					clearSelect();
				}
			});
			
			$dialog_modify_log.find(".dialog-button-upload").click(function (e) {
				if( window.confirm(STRINGS.TXT_PRODUCTION_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
					uploadList("production");
				}
			});
			
			$dialog_modify_log.find(".dialog-button-test-upload").click(function (e) {
				if( window.confirm(STRINGS.TXT_TESTING_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
					uploadList("test");
				}
			});
			
			$dialog_modify_log.find(".dialog-button-local-save").click(function (e) {
				FileSystem.showOpenDialog(false, true, STRINGS.TXT_SAVE_LOCAL_PATH, null, null, function(str, paths) {
					saveLocal(false,paths);
				});
			});
			
			loadLog();
		} else{
			$dialog_modify_log.find(".dialog-button-upload").hide();
			$dialog_modify_log.find(".dialog-button-test-upload").hide();
			$dialog_modify_log.find(".modal-body").html("<p>" + STRINGS.TXT_ERROR_MF + "</p>");
		}
		
	}
	
	
	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		SFTP_MANAGER					= require("modules/SftpManager");
		
		CommandManager.register(STRINGS.TXT_MODIFY_LOG, mid, openDialog);
		menu.addMenuItem(mid);
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		addMenu: addMenu,
		saveModifyLog: saveModifyLog,
		setLog: setLog,
		saveLog: saveLog
	};
	
});