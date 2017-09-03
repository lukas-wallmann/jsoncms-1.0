var cms={

//initialize cms

  initialize:function(){
    cms.w.start.create();
  },

//Core Functions

  c:{

    //Scrollback
    scroll:function(){
      if(cms.w.siteeditor.scrollTo=="last"){
        $('html, body').animate({
          scrollTop: $(".siteeditor > .contents > .item").last().offset().top
        }, 500);
      }else{
          $('html, body').animate({
            scrollTop: cms.w.siteeditor.scrollTo
          }, 500);
      }
    },

    //Cachekiller
    ck: function(url) {
        var ck = new Date().getTime() + cms.c.gT(4);
        if (url.split("?").length == 1) {
            return url + "?ck=" + ck;
        } else {
            return url + "&ck=" + ck;
        }
    },


    //preloader
    pl:{
      show:function(){
        if($("#preloader").length==0){
          $("body").append("<div id='preloader'><span>loading...</span></div>");
        }
      },
      hide:function(){
        $("#preloader").remove();
      }
    },


    //button
    btn: function(name, cl, ad="") {
        return "<button class='" + cl + "' "+ad+">" + name + "</button>";
    },


    //Get token
    gT: function(l) {
        var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
        var token = [];
        for (var i = 0; i < l; i++) {
            token.push(chars.charAt(Math.round(Math.random() * 36)));
        }
        return token.join("");
    },


    //Get File from Title
    gFFT: function(t) {
        t = t.toLowerCase();
        t = t.replace(/[^a-zA-Z0-9 ]/g, "");
        t = t.split(" ").join("-");
        t = t.split("---").join("-");
        t = t.split("--").join("-");
        t = t + ".json";
        return t;
    }

  }, //END cms.c


// WINDOWS of cms

  w:{
    start: {
        create: function() {
            var code = [];
            code.push("<div id='main'>");
            code.push("<nav>" + cms.w.start.menu.create() + "</nav>");
            code.push("<div id='content'></div>");
            code.push("<div class='footer'>JSON CMS by Lukas Wallmann</div>")
            code.push("</div>");
            $("body").append(code.join(""));
            cms.w.start.menu.activate();
            cms.w.site.create();
        },

        menu: {
            create: function() {
                var code = [];
                var points = ["site", "menu", "files", "settings"];
                for (var i = 0; i < points.length; i++) {
                    code.push("<a class='" + points[i] + "'>" + points[i] + "</a>");
                }
                return code.join("");
            },
            activate: function() {
                $("nav a").click(function() {
                    $("nav a").removeClass("active");
                    var c = $(this).attr("class");
                    var f = eval("cms.w." + c + ".create");
                    f();
                });
            },
            mark: function(c) {
                $("nav a").removeClass("active");
                $("nav a." + c).addClass("active");
            }
        }

    }

  }

}


