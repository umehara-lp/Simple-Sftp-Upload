(function(){
	
	var fs = require('fs');
	
	
	function cmdSave(localPath, savePath){
		fs.readFile(localPath, null, function (err, text) {
			fs.writeFile(savePath, text);
		});
	}
	
	function init(domainManager) {
		
		if (!domainManager.hasDomain("auLocalSaveDomein")) {
			domainManager.registerDomain("auLocalSaveDomein", {major: 0, minor: 1});
		}
		
		domainManager.registerCommand("auLocalSaveDomein", "save", cmdSave, false, "");
		
	}

	exports.init = init;

}());