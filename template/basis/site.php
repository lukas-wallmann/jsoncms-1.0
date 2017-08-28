<?php

  //Gives Page Title
  function getTitle(){
    return $GLOBALS["__contents"]->title;
  }

  //Gives the contents
  function getContents(){
    global $baseurl;
    $code="";

    foreach ($GLOBALS["__contents"]->content as $element){

      switch ($element->type) {
          case "text":
              $code.="<div class='item text'>".$element->content."</div>";
              break;
          case "headline":
              $code.="<h".$element->content->type." class='item text'>".$element->content->content."</h".$element->content->type.">";
              break;
          case "code":
              $search=array("<",">");
              $replace=array("&lt;","&gt;");
              $code.="<pre class='item code'><code class='language-php'>".str_replace($search,$replace,$element->content)."</code></pre>";
              break;
          case "image":
              $code.="<figure class='item image'><img src='$baseurl/admin/".$element->content->image."' alt='".$element->content->description."'><figcaption>".$element->content->description."</figcaption></figure>";
              break;
          case "text_image":
              $img="/admin/".$element->content->image;
              $code.="<div class='item text_image ".$element->content->align."'><div>".$element->content->text."</div><a href='".$baseurl.$img."'><img src='".$baseurl.$img."'></a></div>";
              break;
          case "gallery":
              $code.="<div class='item gallery'>";
              foreach ($element->content as $img) {
                $url="/admin/".$img->src;
                $link="/admin/".$img->srcbig;
                $code.="<a href='".$baseurl.$link."'><img src='".$baseurl.$url."'><span>".$img->description."</span></a>";
              }
              $code.="</div>";
              break;
          case "downloads":
              $code.="<div class='item downloads'>";
              foreach ($element->content as $download) {
                $url="/admin/".$download->filename;
                $code.="<a href='".$url."'>".$download->name."</a>";
              }
              $code.="</div>";
              break;
          case "video":
              $code.="<div class='item video'><div class='youtube'><iframe src='https://www.youtube.com/embed/".$element->content->id."' frameborder='0' allowfullscreen></iframe></div></div>";
              break;
          case "html":
              $code.="<div class='item html'>".$element->content."</div>";
              break;

      }

    }

    return $code;

  }

?>
