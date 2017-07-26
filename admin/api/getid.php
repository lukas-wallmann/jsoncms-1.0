<?php
include_once("../library/login.php");
$file = "../data/__id.txt";
$op = fopen($file,"r");
$counter = fread($op, 13);
fclose($op);
$counter++;
$op = fopen($file, "w");
fwrite($op, $counter);
fclose($op);
echo '{"id":'.$counter.'}';
?>
