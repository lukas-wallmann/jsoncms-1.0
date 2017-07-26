<?php
function checkDirAllowed($alloweddir,$dir){
  $allowed=false;
  $ra=get_absolute_path($alloweddir);
  $rd=get_absolute_path($dir);
  if(substr($rd,0,strlen($ra))==$ra){
    $allowed=true;
  };
  return $allowed;
}

function get_absolute_path($path) {
     $path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);
     $parts = array_filter(explode(DIRECTORY_SEPARATOR, $path), 'strlen');
     $absolutes = array();
     foreach ($parts as $part) {
         if ('.' == $part) continue;
         if ('..' == $part) {
             array_pop($absolutes);
         } else {
             $absolutes[] = $part;
         }
     }
     return implode(DIRECTORY_SEPARATOR, $absolutes);
 }
?>
