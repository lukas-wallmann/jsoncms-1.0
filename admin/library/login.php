<?php
session_start();
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) {
session_unset();
session_destroy();
}
	$_SESSION['LAST_ACTIVITY'] = time();
  include_once("config.php");
  $cookieuser=isset($_SESSION['user']) ? $_SESSION['user'] : '';
  $cookiepassword=isset($_SESSION['password']) ? $_SESSION['password'] : '';
	$login=isset($_GET['login']) ? $_GET['login'] : '';
  if($cookieuser==md5($salt.fnEncrypt($username,$aespass).$pepper) && $cookiepassword==md5($salt.fnEncrypt($password,$aespass).$pepper)){
    $_SESSION["user"]=md5($salt.fnEncrypt($username,$aespass).$pepper);
    $_SESSION["password"]=md5($salt.fnEncrypt($password,$aespass).$pepper);

  }else if($login!=1){
    diewithLogin();
  }else{
    $postuser=isset($_POST['username']) ? $_POST['username'] : '';
    $postpassword=isset($_POST['password']) ? $_POST['password'] : '';

    if($postuser==$username && $postpassword==$password){


       $_SESSION["user"]=md5($salt.fnEncrypt($username,$aespass).$pepper);
    $_SESSION["password"]=md5($salt.fnEncrypt($password,$aespass).$pepper);

    }else{
      diewithLogin();
    }

  }
  session_regenerate_id(true);
  function diewithLogin(){

      die('<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
</head><body style="background: rgb(91, 91, 91) none repeat scroll 0px 0px;"><form style="background: rgb(242, 242, 242) none repeat scroll 0% 0%; width: 200px; padding: 20px; margin: 100px auto; box-shadow: 0px 0px 22px;" action="index.php?login=1" method="post"><h1 style="font-weight: normal; display: inline; line-height: 38px; vertical-align: top; margin: 0px 10px;">Login</h1><input type="text" name="username" placeholder="username" style="color: rgb(0, 127, 0);"><input type="password" placeholder="password" name="password" style="color: rgb(188, 0, 0);"><button type="submit" style="background: rgb(255, 0, 0) none repeat scroll 0% 0%; border: medium none; float: right; line-height: 50px; font-weight: bold; color: rgb(242, 242, 242); padding: 20px; font-size: 49px;">login</button></form></body></html>');

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
?>