//Sitelist window Site
cms.w.site= {

    data: {},

    create: function() {
        cms.w.start.menu.mark("site");
        cms.c.pl.show();
        $.getJSON(cms.c.ck("data/__sitelist.json"), function(data) {
            cms.w.site.list(data);
            cms.w.site.data = data;
        });
    },

    saveAsView:function(){
      var tmp=[];
      $(".listitem").each(function(){
        var elm=$(this);
        var o={};
        o.id=elm.attr("data-id");
        o.menuid=elm.attr("data-menuid");
        o.file=elm.attr("data-file");
        o.title=elm.children(".title").text();
        tmp.push(o);
      });
      cms.w.site.data.sites=tmp;
      cms.c.pl.show();
      $.post("api/savejson.php?file=__sitelist.json", {
              data: JSON.stringify(cms.w.site.data)
          })
          .done(function(data) {
              cms.w.site.create();
          });

    },

    list: function(data) {

        cms.c.pl.hide();

        code = [];

        //Menu select
        code.push("<select class='menuselect'><option value=''>all menus</option>");

        createMenu(data.menu, 0);

        function createMenu(data, depth) {
            var pre = "";
            for (var i = 0; i < depth; i++) {
                pre += "-";
            }

            for (var i = 0; i < data.length; i++) {
                var dis="";
                if(depth==0)dis="disabled";
                code.push("<option value='" + data[i].id + "' "+dis+">" + pre + data[i].title + "</option>");

                if (data[i].sub.length > 0) {
                    createMenu(data[i].sub, depth + 1)
                }
            }
        }

        code.push("</select>");
        code.push(cms.c.btn("new site", "newsite"));

        //List sites
        for (var i = 0; i < data.sites.length; i++) {
            var c = "";
            code.push("<div class='listitem" + c + "' data-id='" + data.sites[i].id + "' data-file='" + data.sites[i].file + "' data-menuid='" + data.sites[i].menuid + "'><span class='title'>" + data.sites[i].title + "</span><a class='remove'>x</a><a class='up'>up</a><a class='down'>down</a><div class='clearline'></div></div>");
        }

        $("#content").html(code.join(""));

        $(".listitem").first().children('.up').hide();
        $(".listitem").last().children('.down').hide();

        //Menu selection
        $("#content .menuselect").change(function() {
            var val = $(this).val();
            $("#content .listitem").each(function() {
                if ($(this).attr("data-menuid") != val && val != "") {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            })
        });

        $("#content > .newsite").click(function() {
            cms.w.siteeditor.create("new");
        });

        $("#content > .listitem > .title").click(function() {
            cms.w.siteeditor.create($(this).parent().attr("data-id"));
        });

        $('.listitem .up').click(function(){
          var elm=$(this).parent();
          var elmat=elm.prev();
          while(elmat.css("display")=="none"){
            elmat=elmat.prev();
          }
          elm.insertBefore(elmat);
          cms.w.site.saveAsView();
        });

        $('.listitem .down').click(function(){
          var elm=$(this).parent();
          var elmat=elm.next();
          while(elmat.css("display")=="none"){
            elmat=elmat.next();
          }
          elm.insertAfter(elmat);
          cms.w.site.saveAsView();
        });

        $(".listitem .remove").click(function() {
          var r = confirm("Delete: "+$(this).parent().find(".title").text()+"?");
          if (r == true) {
            var elm = $(this);
            cms.c.pl.show();
            var deleteFile=elm.parent().attr("data-file");
            $.getJSON(cms.c.ck("data/__sitelist.json"), function(datas) {
                var newsites = [];
                for (var i = 0; i < datas.sites.length; i++) {
                    if (datas.sites[i].id != elm.parent().attr("data-id")) {
                        newsites.push(datas.sites[i]);
                    }
                }
                datas.sites = newsites;
                $.post("api/savejson.php?file=__sitelist.json&delete="+deleteFile, {
                        data: JSON.stringify(datas)
                    })
                    .done(function(data) {
                        cms.w.site.create();
                    });
            });
          }
        });
    }
}

//siteeditor
cms.w.siteeditor= {

    data:{},
    isnew:false,
    scrollTo:"",

    create: function(id) {

        if (id == "new") {

            cms.c.pl.show();
            $.getJSON(cms.c.ck("api/getid.php"), function(data) {
                cms.w.siteeditor.getdata(data.id, true, "");
            });

        } else {

            cms.c.pl.show();
            $.getJSON(cms.c.ck("data/__sitelist.json"), function(data) {

                var file = "";
                for (var i = 0; i < data.sites.length; i++) {
                    if (data.sites[i].id == id) {
                        file = data.sites[i].file;
                    }
                }
                cms.w.siteeditor.getdata(id, false, file);
            });

        }
    },
    aktItmNav:function(){
      $("#content .contents .item .subnav").remove();
      $("#content .contents .item").each(function(i){
        $(this).append("<div class='subnav'>"+cms.c.btn("new element","newelement","data-at='"+i+"'")+cms.c.btn("save","save")+"</div>");
      });
      $(".newelement").click(function(){
        cms.w.siteeditor.saveData(false,true);
        cms.w.siteeditor.newelement($(this));
      });
      $(".save").click(function() {
          cms.w.siteeditor.saveData(true);
      });
    },

    getdata: function(id, isnew, file) {

        if (isnew) {

            cms.w.siteeditor.isnew=true;
            var data = {}
            data.id = id;
            data.file = "new-page.json",
                data.title = "new page",
                data.content = [{
                    type: "text",
                    content: "This is a new page, add your contents"
                }];
            data.menuid = $('#content select').val();
            data.visible = true;
            cms.w.siteeditor.build(data);

        } else {

            $.getJSON(cms.c.ck("data/" + file), function(data) {
                cms.w.siteeditor.build(data);
            });

        }
    },

    build: function(data) {

        cms.c.pl.show();
        cms.w.siteeditor.data=data;

        $.getJSON(cms.c.ck("data/__sitelist.json"), function(d) {

            var code = [];
            cms.c.pl.hide();
            code.push("<div class='siteeditor'><div class='fixsiteparts'>");
            code.push("<div class='row'><label>sitetitle</label><input class='title' value='" + data.title + "'></div>");
            code.push("<div class='row'><label>menu</label><select class='menuid'>");
            createMenu(d.menu, 0);

            function createMenu(da, depth) {
                var pre = "";
                for (var i = 0; i < depth; i++) {
                    pre += "-";
                }
                for (var i = 0; i < da.length; i++) {
                    var sel = "";
                    if (da[i].id == data.menuid) {
                        sel = " selected"
                    }
                    code.push("<option value='" + da[i].id + "'" + sel + ">" + pre + da[i].title + "</option>");
                    if (da[i].sub.length > 0) {
                        createMenu(da[i].sub, depth + 1)
                    }
                }

            }

            code.push("</select></div>");
            code.push("<input type='hidden' class='id' value='" + data.id + "'>");
            code.push("<input type='hidden' class='file' value='" + data.file + "'>");
            code.push("<div class='subnav'>"+cms.c.btn("new element","newelement","data-at='-1'")+cms.c.btn("save","save")+"</div>");
            code.push("</div>");
            code.push("<div class='contents'>");
            code.push("</div>");
            code.push("</div>");
            $("#content").html(code.join(""));

            cms.w.siteeditor.getContents(data.content);

            $("#content .fixsiteparts .title").on('change', function() {
                $("#content .fixsiteparts .file").val(cms.c.gFFT($(this).val()));
            });

            $("#content .fixsiteparts .title").keyup(function() {
                $("#content .fixsiteparts .file").val(cms.c.gFFT($(this).val()));
            });





        });

    },

    newelement:function(elm){
      //$(".siteeditor").hide();
      var at=elm.attr("data-at");
      cms.w.siteeditor.scrollTo=elm.offset().top;
      var code=[];
      code.push("<div class='newelement'>");
        code.push("<a class='text'>text</a>");
        code.push("<a class='headline'>headline</a>");
        code.push("<a class='text_image'>text &amp; image</a>");
        code.push("<a class='image'>image</a>");
        code.push("<a class='video'>youtube video</a>");
        code.push("<a class='html'>html code</a>");
        code.push("<a class='gallery'>gallery</a>");
        code.push("<a class='downloads'>downloads</a>");
        code.push("<a class='code'>code</a>");
      code.push("</div>");

      $("#content").html(code.join(""));

      $(".newelement .text").click(function(){
        insertat(at,{type: "text",content: "This is a text"})
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .code").click(function(){
        insertat(at,{type: "code",content: "This is code"})
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .text_image").click(function(){
        insertat(at,{type: "text_image",content: {image:"",text:"this is text",align:"left"}});
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .image").click(function(){
        insertat(at,{type: "image",content: {image:"",description:""}});
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .video").click(function(){
        insertat(at,{type: "video",content:"www.youtube.com"});
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .html").click(function(){
        insertat(at,{type: "html",content:"html here"});
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .headline").click(function(){
        insertat(at,{type: "headline",content:{type:2,content:"new headline"}});
        cms.w.siteeditor.build(cms.w.siteeditor.data)
      });

      $(".newelement .gallery").click(function(){
        insertat(at,{type: "gallery", content:[]});
        cms.w.siteeditor.build(cms.w.siteeditor.data);
      });

      $(".newelement .downloads").click(function(){
        insertat(at,{type: "downloads", content:[]});
        cms.w.siteeditor.build(cms.w.siteeditor.data);
      });

      function insertat(at,elm){
        var tmp=[];
        if(at==-1)tmp.push(elm);
        for(var i=0;i<cms.w.siteeditor.data.content.length;i++){
          tmp.push(cms.w.siteeditor.data.content[i]);
          if(at==i)tmp.push(elm);
        }
        cms.w.siteeditor.data.content=tmp;
      }

    },

    getContents: function(data) {

        var code = [];

        for (var i = 0; i < data.length; i++) {

            switch (data[i].type) {
                case "text":
                  code.push("<div class='item text' data-type='text'><div class='nav'><h2>text</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><textarea class='editor'>" + data[i].content + "</textarea></div>")
                  break;
                case "headline":
                  code.push("<div class='item headline' data-type='headline'><div class='nav'><h2>headline</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div>")
                  code.push("<select class='type'>");
                  for (var j=1; j<7; j++){
                    var selected="";
                    if(j==data[i].content.type)selected=" selected";
                    code.push("<option value='"+j+"'"+selected+">h"+j+"</option>")
                  }
                  code.push("</select><input type='text' value='"+data[i].content.content+"'></div>")
                  break;
                case "code":
                    code.push("<div class='item code' data-type='code'><div class='nav'><h2>code</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><textarea class='editor-code'>" + data[i].content + "</textarea></div>")
                    break;
                case "text_image":
                  code.push("<div class='item text_image' data-type='text_image'><div class='nav'><h2>text &amp; image</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div>");
                  code.push("<label>image align:</label><select class='imagealign'>");
                  var aligns=["right","left"];
                  for(var j=0; j<aligns.length; j++){
                    var selected="";
                    if(data[i].content.align==aligns[j]){
                      selected=" selected";
                    }
                    code.push("<option value='"+aligns[j]+"'"+selected+">"+aligns[j]+"</option>");
                  }
                  code.push("</select>");
                  code.push("<textarea class='editor'>" + data[i].content.text + "</textarea><div class='imageuploader'></div><img src='"+data[i].content.image+"'></div>");
                  break;
                case "image":
                    code.push("<div class='item image' data-type='image'><div class='nav'><h2>image</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='imageuploader'></div><img src='"+data[i].content.image+"'><div class='description'><label>description</label><input type='text' placeholder='description' value='"+data[i].content.description+"' class='desc'></div></div></div>")
                    break;
                case "html":
                  code.push("<div class='item html' data-type='html'><div class='nav'><h2>html code</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><textarea class='htmlcode'>" + data[i].content + "</textarea></div>");
                  break;
                case "video":
                  code.push("<div class='item video' data-type='video'><div class='nav'><h2>video</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='preview'></div><div class='fields'><label>Youtube URL</label><input class='videourl' value='"+data[i].content.url+"'><input type='hidden' class='videoid' val='"+data[i].content.id+"'></div>" + "<div class='clear'></div></div>");
                  break;
                case "gallery":
                    code.push("<div class='item gallery' data-type='gallery'><div class='nav'><h2>gallery</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='galleryuploader'></div><div class='gallerycontent'>");
                    for(var j=0; j<data[i].content.length; j++){
                      code.push("<div class='itm'><div class='nav'><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><img src='"+data[i].content[j].src+"' data-big='"+data[i].content[j].srcbig+"'><input class='description' value='"+data[i].content[j].description+"' placeholder='image description'></div>");
                    }
                    code.push("</div></div>");
                    break;
                case "downloads":
                    code.push("<div class='item downloads' data-type='downloads'><div class='nav'><h2>downloads</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='downloadsuploader'></div><div class='downloadcontent'>");
                    for(var j=0; j<data[i].content.length; j++){
                      code.push("<div class='itm'><div class='nav'><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='filename'>"+data[i].content[j].filename+"</div><input type='text' value='"+data[i].content[j].name+"'></div>");
                    }
                    code.push("</div></div>");
                    break;

            }
        }

        $("#content .contents").append(code.join(""));
        cms.w.siteeditor.aktItmNav();

        cms.c.scroll();
      var dd=1;

      function resetNav(){
        cms.w.siteeditor.aktItmNav();
        $('.item .nav a').show();
        $('.siteeditor > .contents > .item').first().find(".nav .up").hide();
        $('.siteeditor > .contents > .item').last().find(".nav .down").hide();
        $('.gallerycontent, .downloads').each(function(){
          $(this).find('.nav a').show();
          $(this).find('.itm').first().find(".nav .up").hide();
          $(this).find('.itm').last().find(".nav .down").hide();
        });

      }

      resetNav();
      refreshElmFunctions();

      function refreshElmFunctions(){

        $('.item > .nav .up, .itm > .nav .up').click(function(){
          var elm=$(this).parent().parent();
          setScrollTop();
          elm.insertBefore(elm.prev());
          resetNav();
          fixFuckingEditor();
        });

        $('.item > .nav .down, .itm > .nav .down').click(function(){
          var elm=$(this).parent().parent();
          setScrollTop();
          elm.insertAfter(elm.next());
          resetNav();
          fixFuckingEditor();
        });

        $('.item > .nav .delete, .itm > .nav .delete').click(function(){
          var elm=$(this).parent().parent();
          setScrollTop();
          elm.remove();
          resetNav();
          cms.w.siteeditor.saveData(false);
          fixFuckingEditor();
        });

        $('.siteeditor > .contents > .item > .nav > .up, .siteeditor > .contents > .item > .nav > .down').click(function(){
            cms.w.siteeditor.scrollTo=$(this).parent().parent().offset().top;
            $('html, body').animate({
               scrollTop: cms.w.siteeditor.scrollTo
           }, 500)
        });
        /*
        $('.siteeditor > .contents > .item .itm .up, .siteeditor > .contents > .item .itm .down, .siteeditor > .contents > .item .itm .delete').click(function(){
            $('html, body').scrollTop(cms.w.siteeditor.scrollTo);
        });*/

      }

      $('.imageuploader').append(cms.c.btn("select image / add image","select_f"));
      $('.galleryuploader').append(cms.c.btn("select images / add images","select_f"));
      $('.downloadsuploader').append(cms.c.btn("select files / add files","select_f"));

      $('.downloadsuploader .select_f').click(function(){
        setScrollTop();
        $('.siteeditor').hide();
        var elm=$(this).parent().parent();
        cms.w.files.create("uploads/","multi",function(data){
          for(var i=0; i<data.length; i++){

            elm.find(".downloadcontent").append("<div class='itm'><div class='nav'><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='filename'>"+data[i]+"</div><input type='text' value='"+data[i].split("/")[data[i].split("/").length-1]+"'></div>");
          }
          $('.siteeditor').show();
          $('.filemanager').remove();
          refreshElmFunctions();
          resetNav();
          cms.c.scroll();
        });
      });

      $('.galleryuploader .select_f').click(function(){
        setScrollTop();
        $('.siteeditor').hide();
        var elm=$(this).parent().parent();
        cms.w.files.create("uploads/","multi",function(data){
          for(var i=0; i<data.length; i++){
            var parts=data[i].split("/");
            var src="";
            for(var j=0; j<parts.length-1; j++){
              src+=parts[j]+"/";
            }
            src+="thumps/gallery_"+parts[parts.length-1];
            elm.find(".gallerycontent").append("<div class='itm'><div class='nav'><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><img src='"+src+"' data-big='"+data[i]+"'><input class='description' value='' placeholder='image description'></div>");
          }
          $('.siteeditor').show();
          $('.filemanager').remove();
          refreshElmFunctions();
          resetNav();
          cms.c.scroll();
        });
      });

      $('.imageuploader .select_f').click(function(){
        setScrollTop();
        $('.siteeditor').hide();
        var elm=$(this).parent().parent();
        cms.w.files.create("uploads/","single",function(data){
          elm.find("img").attr("src",data[0]);
          $('.siteeditor').show();
          $('.filemanager').remove();
          refreshElmFunctions();
          resetNav();
          cms.c.scroll();
        });
      });

      //Set Scroll Position to scroll back
      function setScrollTop(){

        cms.w.siteeditor.scrollTo=$('body').scrollTop();
        if(cms.w.siteeditor.scrollTo==0)  cms.w.siteeditor.scrollTo=$('html').scrollTop();
      }


      function fixFuckingEditor(){

        $(".siteeditor > .contents > .item.text").each(function(){
          $(this).css("min-height",$(this).height());
        })
        for(var instanceName in CKEDITOR.instances){
            CKEDITOR.instances[instanceName].updateElement();
        }
        for(name in CKEDITOR.instances){
            CKEDITOR.instances[name].destroy()
        }
        $(".editor").each(function(){
          $(this).attr("id","editor"+dd);
          CKEDITOR.replace( 'editor'+dd,{filebrowserBrowseUrl: '/admin/filebrowser.php',filebrowserUploadUrl: '/admin/filebrowser.php'});
          dd=dd+1;
        });

      }

      $(".videourl").keyup(function() {
        var elm=$(this).parent();
        actVideo(elm);
      }).change(function(){
        var elm=$(this).parent().parent();
        actVideo(elm);
      }).change(function(){
        var elm=$(this).parent().parent();
        actVideo(elm);
      });

      $(".item.video").each(function(){
        actVideo($(this));
      });

      function actVideo(elm){

        var id=getID(elm.find(".videourl").val());
        elm.find(".videoid").val(id);
        elm.find(".preview").html("<img src='https://img.youtube.com/vi/"+id+"/default.jpg'>")
        function getID(link){
          var rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
          var r = link.match(rx);
          if(r !== null){
            return r[1];
          }
        }

      }

      $(".editor").each(function(){
        $(this).attr("id","editor"+dd);
        CKEDITOR.replace( 'editor'+dd,{filebrowserBrowseUrl: '/admin/filebrowser.php',filebrowserUploadUrl: '/admin/filebrowser.php'});
        dd+=1;
      });

    },

    saveData: function(toFile,tmp=false) {

        var o = {};
        //Dirty editor hack not working otherwise
        for(var instanceName in CKEDITOR.instances){
            CKEDITOR.instances[instanceName].updateElement();
        }
        o.title = $(".fixsiteparts .title").val();
        o.id = $(".fixsiteparts .id").val();
        o.file = getUniqueFilename($(".fixsiteparts .file").val(),cms.w.site.data.sites);

        function getUniqueFilename(name,data){
          var at=0;
          name=name.split(".json").join("");
          var add=".json";
          goFiles();
          function goFiles(){

            for(var i=0; i<data.length; i++){
              if(name+add==data[i].file && o.id!=data[i].id){
                add="-"+at+".json";
                at++;
                goFiles();
                break;
              }
            }

          }
          return name+add;
        }

        o.menuid = $(".fixsiteparts .menuid").val();
        o.content = [];

        $("#content .contents .item").each(function() {
            switch ($(this).attr("data-type")) {
                case "text":
                    o.content.push({
                        type: "text",
                        content: $(this).find("textarea").val()
                    })
                    break;
                case "headline":
                    o.content.push({
                        type: "headline",
                        content: {type:$(this).find(".type").val(),content:$(this).find("input").val()}
                    })
                    break;
                case "code":
                    o.content.push({
                        type: "code",
                        content: $(this).find("textarea").val()
                    })
                    break;
                case "text_image":
                    o.content.push({
                        type: "text_image",
                        content: {text:$(this).find("textarea").val(),image:$(this).find("img").attr("src"),align:$(this).find('.imagealign').val()}
                    })
                    break;
                case "image":
                    o.content.push({
                        type: "image",
                        content: {image:$(this).find("img").attr("src"),description:$(this).find(".desc").val()}
                    })
                    break;
                case "html":
                    o.content.push({
                        type: "html",
                        content: $(this).find("textarea").val()
                    })
                    break;
                case "video":
                    o.content.push({
                      type:"video",
                      content: {url:$(this).find(".videourl").val(),id:$(this).find(".videoid").val()}
                    })
                    break;
                case "gallery":
                    var imgs=[];
                    $(this).find('.gallerycontent img').each(function(){
                      imgs.push({src:$(this).attr("src"),srcbig:$(this).attr("data-big"),description:$(this).parent().find(".description").val()});
                    });
                    o.content.push({
                      type:"gallery",
                      content: imgs
                    })
                    break;
                case "downloads":
                    var downloads=[];
                    $(this).find('.downloadcontent .itm').each(function(){
                      downloads.push({filename:$(this).find(".filename").text(),name:$(this).find("input").val()});
                    });
                    o.content.push({
                      type:"downloads",
                      content: downloads
                    })
                    break;
            }
        });

        var deleteFile="";

        if(cms.w.siteeditor.isnew==false && cms.w.siteeditor.data.file!=o.file){
          deleteFile=cms.w.siteeditor.data.file;
        }

        cms.w.siteeditor.data=o;

        if(toFile && !tmp){
          cms.c.pl.show();
          $.post("api/savejson.php?file=" + o.file+"&delete="+deleteFile, {
                  data: JSON.stringify(o)
              })
              .done(function(data) {
                  $.getJSON(cms.c.ck("data/__sitelist.json"), function(data) {
                      var newsites = [];
                      var found = false;
                      for (var i = 0; i < data.sites.length; i++) {
                          if (data.sites[i].id != o.id) {
                              newsites.push(data.sites[i]);
                          } else {
                              found = true;
                              newsites.push({
                                  title: o.title,
                                  id: o.id,
                                  menuid: o.menuid,
                                  visible: o.visible,
                                  file: o.file
                              });
                          }
                      }
                      //IF new site
                      if (!found) {
                          newsites.push({
                              title: o.title,
                              id: o.id,
                              menuid: o.menuid,
                              visible: o.visible,
                              file: o.file
                          });
                      }

                      data.sites = newsites;
                      $.post("api/savejson.php?file=__sitelist.json", {
                              data: JSON.stringify(data)
                          })
                          .done(function(data) {
                              cms.w.site.create();
                          });
                  });

              });
          }
    }


}

// Menulist
cms.w.menu= {

    data: {},

    create: function() {

        cms.c.pl.show();
        cms.w.start.menu.mark("menu");

        $.getJSON(cms.c.ck("data/__sitelist.json"), function(data) {
            cms.w.menu.list(data);
            cms.w.menu.data = data;
        });

    },

    list: function(data) {

        cms.c.pl.hide();

        code = [];

        code.push("<div class='menucontainer'>")
            //Menu select
        code.push(cms.c.btn("new menu", "newmenu"));

        createMenu(data.menu, 0);

        function createMenu(data, depth) {

            for (var i = 0; i < data.length; i++) {
                code.push("<div class='listitem' data-id='" + data[i].id + "' data-target='" + data[i].target + "' data-action='" + data[i].action + "'><span class='title'>" + data[i].title + "</span><a class='remove'>x</a><a class='addsub'>add sub</a><a class='up'>up</a><a class='down'>down</a><div class='clearline'></div><div class='sub'>");
                if (data[i].sub.length > 0) {
                    createMenu(data[i].sub, depth + 1);
                }
                code.push("</div></div>");
            }
        }
        code.push("</div>");
        $("#content").html(code.join(""));

        $(".listitem").first().children('.up').hide();
        $(".listitem").last().children('.down').hide();

        $(".listitem .sub").each(function(){
          $(this).children('.listitem').first().children('.up').hide();
          $(this).children('.listitem').last().children('.down').hide();

        })

        $(".newmenu").click(function() {
            cms.w.menueditor.create(data, "new");
        })

        $(".listitem .title").click(function() {
            cms.w.menueditor.create(data, $(this).parent().attr("data-id"));
        });

        $(".listitem .remove").click(function() {
          var r = confirm("Delete: "+$(this).parent().children(".title").text()+"?");
          if (r == true) {
            $(this).parent().remove();
            cms.w.menueditor.saveAsView();
          }

        });

        $('.listitem .up').click(function(){
          var elm=$(this).parent();
          var elmat=elm.prev();
          while(elmat.css("display")=="none"){
            elmat=elmat.prev();
          }
          elm.insertBefore(elmat);
          cms.w.menueditor.saveAsView();
        });

        $('.listitem .down').click(function(){
          var elm=$(this).parent();
          var elmat=elm.next();
          while(elmat.css("display")=="none"){
            elmat=elmat.next();
          }
          elm.insertAfter(elmat);
          cms.w.menueditor.saveAsView();
        });

        $(".listitem .addsub").click(function() {
            var elm = $(this).parent();
            cms.c.pl.show();
            $.getJSON(cms.c.ck("api/getid.php"), function(data) {
                var mo = {
                    title: "menu subnew",
                    id: data.id,
                    action: "",
                    target: "",
                    sub: []
                };
                cms.w.menueditor.buildeditor(mo, elm.attr("data-id"));
            });
        });

    }
}

// Menueditor
cms.w.menueditor= {

    create: function(data, id) {

        cms.c.pl.hide();
        var mo = {};

        function searchMenuPoint(data, todo) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id == id) {
                    todo(data[i]);
                }
                if (data[i].sub.length > 0) {
                    searchMenuPoint(data[i].sub, todo);
                }
            }
        }

        searchMenuPoint(data.menu, function(data) {
            mo = data
        });

        if (mo.title == undefined) {
            cms.c.pl.show();
            $.getJSON(cms.c.ck("api/getid.php"), function(data) {
                var mo = {
                    title: "menu new",
                    id: data.id,
                    action: "",
                    target: "",
                    sub: []
                };
                cms.w.menueditor.buildeditor(mo, 0);
            });
        } else {
            cms.w.menueditor.buildeditor(mo, 0);
        }

    },

    buildeditor: function(o, parent) {

        cms.c.pl.hide();

        var code = [];
        code.push("<div class='menueditor'>");
        code.push("<div class='row'><label>title</label><input class='title' value='" + o.title + "'></div>");
        code.push("<div class='row'><label>target</label>");
        code.push("<input type='hidden' class='id' value='" + o.id + "'>");
        code.push("<select class='target'>");

        var targets = [
            ["", "none"],
            ["_top", "_top"],
            ["_blank", "_blank"]
        ];

        for (var i = 0; i < targets.length; i++) {
            var selected = "";
            if (targets[i][0] == o.target) {
                selected = " selected";
            }
            code.push("<option value='" + targets[i][0] + "'" + selected + ">" + targets[i][1] + "</option>");
        }

        code.push("</select>")
        code.push("</div>");
        code.push("<div class='row'><label>linkurl</label><input class='action' value='" + o.action + "'></div>");
        code.push(cms.c.btn("save", "save"));
        code.push("</div>");
        $("#content").append(code.join(""));

        $('.menucontainer').hide();

        $(".save").click(function() {
            var elm = $(".menucontainer .listitem[data-id='" + $(".menueditor .id").val() + "']");
            if (elm.length > 0) {
                elm.attr("data-target", $(".menueditor .target").val());
                elm.attr("data-action", $(".menueditor .action").val());
                elm.children(".title").text($(".menueditor .title").val());
            } else {
                if (parent != 0) {
                    $(".menucontainer .listitem[data-id='" + parent + "']").children(".sub").append("<div class='listitem' data-id='" + $(".menueditor .id").val() + "' data-target='" + $(".menueditor .target").val() + "' data-action='" + $(".menueditor .action").val() + "'><span class='title'>" + $(".menueditor .title").val() + "</span><a class='remove'>x</a><a class='addsub'>add sub</a><div class='clearline'></div><div class='sub'></div></div>");
                } else {
                    $(".menucontainer").append("<div class='listitem' data-id='" + $(".menueditor .id").val() + "' data-target='" + $(".menueditor .target").val() + "' data-action='" + $(".menueditor .action").val() + "'><span class='title'>" + $(".menueditor .title").val() + "</span><a class='remove'>x</a><a class='addsub'>add sub</a><div class='clearline'></div><div class='sub'></div></div>");
                }
            }
            cms.w.menueditor.saveAsView();
        });

    },
    saveAsView:function(){
    cms.c.pl.show();
    var menuNew = [];
    menuNew = goMenu($("#content > .menucontainer > .listitem"));

    function goMenu(from) {
        var tmp = [];
        from.each(function() {
            var elm = $(this);
            tmp.push({
                title: elm.children(".title").text(),
                id: elm.attr("data-id"),
                target: elm.attr("data-target"),
                action: elm.attr("data-action"),
                sub: goMenu(elm.children('.sub').children('.listitem'))
            });
        });
        return tmp;
    }
    cms.w.menu.data.menu = menuNew;
    $.post("api/savejson.php?file=__sitelist.json", {
            data: JSON.stringify(cms.w.menu.data)
        })
        .done(function(data) {
            cms.w.menu.create();
    });
  }
},

