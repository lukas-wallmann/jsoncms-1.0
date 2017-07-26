<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
  include "getData.php";
  include "menu.php";
  include "site.php";
?>

<!DOCTYPE html>
<html>
  <head>
    <title><?php echo getTitle() ?></title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

    <link rel="stylesheet" type="text/css" href="<?php echo $baseurl?>/template/basis/css/site.css">
    <link rel="stylesheet" type="text/css" href="<?php echo $baseurl?>/template/basis/css/prism.css">

    <script src="<?php echo $baseurl?>/template/basis/js/prism.js"></script>
    <script src="<?php echo $baseurl?>/template/basis/js/jquery.js"></script>
    <script src="<?php echo $baseurl?>/template/basis/js/site.js"></script>

  </head>

  <body>
    <nav><div class='menutoggle'>menu</div><?php echo getMenu("MAIN_MENU","mainMenuHandle") ?></nav>
    <main>
      <h1><?php echo getTitle() ?></h1>
      <?php echo getContents() ?>
    </main>
    <footer><nav><?php echo getMenu("META_MENU","mainMenuHandle") ?></nav></footer>
  </body>

</html>
