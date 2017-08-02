define(function(require) {
	"use strict";
	
	var Strings							= brackets.getModule("strings"),
		 FileSystem						= brackets.getModule("filesystem/FileSystem"),
		 FileUtils						= brackets.getModule("file/FileUtils"),
		 ProjectManager				= brackets.getModule("project/ProjectManager"),
		
		 STRINGS							= require("modules/Strings"),
		
		 context							= {Strings: Strings, MyStrings: STRINGS},
		 
		 _nodeDomain2;
	
	
	/* saveLocal ------------------------------------------------------------ */
	function saveLocal (localPath, savePath){
		
		var isFile = ( localPath.slice(-1) == '/' ) ? false : true,
			 projectUrl = ProjectManager.getProjectRoot().fullPath,
			 dir = localPath.split("/"),
			 dirpath = "";
		
		if(!isFile){
			FileSystem.getDirectoryForPath(projectUrl + localPath).getContents(function(txt,entry){
				for(var i=0; i<entry.length; i++){
					var _localPath = entry[i]._path.replace(projectUrl, '');
					saveLocal (_localPath, savePath);
				}
			});
		}
		
		for(var i = 0; i < dir.length -1; i++){
			dirpath += "/" + dir[i];
			FileSystem.getDirectoryForPath(savePath + dirpath).create(function(){
				
				if(isFile){
					var fileEntry = projectUrl + localPath,
						 saveEntry = savePath + "/" + localPath;
					_nodeDomain2.exec('save',fileEntry, saveEntry).done(function(){
					
					}).fail(function(err){
						console.log("err");
					});
					
				}
				
			});
		}
		
		if(dir.length == 1){
			var fileEntry = projectUrl + localPath,
				 saveEntry = savePath + "/" + localPath;
			_nodeDomain2.exec('save',fileEntry, saveEntry).done(function(){
				
			}).fail(function(err){
				console.log("err");
			});
		}

	}
	
	
	/* init ------------------------------------------------------------ */
	function init(nodeDomain){
		
		_nodeDomain2 = nodeDomain;
		
	}
	
	
	/* return ------------------------------------------------------------ */
	return {
		init: init,
		saveLocal: saveLocal
	};
	
});