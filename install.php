<?php
  if(isset($_GET["save"])){
    $conf1=$_POST["conf1"];
    $conf2=$_POST["conf2"];
  }
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Install of jsoncms</title>
    <script src="admin/js/jquery.js"></script>
    <style>
      textarea{width:100%; height:200px;}
      body{font-family: sans-serif; font-size: 16px;}
      button{color:#fff; background: #dd4444; padding: 10px; border: 0}
      .configure{background: #ccc; padding:20px; margin: 50px auto; width:300px;}
      .configure label{display: inline-block; width:150px;}
    </style>
  </head>
  <body>
    <div class="configure">
      <label>Username</label><input class="username" value="admin"><br>
      <label>Password</label><input class="password" value="password"><br>
      <button>generate config</button>
    </div>
    <div class="conf" style="display:none">
      <p>please create the following files</p>
      <h2>/config.php</h2>
      <textarea name="conf1"></textarea>
      <h2>/admin/library/config.php</h2>
      <textarea name="conf2"></textarea>
    <div>
    <script>
      $(document).ready(function(){
        $(".configure button").click(function(){
          refreshconfig();
        })
      })
      function refreshconfig(){
        var url=document.location.href.split("install.php").join("").split("/");
        var conf1=[];
        var p=url[3];
        var s="";
        if(p!="")s="/"
        conf1.push('$basedir=dirname(__FILE__);');
        conf1.push('$baseurlws="'+p+'"');
        conf1.push('$baseurl="'+s+'".$baseurlws');

        var conf2=[];

        conf2.push('$username="'+$(".username").val()+'";');
        conf2.push('$password="'+$(".password").val()+'";');
        conf2.push('$salt="'+rand(20)+'";');
        conf2.push('$pepper="'+rand(20)+'";');
        conf2.push('$aespass="'+rand(24)+'";');
        conf2.push('$aespass_newsletter="'+rand(24)+'";');

        $(".conf").show();
        buildConf($("textarea[name=conf1]"),conf1);
        buildConf($("textarea[name=conf2]"),conf2);
      }
      function rand(l){
        var chars="abcdefghijklmnopqrstuvwxyz0123456789";
        var ret="";
        for(var i=0; i<l; i++){
          ret+=chars.charAt(Math.round(Math.random()*36));
        }
        return ret;
      }
      function buildConf(textarea,confi){
        textarea.val("<"+"?php\r\n"+confi.join("\r\n")+"\r\n?"+">");
      }

    </script>
  </body>
</html>
