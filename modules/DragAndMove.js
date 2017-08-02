define(function(require) {
	"use strict";
	var P_MANAGER						= require("modules/PreferencesManager");


	function drag_and_move(dropZone, obj) {
		var prefid = dropZone.id;
		if(P_MANAGER.get("au.drag_and_move"+"_"+prefid+".x")){dropZone.style.left = P_MANAGER.get("au.drag_and_move"+"_"+prefid+".x");}
		if(P_MANAGER.get("au.drag_and_move"+"_"+prefid+".y")){dropZone.style.top = P_MANAGER.get("au.drag_and_move"+"_"+prefid+".y");}
		if(P_MANAGER.get("au.drag_and_move"+"_"+prefid+".w")){dropZone.style.width = P_MANAGER.get("au.drag_and_move"+"_"+prefid+".w");}
		if(P_MANAGER.get("au.drag_and_move"+"_"+prefid+".h")){dropZone.style.height = P_MANAGER.get("au.drag_and_move"+"_"+prefid+".h");}

		var x,
			y,
			dropZoneStyle,
			dropZoneX,
			dropZoneY,
			dragZone = dropZone,
			dragMode = false;

		if (obj && obj.dragZone) {
			dragZone = document.querySelector(obj.dragZone);
			dragZone.style.cursor = "move";
			dropZone.style.minHeight = dragZone.clientHeight + "px";
			if(dropZone.querySelector(".modal-footer")){
				dropZone.style.minHeight = dragZone.clientHeight + dropZone.querySelector(".modal-footer").clientHeight + 50 + "px";
			}
		}

		set_height(dropZone);


		dropZone.style.setProperty('overflow', 'hidden', 'important');

		if (obj && obj.resizer === true) {
			var resizer = document.createElement("div");
			resizer.style.width = 0;
			resizer.style.height = 0;
			resizer.style.cursor = "se-resize";
			resizer.style.position = "absolute";
			resizer.style.right = 0;
			resizer.style.bottom = 0;
			resizer.style.zIndex = 5;
			resizer.style.borderStyle = "solid";
			resizer.style.borderWidth = "15px";
			resizer.style.borderColor = "transparent #000 #000 transparent";
			resizer.style.opacity = 0.6;
			resizer.style.boxSizing = "border-box";


			dropZone.appendChild(resizer);
			var dropZoneW,
				dropZoneH,
				resizeMode = false;

			resizer.addEventListener("mousedown", function(e) {
				e.stopPropagation();
				resizeMode = true;
				x = e.clientX;
				y = e.clientY;

				dropZoneStyle = window.getComputedStyle(dropZone);
				dropZoneW = parseFloat(dropZoneStyle.width);
				dropZoneH = parseFloat(dropZoneStyle.height);
				dropZoneX = parseFloat(dropZoneStyle.left);
				dropZoneY = parseFloat(dropZoneStyle.top);
			});

			document.body.addEventListener("mouseup", function() {
				resizeMode = false;
			});

			document.body.addEventListener("mousemove", function(e) {
				if (resizeMode) {
					var plusX = e.clientX - x;
					var plusY = e.clientY - y;
					dropZone.style.width = dropZoneW + plusX + "px";
					dropZone.style.height = dropZoneH + plusY + "px";
					dropZone.style.left = dropZoneX + plusX / 2 + "px";
					dropZone.style.top = dropZoneY + plusY / 2 + "px";
					P_MANAGER.set("au.drag_and_move"+"_"+prefid+".w", dropZoneW + plusX + "px");
					P_MANAGER.set("au.drag_and_move"+"_"+prefid+".h", dropZoneH + plusY + "px");
					P_MANAGER.set("au.drag_and_move"+"_"+prefid+".x", dropZoneX + plusX / 2 + "px");
					P_MANAGER.set("au.drag_and_move"+"_"+prefid+".y", dropZoneY + plusY / 2 + "px");
					set_height(dropZone);
				}
			});
		}


		dragZone.addEventListener("mousedown", function(e) {
			if(/^(button|input)$/i.test(e.target.tagName)){
				return;
			}
			dragMode = true;
			x = e.clientX;
			y = e.clientY;

			dropZoneStyle = window.getComputedStyle(dropZone);
			if (dropZoneStyle.left === "auto") {
				dropZone.style.left = 0;
			}
			if (dropZoneStyle.top === "auto") {
				dropZone.style.top = 0;
			}
			dropZoneX = parseFloat(dropZoneStyle.left);
			dropZoneY = parseFloat(dropZoneStyle.top);
		});

		document.body.addEventListener("mouseup", function() {
			dragMode = false;
		});

		document.body.addEventListener("mousemove", function(e) {
			if (dragMode) {
				var plusX = e.clientX - x;
				var plusY = e.clientY - y;
				dropZone.style.left = dropZoneX + plusX + "px";
				dropZone.style.top = dropZoneY + plusY + "px";
				P_MANAGER.set("au.drag_and_move"+"_"+prefid+".x", dropZoneX + plusX + "px");
				P_MANAGER.set("au.drag_and_move"+"_"+prefid+".y", dropZoneY + plusY + "px");
			}
		});
	}

	function set_height(dropZone){
		var hiku_height = 0;
		if(dropZone.querySelector(".modal-header")){
			hiku_height += dropZone.querySelector(".modal-header").clientHeight;
		}

		if(dropZone.querySelector(".modal-footer")){
			hiku_height += dropZone.querySelector(".modal-footer").clientHeight;
		}

		dropZone.querySelector(".modal-body").style.boxSizing = "border-box";
		dropZone.querySelector(".modal-body").style.maxHeight = "none";
		dropZone.querySelector(".modal-body").style.height = "calc(100% - " + hiku_height + "px)";
	}

	return {
		drag_and_move: drag_and_move
	};

});
