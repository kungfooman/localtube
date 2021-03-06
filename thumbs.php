<?php
	
	

	include_once("lib.php");
	
	$errors = 0;
	$generated = 0;
	$existed = 0;
	
	function createThumbnail($imagefile) {
		global $errors;
		global $generated;
		global $existed;
		
		
		$thumbnaleFilename = dirname($imagefile) . "/thumbs/" . basename($imagefile);
		
		
		if (file_exists($thumbnaleFilename)) {
			//echo "$thumbnaleFilename exists\n";
			$existed++;
			return;
		}
		
		$imagesize = getimagesize($imagefile);
		$imagewidth = $imagesize[0];
		$imageheight = $imagesize[1];
		
		$image = imagecreatefromjpeg($imagefile);

		$thumbwidth = 96;
		$thumbheight = 54;	
		$thumb = imagecreatetruecolor($thumbwidth, $thumbheight);

		imagecopyresampled(
		$thumb,
		$image,
		0, 0, 0, 0, // Startposition des Ausschnittes
		$thumbwidth, $thumbheight,
		$imagewidth, $imageheight
		);
		
		kung_mkdir(dirname($thumbnaleFilename));
		
		imagejpeg($thumb, $thumbnaleFilename);
		imagedestroy($thumb);
		imagedestroy($image);
		$generated++;
		
	}
	
	$files = glob("thumbs/*/*.jpg");
	
	$filestext = implode("\n", $files);
	file_put_contents("database/thumbs.txt", $filestext);
	
	
	foreach ($files as $file) {
	
		createThumbnail($file);
	}
	
	echo "errors=$errors generated=$generated existed=$existed\n";