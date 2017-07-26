<?php

  include_once("../library/login.php");
  include_once("../library/security.php");

  $filename=isset($_GET['file']) ? $_GET['file'] : '';
  $data=isset($_POST['data']) ? $_POST['data'] : '';
  $delete=isset($_GET['delete']) ? $_GET['delete'] : '';
  $filename="../data/".$filename;

  if(checkDirAllowed("../data",$filename)){
    $op = fopen($filename, "w");
    fwrite($op, $data);
    fclose($op);
  }else{
    die("fuck you!");
  }

  if($delete!=""){
    $files=explode(",",$delete);
    foreach ($files as $file) {
      if($file!=""){
          if(checkDirAllowed("../data",$file)){
            unlink("../data/".$file);
          }else{
            die("fuck you!");
          }
      }
    }
  }
  deldirfiles("../cache/");
  function deldirfiles($dir){
  	$dp = opendir($dir);
  	//echo "clearing dir:".$dir;
  	while($file = readdir($dp)){
  		$name = $dir . "/" . $file;
  		//echo $name;
  		if ($file != "." && $file != ".."){
  				unlink($name);
  		}
  	}
  	closedir($dp);
  }
?>
