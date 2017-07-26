<?php

  //Search Menu group (first childNodes of __sitelist.menu)
  function getMenu($name,$handle){
    for($i=0; $i<count($GLOBALS["__sitelist"]->menu); $i++){
      if($GLOBALS["__sitelist"]->menu[$i]->title == $name){
        $code=$handle($GLOBALS["__sitelist"]->menu[$i]->sub);
        return $code;
        break;
      };
    }
  }
  //Handlefunction - that calls itself recursivly till all menus got
  function mainMenuHandle($m){
    $code="";
    foreach ($m as $menupoint){
      $link=getLink($menupoint->id);
      $target="_top";
      if($menupoint->action!="")$link=$menupoint->action;
      if($menupoint->target!="")$target=$menupoint->target;
      $code.="<li><a href='".$link."' target='".$target."'>".$menupoint->title."</a>";
      if(count($menupoint->sub)>0){
        $code.=mainMenuHandle($menupoint->sub);
      }
      $code.="</li>";

    }
    return "<ul>".$code."</ul>";
  }

  //Helper function to search link from __sitelist.sites
  function getLink($menuid){
    global $baseurl;
    $link="#";
    foreach($GLOBALS["__sitelist"]->sites as $site){
      if($site->menuid==$menuid){
        $link=$baseurl."/".preg_replace('/\\.[^.\\s]{3,4}$/', '', $site->file)."/";
        break;
      }
    }
    return $link;
  }

?>
