<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include("../library/config.php");

$mode=isset($_GET['mode']) ? $_GET['mode'] : '';
$filename=isset($_GET['file']) ? $_GET['file'] : '';
$filename="../data/".$filename;

if($mode=="save"){
  $data=isset($_POST['data']) ? $_POST['data'] : '';
  $delete=isset($_GET['delete']) ? $_GET['delete'] : '';

  $op = fopen($filename, "w");
  fwrite($op, fnEncrypt($data,$aespass_newsletter));
  fclose($op);
  if($delete!="")unlink($delete);
}
if($mode=="get"){
  $fo = fopen($filename,"r");
  $__contents = fnDecrypt(fread($fo, filesize($filename)),$aespass_newsletter);
  echo $__contents;
}


function fnEncrypt($sValue, $sSecretKey)
{
    return rtrim(
        base64_encode(
            mcrypt_encrypt(
                MCRYPT_RIJNDAEL_256,
                $sSecretKey, $sValue,
                MCRYPT_MODE_ECB,
                mcrypt_create_iv(
                    mcrypt_get_iv_size(
                        MCRYPT_RIJNDAEL_256,
                        MCRYPT_MODE_ECB
                    ),
                    MCRYPT_RAND)
                )
            ), "\0"
        );
}

function fnDecrypt($sValue, $sSecretKey)
{
    return rtrim(
        mcrypt_decrypt(
            MCRYPT_RIJNDAEL_256,
            $sSecretKey,
            base64_decode($sValue),
            MCRYPT_MODE_ECB,
            mcrypt_create_iv(
                mcrypt_get_iv_size(
                    MCRYPT_RIJNDAEL_256,
                    MCRYPT_MODE_ECB
                ),
                MCRYPT_RAND
            )
        ), "\0"
    );
}
?>
