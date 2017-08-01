define(function() {
	"use strict";
	var EditorManager = brackets.getModule("editor/EditorManager");
	var ProjectManager = brackets.getModule("project/ProjectManager");
	var projectRoot;
	var currentDirPath;
	var dirArr;

	function uploadInSelections() {
		projectRoot = ProjectManager.getProjectRoot()._path;//プロジェクトルート
		currentDirPath = ProjectManager.getSelectedItem()._parentPath;//現在のディレクトリ
		var projectRootRegExp = new RegExp("^" + projectRoot);
		if (!projectRootRegExp.test(currentDirPath)) {return false;}//このプロジェクトのファイルじゃない
		var dir = currentDirPath.replace(projectRoot, "");
		//現在のディレクトリからプロジェクトルートを消すことで、プロジェクト内のディレクトリ部分を取得。../が過剰にあっても戻り過ぎないように。
		dirArr = dir.slice(0,-1).split("/");
		//プロジェクト内のディレクトリ部分をスラッシュ区切りで分割してディレクトリの配列を作る。
		var editor = EditorManager.getCurrentFullEditor(),
			selectTxt = editor.getSelectedText(true);

		var urlArr = [];
		selectTxt.replace(/(src=("|')(.*?)("|'))|(url\(("|'|)(.*?)("|'|)\))/g, function(matched,  src, srcQ1, srcPath, srcQ2, url, urlQ1, urlPath){
			//文字列の中からsrcかurlの中身を取ってきて、絶対パスに変換する。
			var changedPath = changeToAbsPath(srcPath || urlPath);
			if(changedPath){//falseじゃなければ
				if(changedPath.slice(0, 1) == "/")  changedPath = changedPath.substr(1);
				//スラッシュ取って
				urlArr.push(changedPath);
				//配列に追加。
			}
		});
		if (urlArr.length === 0) {return false;}//ない場合
		return urlArr;
	}
	function changeToAbsPath(path) {
		if(/(^\/\/)|(^http(s|):\/\/)/.test(path)){ return false; }//httpとかなら無視
		if (path[0] === "/") { return path.slice(1); }//スラッシュ始まりならスラッシュ取って返す。
		//ここから下は相対
		var ifChokkaPath = path;
		while (/(^\.{1,2}\/)/.test(ifChokkaPath)) {
			ifChokkaPath = ifChokkaPath.replace(/(^\.{1,2}\/)/g, "");
		}// ifChokkaPath = 「もし直下にある場合のパス」。 ./と../は消す。
		var dotdotSlashArr = path.match(/\.\.\//g) || [];// ../を全部配列に格納。
		var MyDirArr = dirArr.concat(); // 元の配列を壊さないようにコピー。
		dotdotSlashArr.forEach(function() { // ../の数だけ繰り返し。
			MyDirArr.pop();//戻る数だけ末尾からパスを消す
		});
		var slash = (MyDirArr.length === 0)? "" : "/";//ディレクトリたちが無ければスラッシュは付けない（被るので）
		return MyDirArr.join("/") + slash + ifChokkaPath;
		// ディレクトリたちをスラッシュ区切りで結合してくっ付けて、スラッシュ付けてifChokkaPathつける。
	}
	return {
		uploadInSelections: uploadInSelections
	};

});