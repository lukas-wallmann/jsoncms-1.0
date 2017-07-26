<?php
  include_once("../library/login.php");
  include_once("../library/security.php");

  $dir=isset($_GET['dir']) ? $_GET['dir'] : '';
  $dir = "../".$dir;
  if(checkDirAllowed("../uploads",$dir)){
    $dh  = opendir($dir);
    while (false !== ($filename = readdir($dh))) {
        $files[] = $filename;
    }
    sort($files);
    echo '{"files":'.json_encode($files)."}";
  }else{
    die("fuck you!");
  }

 ?>
