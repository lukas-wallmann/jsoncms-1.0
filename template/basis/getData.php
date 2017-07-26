<?php

// Handle sitelist for menü and site
$filename=$basedir."/admin/data/__sitelist.json";
$fo = fopen($filename,"r");
$__sitelist = json_decode(fread($fo, filesize($filename)));

// Handle the site data
$title=$__sitelist->sites[0]->title;
$file=$__sitelist->sites[0]->file;
$get_file=isset($_GET['title']) ? $_GET['title'] : '';

//if sitename given via get
if($get_file!=""){
  $file=$get_file.".json";
}
//Add the path to file
$file=$basedir."/admin/data/".$file;
$fo_content = fopen($file,"r");
$__contents = json_decode(fread($fo_content, filesize($file)));

?>
