<?php

include_once("../library/login.php");
include_once("../library/security.php");

$uploaddir = '../'.$_GET["dir"];
if(checkDirAllowed("../uploads",$uploaddir)){
  file_put_contents( $uploaddir.$_REQUEST['filename'], file_get_contents($_REQUEST['data']));
}else{
  die("fuck you!");
}

?>
