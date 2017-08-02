define(function(require) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 CommandManager				= brackets.getModule("command/CommandManager"),
		 Dialogs							= brackets.getModule("widgets/Dialogs"),
		 FileSystem						= brackets.getModule("filesystem/FileSystem"),
		 ProjectManager				= brackets.getModule("project/ProjectManager"),
		 Mustache						= brackets.getModule("thirdparty/mustache/mustache"),
		
		 LS_MANAGER						= require("modules/LocalSaveManager"),
		 SFTP_MANAGER					= require("modules/SftpManager"),
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		 
		 dialog_recently_changed_files_tmp		= require("text!html/dialog_recently_changed_files.html"),
		 $dialog_recently_changed_files,
		
		 context							= {Strings: Strings, MyStrings: STRINGS},

		tgday,
		projectRoot,
		_nodeDomain2;
	
	
	/* getSelectedItem ------------------------------------------------------------ */
	function getSelectedItem() {
		
		var selectDom = $dialog_recently_changed_files.find(".check .p"),
			 selectItem = [];
		
		for(var i=0;i<selectDom.length;i++){
			selectItem.push(selectDom[i].innerText);
		}
		
		return selectItem;
	}

	
	/* listControl ------------------------------------------------------------ */
	function listControl() {
		
		$dialog_recently_changed_files.find("tr").on("click",function(){
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
		
		$dialog_recently_changed_files.find("tr").each(function(){
			var cls = "check";
			$(this).addClass(cls);
		});
		
	}


	/* clearAll ------------------------------------------------------------ */
	function clearAll() {

		var cls = "check";

		$dialog_recently_changed_files.find(".check").each(function(){
			$(this).removeClass(cls);
		});
		
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
	function saveLocal(savePath) {
		
		var selectItem;
		
		selectItem = getSelectedItem();
		
		for(var i = 0; i<selectItem.length; i++){
			var localPath = selectItem[i];
			LS_MANAGER.saveLocal(localPath, savePath);
		}
		
	}
	
	
	/* setTableSort ------------------------------------------------------------ */
	function setTableSort() {
		
		var $tg = $dialog_recently_changed_files.find("th");
		$tg.on("click", function(){
			var $tg = $(this),
				 tgCls = $tg.attr("class").replace("s-", ""),
				 type = $tg.attr("data-type"),
				 oder = $tg.attr("data-sortoder"),
				 $tgs = $dialog_recently_changed_files.find("tbody > tr");
			
			$tgs.sort(function(a,b){
				var oderIndex = ( $(a).find("."+tgCls).text() > $(b).find("."+tgCls).text() ) ? 1 : -1;
				return oderIndex * oder;
			});
			$dialog_recently_changed_files.find("th span").html("");
			var arrow = (oder == -1 ) ? "　▲" : "　▼";
			$tg.find("span").html(arrow);
			$tg.attr("data-sortoder", oder *= -1);
			$dialog_recently_changed_files.find("tbody").html($tgs);
			listControl();
		});
		
	}


	/* searchFile ------------------------------------------------------------ */
	function searchFile() {

		$dialog_recently_changed_files.find(".table-wrap tbody").html("");

		$dialog_recently_changed_files.find(".btn-search").hide();
		$dialog_recently_changed_files.find(".btn-searching").show();

		var targetPath = $dialog_recently_changed_files.find(".input-target").val();
		var exclusion = $dialog_recently_changed_files.find(".input-exclusion").val();
		tgday = $dialog_recently_changed_files.find(".input-day").val();
		

		if(tgday == ""){
			tgday = 0;
		}else if(tgday < 1){
			tgday = Math.ceil(86400000 * tgday);
		}else{
			tgday = tgday * 86400000;
		}
		tgday = new Date().getTime() - tgday;

		if(exclusion) exclusion = exclusion.split(",");

		_nodeDomain2.exec('getFilePath',projectRoot._path + targetPath, exclusion).done(function(){
		}).fail(function(err){
			console.log("err");
		});

	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog() {

		var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_recently_changed_files_tmp, context));
		$dialog_recently_changed_files = dl.getElement();

		$dialog_recently_changed_files.find(".btn-searching").hide();
		
		setTableSort();
		
		DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-dialog_recently_changed_files"), { dragZone: ".modal-wrapper .modal-header", resizer: true });
		
		$dialog_recently_changed_files.find(".btn-update").click(function (e) {
			clearAll();
		});

		$dialog_recently_changed_files.find(".btn-all-select").click(function (e) {
			selectAll();
		});

		$dialog_recently_changed_files.find(".btn-search").click(function (e) {
			searchFile();
		});

		$dialog_recently_changed_files.find(".dialog-button-upload").click(function (e) {
			if( window.confirm(STRINGS.TXT_PRODUCTION_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
				uploadList("production");
				dl.close();
			}
		});

		$dialog_recently_changed_files.find(".dialog-button-test-upload").click(function (e) {
			//if( window.confirm(STRINGS.TXT_TESTING_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
				uploadList("test");
				dl.close();
			//}
		});

		$dialog_recently_changed_files.find(".dialog-button-local-save").click(function (e) {
			FileSystem.showOpenDialog(false, true, STRINGS.TXT_SAVE_LOCAL_PATH, null, null, function(str, paths) {
				saveLocal(paths);
			});
		});

		
	}


	/* addMenu ------------------------------------------------------------ */
	function addMenu(menu, mid){
		
		CommandManager.register(STRINGS.TXT_RECRNT_CHANGE_FILE_SEARCH, mid, openDialog);
		menu.addMenuItem(mid);
		
	}

	
	/* projectOpen ------------------------------------------------------------ */
	ProjectManager.on("projectOpen", function() {
		
		projectRoot = ProjectManager.getProjectRoot();
		
	});


	/* init ------------------------------------------------------------ */
	function init(nodeDomain){
		
		_nodeDomain2 = nodeDomain;

		_nodeDomain2.on('foundit', function(obj, file, date){
			
			if(date >= tgday){
				var _date = new Date(date);
				var ndate = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes();

				file = file.replace(projectRoot._path, '');
				var listHtml = '<tr><td class="p">' + file + '</td><td class="d">' + ndate + '</td></tr>';
				$dialog_recently_changed_files.find(".table-wrap tbody").append(listHtml);
			}
		});
		_nodeDomain2.on('foundcomplete', function(obj, txt){
			//console.log("complete");
			$dialog_recently_changed_files.find(".btn-search").show();
			$dialog_recently_changed_files.find(".btn-searching").hide();
			listControl();
		});
		
	}


	/* return ------------------------------------------------------------ */
	return {
		init: init,
		addMenu: addMenu,
		openDialog: openDialog
	};
	
});