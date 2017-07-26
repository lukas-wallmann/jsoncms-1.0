<?php

  include_once("../library/login.php");
  include_once("../library/security.php");
  $dir="../".$_GET["dir"];
  if(checkDirAllowed("../uploads",$dir)){
    mkdir($dir);
    echo '{"sucess":"true"}';
  }else{
    die("fuck you!");
  }


?>
