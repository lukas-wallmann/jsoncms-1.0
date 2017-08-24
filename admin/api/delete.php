<?php
  include_once("../library/login.php");
  include_once("../library/security.php");

  $filestodelete=isset($_GET['files']) ? $_GET['files'] : '';

  $files=explode(",",$filestodelete);
  foreach ($files as $file) {
    if(checkDirAllowed("../uploads",$file)){
      if(file_exists("../".$file))unlink("../".$file);
    }else{
      die("fuck you!");
    }
  }
  echo '{"sucess":"true"}';
?>
