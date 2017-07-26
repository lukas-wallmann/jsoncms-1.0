<?php

include_once("../library/login.php");
include_once("../library/security.php");

$data = array();
$return = array();

if(isset($_GET['files']))
{
    $error = false;
    $files = array();

    $uploaddir = '../'.$_GET["dir"];
    if(checkDirAllowed("../uploads",$uploaddir)){
      foreach($_FILES as $file)
      {


      $actual_name = pathinfo(basename($file['name']),PATHINFO_FILENAME);
      $original_name = $actual_name;
      $extension = pathinfo(basename($file['name']), PATHINFO_EXTENSION);
      $name=$actual_name.".".$extension;
      $i = 1;
      while(file_exists($uploaddir.$actual_name.".".$extension)){
        $actual_name = (string)$original_name."-".$i;
        $name = $actual_name.".".$extension;
        $i++;
      }
          array_push($return,$uploaddir.$name);
          if(move_uploaded_file($file['tmp_name'], $uploaddir.$name))
          {
              $files[] = $uploaddir .$file['name'];
              if($extension=="jpg" || $extension=="jpeg"){
                if(!file_exists($uploaddir.'thumps/')){
                  mkdir($uploaddir.'thumps/');
                }
                shrinkImage($uploaddir.$name,$uploaddir.$name,2000,2000);
                resize_crop_image(600, 400, $uploaddir.$name, $uploaddir."thumps/gallery_".$name);
                resize_crop_image(128, 128, $uploaddir.$name, $uploaddir."thumps/".$name);
              }
        }
        else
        {
            $error = true;
        }
    }
    $data = ($error) ? array('error' => 'There was an error uploading your files') : array('files' => $files);
  }else{
    die("fuck you!");
  }
}


echo json_encode($return);


function resize_crop_image($max_width, $max_height, $source_file, $dst_dir, $quality = 80){
    $imgsize = getimagesize($source_file);
    $width = $imgsize[0];
    $height = $imgsize[1];
    $mime = $imgsize['mime'];

    switch($mime){
        case 'image/gif':
            $image_create = "imagecreatefromgif";
            $image = "imagegif";
            break;

        case 'image/png':
            $image_create = "imagecreatefrompng";
            $image = "imagepng";
            $quality = 7;
            break;

        case 'image/jpeg':
            $image_create = "imagecreatefromjpeg";
            $image = "imagejpeg";
            $quality = 80;
            break;

        default:
            return false;
            break;
    }

    $dst_img = imagecreatetruecolor($max_width, $max_height);
    $src_img = $image_create($source_file);

    $width_new = $height * $max_width / $max_height;
    $height_new = $width * $max_height / $max_width;
    //if the new width is greater than the actual width of the image, then the height is too large and the rest cut off, or vice versa
    if($width_new > $width){
        //cut point by height
        $h_point = (($height - $height_new) / 2);
        //copy image
        imagecopyresampled($dst_img, $src_img, 0, 0, 0, $h_point, $max_width, $max_height, $width, $height_new);
    }else{
        //cut point by width
        $w_point = (($width - $width_new) / 2);
        imagecopyresampled($dst_img, $src_img, 0, 0, $w_point, 0, $max_width, $max_height, $width_new, $height);
    }

    $image($dst_img, $dst_dir, $quality);

    if($dst_img)imagedestroy($dst_img);
    if($src_img)imagedestroy($src_img);
}

function shrinkImage($filepath, $thumbpath, $thumbnail_width, $thumbnail_height, $background=false) {
    list($original_width, $original_height, $original_type) = getimagesize($filepath);
    if ($original_width > $original_height) {
        $new_width = $thumbnail_width;
        $new_height = intval($original_height * $new_width / $original_width);
    } else {
        $new_height = $thumbnail_height;
        $new_width = intval($original_width * $new_height / $original_height);
    }
    $dest_x = 0;
    $dest_y = 0;

    if ($original_type === 1) {
        $imgt = "ImageGIF";
        $imgcreatefrom = "ImageCreateFromGIF";
    } else if ($original_type === 2) {
        $imgt = "ImageJPEG";
        $imgcreatefrom = "ImageCreateFromJPEG";
    } else if ($original_type === 3) {
        $imgt = "ImagePNG";
        $imgcreatefrom = "ImageCreateFromPNG";
    } else {
        return false;
    }

    $old_image = $imgcreatefrom($filepath);
    $new_image = imagecreatetruecolor($new_width, $new_height);

    imagecopyresampled($new_image, $old_image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height);
    $imgt($new_image, $thumbpath);
    return file_exists($thumbpath);
}

?>
