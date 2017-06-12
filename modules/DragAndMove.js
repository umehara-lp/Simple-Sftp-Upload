define(function(require) {
	"use strict";


	function drag_and_move(dropZone, obj) {
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
		}

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
				dropZoneX,
				dropZoneY,
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
				}
			});
		}


		dragZone.addEventListener("mousedown", function(e) {
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
			}
		});
	}

	return {
		drag_and_move: drag_and_move
	};

});
