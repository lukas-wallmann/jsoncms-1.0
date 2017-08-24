<?php

include_once("../library/login.php");
include_once("../library/security.php");

$path = '../'.$_GET["dir"].$_REQUEST['filename'];
$dirname=dirname($path);
if(!file_exists($dirname))mkdir($dirname);
file_put_contents($path, file_get_contents($_REQUEST['data']));

?>