// Files
cms.w.files= {
    dir:"uploads/",
    startdir:"uploads/",
    selectmode:"no",
    handle:function(){},
    create: function(dir, selectmode="no", handle=function(){}) {

      cms.w.files.selectmode=selectmode;
      cms.w.files.handle=handle;

      if(dir!=undefined && dir!=""){
        cms.w.files.dir=dir;
      }else{
        cms.w.files.dir=cms.w.files.startdir;
      }
      cms.w.start.menu.mark("files");

      var code=[];
      code.push('<div class="filemanager">');
        code.push('<div class="nav"><div class="folder"></div>');
        code.push('<h2>Create new Folder</h2>');
        code.push('<input class="foldername" placeholder="name of new folder">');
        code.push(cms.c.btn(" create new folder","newfolder"));
        code.push("<br>"+cms.c.btn("delete","delete")+'</div>');
        code.push("<h2>upload new files</h2>");
        code.push('<div class="uploader"></div>');
        if(selectmode!="no"){
          code.push(cms.c.btn("select files","select_f"))
        }
        code.push('<div class="files"></div>');
      code.push('<div>');
      if(selectmode=="no"){
        $("#content").html(code.join(""));
      }else{
        $("#content .filemanager").remove();
        $("#content").append(code.join(""));
      }

      cms.w.files.addFolderNav();

      $.getJSON(cms.c.ck("data/__settings.json"), function(data) {
          $('.uploader').ajaxUploader(true,function(){cms.w.files.create(cms.w.files.dir,cms.w.files.selectmode,cms.w.files.handle)},cms.w.files.dir,data.imageformats);
      });
      cms.c.pl.show();

      $.getJSON(cms.c.ck("api/getdirlist.php?dir="+cms.w.files.dir), function(data) {
          cms.w.files.addFiles(data);
      });
      // Selectmode button
      $('.filemanager .select_f').click(function(){
        var files=[];
        $(".filemanager .file.selected").each(function(){
          files.push($(this).attr("data-path"));
        });
        handle(files);
      });

      $('.filemanager .newfolder').click(function(){
        var newdir=cms.w.files.dir+$(".filemanager .foldername").val()+"/";
        cms.c.pl.show();
        $.getJSON(cms.c.ck("api/createfolder.php?dir="+newdir), function(data) {
            cms.w.files.create(newdir,cms.w.files.selectmode,cms.w.files.handle);
        });
      });

      $(".filemanager .delete").click(function(){

        var toDelete=[];
        var thumps=[];
        $(".filemanager .files .file.selected").each(function(){
          if($(this).hasClass("image")){
            var parts=$(this).attr("data-path").split("/");
            var thumppath="";
            for(var i=0; i<parts.length-1; i++){
              thumppath+=parts[i];
            }
            var gallerythumppath=thumppath+"/thumps/gallery_"+parts[parts.length-1];
            thumppath+="/thumps/"+parts[parts.length-1];
            thumps.push(thumppath);
            thumps.push(gallerythumppath);
          }
          toDelete.push($(this).attr("data-path"));
        });
        var r = confirm("Delete "+toDelete.length+" files?");
        if (r == true) {
          cms.c.pl.show();
          $.getJSON(cms.c.ck("api/delete.php?files="+toDelete+","+thumps), function(data) {
              cms.w.files.create(cms.w.files.dir,cms.w.files.selectmode,cms.w.files.handle);
          });
        }
      });


    },
    addFolderNav:function(){
      var at="";
      var path=cms.w.files.dir.split("/");
      var navCode=[];
      for(var i=0; i<path.length-1; i++){
        at+=path[i]+"/";
        navCode.push('<a data-path="'+at+'">'+path[i]+'</a>');
      }
      if(path.length>2)navCode.push(cms.c.btn("delete folder","deletefolder"));
      $('.filemanager > .nav > .folder').html(navCode.join(""));
      $('.filemanager > .nav > .folder > a').click(function(){
        cms.w.files.create($(this).attr("data-path"),cms.w.files.selectmode,cms.w.files.handle);
      });
      $('.filemanager .deletefolder').click(function(){
        var folderToDelete=$(".filemanager .nav .folder a").last().attr("data-path");
        var r=confirm("delete folder: "+folderToDelete+"?");
        if(r){
          $.getJSON(cms.c.ck("api/deletedir.php?dir="+folderToDelete), function(data) {
              cms.w.files.create("uploads/",cms.w.files.selectmode,cms.w.files.handle);
          });
        }
      });

    },
    addFiles:function(data){
      cms.c.pl.hide();

      for(var i=0; i<data.files.length; i++){
        var type=getType(data.files[i]);
        if(data.files[i]!="." && data.files[i]!=".." && data.files[i]!="thumps"){
          var parts=data.files[i].split("/");
          data.files[i]=parts[parts.length-1];
          var style="";
          if(type=="image"){
            style='style="background:url(\''+cms.w.files.dir+"thumps/"+data.files[i]+'\')"';
          }
          $('#content > .filemanager > .files').append('<div class="file '+type+'" '+style+' data-path="'+cms.w.files.dir+data.files[i]+'"><div class="title">'+data.files[i]+'</div></div>')
        }
      }
      $('#content > .filemanager .files').append('<div class="clear"></div>');
      $('.filemanager .files .file').click(function(){
        if($(this).hasClass("folder")){
          cms.w.files.create($(this).attr("data-path")+"/",cms.w.files.selectmode,cms.w.files.handle);
        }else{
          if(cms.w.files.selectmode=="single"){
            $(".filemanager .file.selected").removeClass("selected");
          }
          if($(this).hasClass("selected")){
            $(this).removeClass("selected");
          }else{
            $(this).addClass("selected");
          }
        }
      });

      function getType(file){

        var parts=file.split(".");
        var ext=parts[parts.length-1];

        if(ext=="" || parts.length==1){
          return "folder";
        }else{

          var types=[["text",["doc","odt","txt","docx","html","json"]],["image",["jpg","png","gif","jpeg"]],["archive",["zip","7z","tar","gz","rar"]]];

          for(var i=0; i<types.length; i++){
            var type=types[i][0];

            for(var j=0; j<types[i][1].length; j++){
              if(types[i][1][j]==ext){
                return type;
                break;
              }
            }

          }

        }

      }


    }

}

