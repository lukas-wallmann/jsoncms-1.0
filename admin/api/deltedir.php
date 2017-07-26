<?php
$foldertodelete=isset($_GET['dir']) ? $_GET['dir'] : '';
deldir($foldertodelete);
function deldir($dir){
	$dp = opendir($dir);
	while($file = readdir($dp)){
		$name = $dir . "/" . $file;
		if ($file != "." && $file != ".."){
			if (is_dir($name)){
				deldir($name);
			}else{
				unlink($name);
			}
		}
	}
	closedir($dp);
	rmdir($dir);
}
function deldirfiles($dir){
	$dp = opendir($dir);
	//echo "clearing dir:".$dir;
	while($file = readdir($dp)){
		$name = $dir . "/" . $file;
		//echo $name;
		if ($file != "." && $file != ".."){
			if (is_dir($name)){
				deldir($name);
			}else{
				unlink($name);
			}
		}
	}
	closedir($dp);
}
 ?>
