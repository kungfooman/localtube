
function sendimage() {
	canvas = document.createElement('canvas');
	//canvas.setAttribute('crossOrigin', 'anonymous')
	canvas.height = video.videoHeight;
	canvas.width = video.videoWidth;
	ctx = canvas.getContext('2d');
	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	

	canvas.toBlob(function(blob) {
		var reader = new FileReader("image/png");
		reader.addEventListener('loadend', (e) => {
			var blob64 = e.srcElement.result;
			//console.log("got blob");
			flashText("Snaphot... upload");
			
			mins = Math.floor(video.currentTime / 60)
			secs = Math.floor(video.currentTime - (mins * 60))
			msecs = Math.floor((video.currentTime - ((mins * 60) + secs)) * 1000)			
			
			// now save the base64 blob to server
			$.ajax({
			  type: "POST",
			  url: "saveimage.php",
			  data: { 
				 //imgBase64: canvas.toDataURL('image/png'),
				 imgBase64: blob64,
				 file: filename,
				 mins: mins,
				 secs: secs,
				 msecs: msecs
			  }
			}).done(function(o) {
				var msg = "Snapshot failed";
				if (o.status) {
					var kb = Math.round(o.filesize / 1024);
					msg = "Snapshot saved (" + kb + " kb)";					
				}
				flashText(msg);
				console.log('snapshot', o.filename);
				console.log(o);
				last_o = o;
			}).fail(function(e) { console.log("fail", e); });
		});
		reader.readAsDataURL(blob);	
	})
}

body = document.getElementsByTagName("body")[0]
html = document.getElementsByTagName("html")[0]
video = document.getElementById("thevideo");

video.play();

function allwidth() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20; }
function allheight() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 20; }

body.onresize = function() {
	video.width = allwidth();
	video.height = allheight();
	
	text.style.left = (video.width  / 10) + "px";
	text.style.top  = (video.height / 10) + "px";
}

function main() {
	text = document.getElementById("overlaytext");
	body.onresize();
}

body.onload = main;

lastClick = 0;
stopToggle = false;

function togglePlay() {
	if (stopToggle)
		return;
	if (video.paused) {
		//flashText("Play")
		video.play();
	} else {
		//flashText("Pause")
		video.pause();
	}
}

body.onclick = function(e) {
	setTimeout(togglePlay, 250);
	//console.log(Date.now() - lastClick);
	if (Date.now() - lastClick < 250) {
		toggleFullscreen()
		stopToggle = true;
	} else {
		stopToggle = false;
	}
	lastClick = Date.now();
}
function toggleFullscreen() {
	if (document.webkitIsFullScreen) {
		document.webkitExitFullscreen();
	} else {
		//video.webkitRequestFullscreen();
		body.webkitRequestFullscreen();
	}
}

enableFadeOut = true;

function flashText(content) {
	$(text).stop().animate({opacity:'100'});
	$(text).show();
	$(text).html(content);
	if (enableFadeOut)
		$(text).fadeOut(1000);
}

document.onkeydown = function(e) {
	e_ = e; // checking what kind of key in case of new shortcuts
	//console.log(e)
	
	handled = false;
	
	time = 5; // by default jump 5 seconds
	if (e.ctrlKey)
		time = 60; // jumps a minute
	if (e.shiftKey)
		time = 1.0 / 30.0; // kinda frame wise
	if (e.altKey)
		time = 1; // jump a second
		
	
	if (e.key == "ArrowRight") { video.currentTime +=  time; handled = true; flashText("+"+time+"s"); }
	if (e.key == "ArrowLeft" ) { video.currentTime -=  time; handled = true; flashText("-"+time+"s"); }
	
	var addVolume = 0.1;
	if (e.ctrlKey)
		addVolume = 0.50;
	if (e.altKey)
		addVolume = 0.01;
	if (e.key == "ArrowUp"   ) { video.volume = Math.min(video.volume + addVolume, 1.0); flashText("Vol "+(Math.round(video.volume*100))+"%"); video.muted=false; handled = true; }
	if (e.key == "ArrowDown" ) { video.volume = Math.max(video.volume - addVolume, 0.0); flashText("Vol "+(Math.round(video.volume*100))+"%"); video.muted=false; handled = true; }
	
	if (e.key == "f") {
		toggleFullscreen();
		handled = true;
	}
	
	if (e.key == "s") {
		flashText("Snapshot... convert video frame");
		setTimeout(sendimage, 0); // dont block the event handler, converting blob to image takes quite some time
		handled = true;
	}

	if (e.key == " ") {
		if (video.paused)
			video.play();
		else
			video.pause();
		handled = true;
	}
	
	if (e.key == "m") {
		if (video.volume == 0) {
			video.muted = false;
			video.volume = 0.1;
		} else {
			video.muted = !video.muted;
		}
		
		
		handled = true;
	}
	
	// boss key
	if (e.key == "b") {
		video.remove();
		handled = true;
	}
	
	if (handled) {
		e.preventDefault();
	}
	
	
}