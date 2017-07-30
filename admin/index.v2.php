<?php
  include_once("library/login.php");
?>
 <!DOCTYPE html>
<html>
<head>
<title>Json CMS</title>
<link rel="stylesheet" type="text/css" href="css/cms.css?ck=<?php echo rand().rand().rand() ?>">
<script src="js/jquery.js"></script>
<script src="ckeditor/ckeditor.js"></script>
<script src="js/ajaxuploader.js?ck=<?php echo rand().rand().rand() ?>"></script>
<script src="js/cms-2.0.js?ck=<?php echo rand().rand().rand() ?>"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<script>
$(document).ready(function() {
    cms.initialize();
});
</script>
</head>

<body>

</body>

</html>
