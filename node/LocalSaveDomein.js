(function(){
	
	var fs = require('fs');
	var path = require('path');
	var walk = require('walk');
	var _domainManager;
	
	function cmdSave(localPath, savePath){
		fs.readFile(localPath, null, function (err, text) {
			fs.writeFile(savePath, text);
		});
	}

	function cmdGetFilePath(tgFilePath,exclusion){
		var seting = {followLinks:false};
		if(exclusion) seting["filters"] = exclusion;
		var walker = walk.walk(tgFilePath, seting);

		walker.on("file", function(root, stats, next){
			var filePath = path.join(root, stats.name);
			var time = new Date(stats.mtime);
			var _time = time.getTime();
			filePath = filePath.replace(/\\|\\/g, '/');
			_domainManager.emitEvent("auLocalSaveDomein", "foundit", [filePath,_time]);
			next();
		});

		walker.on("end", function () {
			_domainManager.emitEvent("auLocalSaveDomein", "foundcomplete", [""]);
		});

	}
	
	function init(domainManager) {

		_domainManager = domainManager;
		
		if (!domainManager.hasDomain("auLocalSaveDomein")) {
			domainManager.registerDomain("auLocalSaveDomein", {major: 0, minor: 1});
		}
		
		domainManager.registerCommand("auLocalSaveDomein", "save", cmdSave, false, "");

		domainManager.registerCommand("auLocalSaveDomein", "getFilePath", cmdGetFilePath, false, "");

		domainManager.registerEvent("auLocalSaveDomein", "foundit", "" );
		domainManager.registerEvent("auLocalSaveDomein", "foundcomplete", "" );
		
	}

	exports.init = init;

}());