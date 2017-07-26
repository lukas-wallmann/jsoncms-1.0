<?php
header ("Content-Type:text/xml");
include("config.php");
?>
<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<?php

$filename=$basedir."/admin/data/__sitelist.json";
$fo = fopen($filename,"r");
$__sitelist = json_decode(fread($fo, filesize($filename)));






foreach($__sitelist->sites as $site){
  $link=$baseurlws."/".str_replace(".json","",$site->file)."/";
  $secure_connection=false;
  if(isset($_SERVER['HTTPS'])) {
      if ($_SERVER['HTTPS'] == "on") {
          $secure_connection = true;
      }
  }
  if($secure_connection){
    $link="https://".$_SERVER['SERVER_NAME']."/".$link;
  }else{
    $link="http://".$_SERVER['SERVER_NAME']."/".$link;
  }
  echo "<url><loc>".$link."</loc></url>";

}

?>
</urlset>
