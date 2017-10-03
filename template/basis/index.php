<?php
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


  </head>

  <body>
    <nav>
      <div class='menutoggle'>menu</div>
      <?php echo getMenu("MAIN_MENU","mainMenuHandle") ?>
    </nav>
    <main>
      <h1><?php echo getTitle() ?></h1>
      <?php echo getContents() ?>
    </main>
    <footer>
      <nav>
        <?php echo getMenu("META_MENU","mainMenuHandle") ?>
      </nav>
    </footer>
    <script src="<?php echo $baseurl?>/template/basis/js/prism.js"></script>
    <script
  			  src="https://code.jquery.com/jquery-3.2.1.min.js"
  			  integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
  			  crossorigin="anonymous"></script>
    <script src="<?php echo $baseurl?>/template/basis/js/site.js"></script>

  </body>

</html>
