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
		 GSP_MANAGER					= require("modules/GetSelectPath"),
		 STRINGS							= require("modules/Strings"),
		 DRAG_AND_MOVE					= require("modules/DragAndMove"),
		 
		 dialog_select_file_tmp		= require("text!html/dialog_select_file.html"),
		 $dialog_select_file,
		
		 context							= {Strings: Strings, MyStrings: STRINGS};
	
	
	/* getSelectedItem ------------------------------------------------------------ */
	function getSelectedItem() {
		
		var selectDom = $dialog_select_file.find(".check .p"),
			 selectItem = [];
		
		for(var i=0;i<selectDom.length;i++){
			selectItem.push(selectDom[i].innerText);
		}
		
		return selectItem;
	}

	
	/* listControl ------------------------------------------------------------ */
	function listControl() {
		
		$dialog_select_file.find("tr").on("click",function(){
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
		
		$dialog_select_file.find("tr").each(function(){
			var cls = "check";
			$(this).addClass(cls);
		});
		
	}
	
	
	/* optimisation ------------------------------------------------------------ */
	function optimisation(files) {
		
		var mlog = {}, listHtml;
		
		listHtml = '';
		
		for(var i=0;i<files.length;i++){
			if(!(files[i] in mlog)) mlog[files[i]] = [];
			mlog[files[i]].push(files[i]);
		}
		for(var key in mlog){
			for(var i=0;i<mlog[key].length;i++){
				if(i == 0){
					listHtml += '<tr><td class="p">' + mlog[key][i] + '</td></tr>';
				}else{
					
				}
			}
		}
		$dialog_select_file.find(".table-wrap tbody").html(listHtml);
		listControl();
		$dialog_select_file.find("th.s-d").trigger("click");
	}
	
	
	/* loadSelectFile ------------------------------------------------------------ */
	function loadSelectFile() {
		
		var files = GSP_MANAGER.uploadInSelections();
		optimisation(files);
		
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
		
		var $tg = $dialog_select_file.find("th");
		$tg.on("click", function(){
			var $tg = $(this),
				 tgCls = $tg.attr("class").replace("s-", ""),
				 type = $tg.attr("data-type"),
				 oder = $tg.attr("data-sortoder"),
				 $tgs = $dialog_select_file.find("tbody > tr");
			
			$tgs.sort(function(a,b){
				var oderIndex = ( $(a).find("."+tgCls).text() > $(b).find("."+tgCls).text() ) ? 1 : -1;
				return oderIndex * oder;
			});
			$dialog_select_file.find("th span").html("");
			var arrow = (oder == -1 ) ? "　▲" : "　▼";
			$tg.find("span").html(arrow);
			$tg.attr("data-sortoder", oder *= -1);
			$dialog_select_file.find("tbody").html($tgs);
			listControl();
		});
		
	}
	
	
	/* openDialog ------------------------------------------------------------ */
	function openDialog() {
		
		var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialog_select_file_tmp, context));
		$dialog_select_file = dl.getElement();
		
		setTableSort();
		
		DRAG_AND_MOVE.drag_and_move(document.querySelector("#au-ssftp-dialog_select_file"), { dragZone: ".modal-wrapper .modal-header", resizer: true });
		
		var projectRoot = ProjectManager.getProjectRoot();
		
		$dialog_select_file.find(".btn-update").click(function (e) {
			loadSelectFile();
		});

		$dialog_select_file.find(".btn-all-select").click(function (e) {
			selectAll();
		});

		$dialog_select_file.find(".dialog-button-upload").click(function (e) {
			if( window.confirm(STRINGS.TXT_PRODUCTION_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
				uploadList("production");
				dl.close();
			}
		});

		$dialog_select_file.find(".dialog-button-test-upload").click(function (e) {
			//if( window.confirm(STRINGS.TXT_TESTING_ENVIRONMENT + " " + STRINGS.TXT_IS_IT_REALLY_GOOD)){
				uploadList("test");
				dl.close();
			//}
		});

		$dialog_select_file.find(".dialog-button-local-save").click(function (e) {
			FileSystem.showOpenDialog(false, true, STRINGS.TXT_SAVE_LOCAL_PATH, null, null, function(str, paths) {
				saveLocal(paths);
			});
		});

		loadSelectFile();
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		openDialog: openDialog
	};
	
});