cms.w.settings={
  create:function(){

    cms.w.start.menu.mark("settings");

    $.getJSON(cms.c.ck("data/__settings.json"), function(data) {
        cms.w.settings.build(data);
    });

  },
  build:function(data){

    cms.c.pl.hide();
    var code=[];

    code.push("<h1>image formats</h1>");
    code.push("<h3>gallery thumps</h3>");
    code.push(formatselect("galleryformat",data.imageformats.gallery[0]));
    code.push("<div id='gallerysize'><input class='width' value='"+data.imageformats.gallery[1]+"'><input class='height' value='"+data.imageformats.gallery[2]+"'></div>");
    code.push("<h3>big</h3>");
    code.push(formatselect("bigformat",data.imageformats.big[0]));
    code.push("<div id='bigsize'><input class='width' value='"+data.imageformats.big[1]+"'><input class='height' value='"+data.imageformats.big[2]+"'></div>");
    code.push(cms.c.btn("save","save"));

    $("#content").html(code.join(""));

    function formatselect(name,selected){
      var c=[];
      c.push("<select id='"+name+"'>");
      c.push("<option value='fitin'");
      if(selected=="fitin")c.push(" selected");
      c.push(">fitin</option>");
      c.push("<option value='crop'");
      if(selected=="crop")c.push(" selected");
      c.push(">crop</option>");
      c.push("</select>");
      return c.join("");
    }

    $("#content .save").click(function(){
      var o={};
      o.imageformats={};
      o.imageformats.gallery=[$("#galleryformat").val(),$("#gallerysize .width").val(),$("#gallerysize .height").val()];
      o.imageformats.big=[$("#bigformat").val(),$("#bigsize .width").val(),$("#bigsize .height").val()];
      cms.c.pl.show();
      $.post("api/savejson.php?file=__settings.json", {
              data: JSON.stringify(o)
          })
          .done(function(data) {
              cms.w.settings.create();
          });
    })

  }
}
