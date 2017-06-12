define( function( require ) {
	"use strict";
	
	var
		PreferencesManager	= brackets.getModule("preferences/PreferencesManager"),
		
		packageJSON				= require("text!package.json"),
		packageName				= JSON.parse(packageJSON).name,
		prefs						= PreferencesManager.getExtensionPrefs(packageName),
		prefsName				= "setting";
	
	
	function set( key, val ) {
		var setting = (prefs.get(prefsName) || {});
		setting[key] = val;
		prefs.set(prefsName, setting );
	}
	
	function get( key ) {
		var setting = (prefs.get(prefsName) || {});
		return setting[key];
	}
	
	return {
		set: set,
		get: get
	};
	
});