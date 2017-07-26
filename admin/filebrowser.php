<?php
  include_once("library/login.php");
?>
 <!DOCTYPE html>
<html>
<head>
<title>Json CMS Filebrowser</title>
<link rel="stylesheet" type="text/css" href="/admin/css/cms.css">
<script src="/admin/js/jquery.js"></script>
<script src="/admin/js/ajaxuploader.js"></script>
<script src="/admin/js/cms.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<script>
$(document).ready(function() {
    cms.window.files.create("uploads/","single", function(data){returnFileUrl(data[0])});

});
// Helper function to get parameters from the query string.
function getUrlParam( paramName ) {
    var reParam = new RegExp( '(?:[\?&]|&)' + paramName + '=([^&]+)', 'i' );
    var match = window.location.search.match( reParam );

    return ( match && match.length > 1 ) ? match[1] : null;
}
function returnFileUrl(fileUrl) {
    var funcNum = getUrlParam( 'CKEditorFuncNum' );
    window.opener.CKEDITOR.tools.callFunction( funcNum, fileUrl );
    window.close();
}
</script>
</head>

<body>
  <div id="main">
    <div id="content"></div>
  </div>
</body>

</html>
