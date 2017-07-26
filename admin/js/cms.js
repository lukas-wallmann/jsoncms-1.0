// JSON CMS by Lukas Wallmann
// Code under open source free to use License

var cms = {
    initialize: function() {
        cms.window.start.create();
    },
    core: {
        addCK: function(url) {
            var ck = new Date().getTime() + cms.core.getToken(4);
            if (url.split("?").length == 1) {
                return url + "?ck=" + ck;
            } else {
                return url + "&ck=" + ck;
            }
        },
        preloader:{
          show:function(){
            if($("#preloader").length==0){
              $("body").append("<div id='preloader'><span>loading...</span></div>");
            }
          },
          hide:function(){
            $("#preloader").remove();
          }
        },
        getToken: function(l) {
            var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
            var token = [];
            for (var i = 0; i < l; i++) {
                token.push(chars.charAt(Math.round(Math.random() * chars.length)));
            }
            return token.join("");
        },
        getFilenameFromTitle: function(t) {
            t = t.toLowerCase();
            t = t.replace(/[^a-zA-Z0-9 ]/g, "");
            t = t.split(" ").join("-");
            t = t.split("---").join("-");
            t = t.split("--").join("-");
            t = t + ".json";
            return t;
        },
    },
    window: {
        button: function(name, cl) {
            return "<button class='" + cl + "'>" + name + "</button>";
        },
        start: {
            create: function() {
                var code = [];
                code.push("<div id='main'>");
                code.push("<nav>" + cms.window.start.menu.create() + "</nav>");
                code.push("<div id='content'></div>");
                code.push("<div class='footer'>JSON CMS by Lukas Wallmann</div>")
                code.push("</div>");
                $("body").append(code.join(""));
                cms.window.start.menu.activate();
                cms.window.site.create();
            },

            menu: {
                create: function() {
                    var code = [];
                    var points = ["site", "menu", "files", "newsletter"];
                    for (var i = 0; i < points.length; i++) {
                        code.push("<a class='" + points[i] + "'>" + points[i] + "</a>");
                    }
                    return code.join("");
                },
                activate: function() {
                    $("nav a").click(function() {
                        $("nav a").removeClass("active");
                        var c = $(this).attr("class");
                        var f = eval("cms.window." + c + ".create");
                        f();
                    });
                },
                mark: function(c) {
                    $("nav a").removeClass("active");
                    $("nav a." + c).addClass("active");
                }
            }

        },
        site: {

            data: {},

            create: function() {
                cms.window.start.menu.mark("site");
                cms.core.preloader.show();
                $.getJSON(cms.core.addCK("data/__sitelist.json"), function(data) {
                    cms.window.site.list(data);
                    cms.window.site.data = data;
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
              cms.window.site.data.sites=tmp;
              cms.core.preloader.show();
              $.post("api/savejson.php?file=__sitelist.json", {
                      data: JSON.stringify(cms.window.site.data)
                  })
                  .done(function(data) {
                      cms.window.site.create();
                  });

            },

            list: function(data) {

                cms.core.preloader.hide();

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
                code.push(cms.window.button("new site", "newsite"));

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
                    cms.window.siteeditor.create("new");
                });
                $("#content > .listitem > .title").click(function() {
                    cms.window.siteeditor.create($(this).parent().attr("data-id"));
                });
                $('.listitem .up').click(function(){
                  var elm=$(this).parent();
                  var elmat=elm.prev();
                  while(elmat.css("display")=="none"){
                    elmat=elmat.prev();
                  }
                  elm.insertBefore(elmat);
                  cms.window.site.saveAsView();
                });
                $('.listitem .down').click(function(){
                  var elm=$(this).parent();
                  var elmat=elm.next();
                  while(elmat.css("display")=="none"){
                    elmat=elmat.next();
                  }
                  elm.insertAfter(elmat);
                  cms.window.site.saveAsView();
                });
                $(".listitem .remove").click(function() {
                  var r = confirm("Delete?");
                  if (r == true) {
                    var elm = $(this);
                    cms.core.preloader.show();
                    var deleteFile=elm.parent().attr("data-file");
                    $.getJSON(cms.core.addCK("data/__sitelist.json"), function(datas) {
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
                                cms.window.site.create();
                            });
                    });
                  }
                });
            }
        },
        siteeditor: {
            data:{},
            isnew:false,
            scrollTo:"",
            create: function(id) {
                if (id == "new") {
                    cms.core.preloader.show();
                    $.getJSON(cms.core.addCK("api/getid.php"), function(data) {
                        cms.window.siteeditor.getdata(data.id, true, "");
                    });
                } else {
                    cms.core.preloader.show();
                    $.getJSON(cms.core.addCK("data/__sitelist.json"), function(data) {

                        var file = "";
                        for (var i = 0; i < data.sites.length; i++) {
                            if (data.sites[i].id == id) {
                                file = data.sites[i].file;
                            }
                        }
                        cms.window.siteeditor.getdata(id, false, file);
                    });
                }
            },
            getdata: function(id, isnew, file) {
                if (isnew) {
                    cms.window.siteeditor.isnew=true;
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
                    cms.window.siteeditor.build(data);
                } else {
                    $.getJSON(cms.core.addCK("data/" + file), function(data) {
                        cms.window.siteeditor.build(data);
                    });
                }
            },
            build: function(data) {
                cms.core.preloader.show();
                cms.window.siteeditor.data=data;
                $.getJSON(cms.core.addCK("data/__sitelist.json"), function(d) {
                    var code = [];
                    cms.core.preloader.hide();
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
                    code.push(cms.window.button("new element","newelement"))
                    code.push("</div>");
                    code.push("<div class='contents'>");
                    code.push("</div>");
                    code.push(cms.window.button("save", "save"));
                    code.push("</div>");
                    $("#content").html(code.join(""));
                    cms.window.siteeditor.getContents(data.content);
                    $("#content .fixsiteparts .title").on('change', function() {
                        $("#content .fixsiteparts .file").val(cms.core.getFilenameFromTitle($(this).val()));
                    });
                    $("#content .fixsiteparts .title").keyup(function() {
                        $("#content .fixsiteparts .file").val(cms.core.getFilenameFromTitle($(this).val()));
                    });
                    $(".save").click(function() {
                        cms.window.siteeditor.saveData(true);
                    });
                    $(".newelement").click(function(){
                      cms.window.siteeditor.saveData(false,true);
                      cms.window.siteeditor.newelement();
                    });
                });
            },
            newelement:function(){
              //$(".siteeditor").hide();

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

              $(".newelement a").click(function(){
                cms.window.siteeditor.scrollTo="last";
              });

              $(".newelement .text").click(function(){
                cms.window.siteeditor.data.content.push({type: "text",content: "This is a text"})
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .code").click(function(){
                cms.window.siteeditor.data.content.push({type: "code",content: "This is code"})
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .text_image").click(function(){
                cms.window.siteeditor.data.content.push({type: "text_image",content: {image:"",text:"this is text",align:"left"}});
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .image").click(function(){
                cms.window.siteeditor.data.content.push({type: "image",content: {image:"",description:"description text here"}});
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .video").click(function(){
                cms.window.siteeditor.data.content.push({type: "video",content:"www.youtube.com"});
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .html").click(function(){
                cms.window.siteeditor.data.content.push({type: "html",content:"html here"});
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .headline").click(function(){
                cms.window.siteeditor.data.content.push({type: "headline",content:{type:2,content:"new headline"}});
                cms.window.siteeditor.build(cms.window.siteeditor.data)
              });

              $(".newelement .gallery").click(function(){
                cms.window.siteeditor.data.content.push({type: "gallery", content:[]});
                cms.window.siteeditor.build(cms.window.siteeditor.data);
              });

              $(".newelement .downloads").click(function(){
                cms.window.siteeditor.data.content.push({type: "downloads", content:[]});
                cms.window.siteeditor.build(cms.window.siteeditor.data);
              });


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
                            code.push("<div class='item image' data-type='image'><div class='nav'><h2>image</h2><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='imageuploader'></div><img src='"+data[i].content.image+"'><div class='description'><label>description</label><input type='text' value='"+data[i].content.description+"' class='desc'></div></div></div>")
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
                if(cms.window.siteeditor.scrollTo=="last"){
                  $('html, body').animate({
                    scrollTop: $(".siteeditor > .contents > .item").last().offset().top
                  }, 500);
                }else{
                  console.log("scrollto:");
                  console.log(cms.window.siteeditor.scrollTo);

                  if(cms.window.siteeditor.scrollTo.length>0){
                    console.log(cms.window.siteeditor.scrollTo);
                    $('html, body').animate({
                      scrollTop: $(cms.window.siteeditor.scrollTo).offset().top
                    }, 500);
                  }
                }

              var dd=1;

              function resetNav(){
                $('.item .nav a').show();
                $('.siteeditor > .contents > .item').first().find(".nav .up").hide();
                $('.siteeditor > .contents > .item').last().find(".nav .down").hide();
                $('.gallerycontent, .downloads').each(function(){
                  $(this).find('.nav a').show();
                  $(this).find('.itm').first().find(".nav .up").hide();
                  $(this).find('.itm').last().find(".nav .down").hide();
                })
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
                  cms.window.siteeditor.saveData(false);
                  fixFuckingEditor();
                });
                $('.siteeditor > .contents > .item > .nav > .up, .siteeditor > .contents > .item > .nav > .down').click(function(){
                    cms.window.siteeditor.scrollTo=$(this).parent().parent();
                    $('html, body').animate({
                       scrollTop: cms.window.siteeditor.scrollTo.offset().top
                   }, 500)
                });
                $('.siteeditor > .contents > .item .itm .up, .siteeditor > .contents > .item .itm .down, .siteeditor > .contents > .item .itm .delete').click(function(){
                    //cms.window.siteeditor.scrollTo=$(this).parent().parent().parent().parent();
                    //console.log(cms.window.siteeditor.scrollTo);
                    $('html, body').scrollTop(cms.window.siteeditor.scrollTo);

                });
              }
              $('.imageuploader').append(cms.window.button("select image / add image","select_f"));
              $('.galleryuploader').append(cms.window.button("select images / add images","select_f"));
              $('.downloadsuploader').append(cms.window.button("select files / add files","select_f"));

              $('.downloadsuploader .select_f').click(function(){
                $('.siteeditor').hide();
                var elm=$(this).parent().parent();
                cms.window.files.create("uploads/","multi",function(data){
                  for(var i=0; i<data.length; i++){

                    elm.find(".downloadcontent").append("<div class='itm'><div class='nav'><a class='up'>up</a><a class='down'>down</a><a class='delete'>delete</a></div><div class='filename'>"+data[i]+"</div><input type='text' value='"+data[i].split("/")[data[i].split("/").length-1]+"'></div>");
                  }
                  $('.siteeditor').show();
                  $('.filemanager').remove();
                  refreshElmFunctions();
                  resetNav();
                });
              });
              $('.galleryuploader .select_f').click(function(){
                $('.siteeditor').hide();
                var elm=$(this).parent().parent();
                cms.window.files.create("uploads/","multi",function(data){
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
                });
              });

              $('.imageuploader .select_f').click(function(){
                $('.siteeditor').hide();
                var elm=$(this).parent().parent();
                cms.window.files.create("uploads/","single",function(data){
                  elm.find("img").attr("src",data[0]);
                  $('.siteeditor').show();
                  $('.filemanager').remove();
                  refreshElmFunctions();
                  resetNav();
                });
              });

              //Set Scroll Position to scroll back
              function setScrollTop(){

                cms.window.siteeditor.scrollTo=$('body').scrollTop();
                if(cms.window.siteeditor.scrollTo==0)  cms.window.siteeditor.scrollTo=$('html').scrollTop();

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

                dd=dd+1;
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
                o.file = getUniqueFilename($(".fixsiteparts .file").val(),cms.window.site.data.sites);
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
                if(cms.window.siteeditor.isnew==false && cms.window.siteeditor.data.file!=o.file){
                  deleteFile=cms.window.siteeditor.data.file;
                }
                cms.window.siteeditor.data=o;
                if(toFile && !tmp){
                cms.core.preloader.show();
                $.post("api/savejson.php?file=" + o.file+"&delete="+deleteFile, {
                        data: JSON.stringify(o)
                    })
                    .done(function(data) {
                        $.getJSON(cms.core.addCK("data/__sitelist.json"), function(data) {
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
                                    cms.window.site.create();
                                });
                        });

                    });
                  }
            }


        },
        menu: {
            data: {},

            create: function() {
                cms.core.preloader.show();
                cms.window.start.menu.mark("menu");
                $.getJSON(cms.core.addCK("data/__sitelist.json"), function(data) {
                    cms.window.menu.list(data);
                    cms.window.menu.data = data;
                });
            },

            list: function(data) {

                cms.core.preloader.hide();

                code = [];

                code.push("<div class='menucontainer'>")
                    //Menu select
                code.push(cms.window.button("new menu", "newmenu"));

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
                    cms.window.menueditor.create(data, "new");
                })
                $(".listitem .title").click(function() {
                    cms.window.menueditor.create(data, $(this).parent().attr("data-id"));
                });
                $(".listitem .remove").click(function() {
                  var r = confirm("Delete?");
                  if (r == true) {
                    $(this).parent().remove();
                    cms.window.menueditor.saveAsView();
                  }

                });
                $('.listitem .up').click(function(){
                  var elm=$(this).parent();
                  var elmat=elm.prev();
                  while(elmat.css("display")=="none"){
                    elmat=elmat.prev();
                  }
                  elm.insertBefore(elmat);
                  cms.window.menueditor.saveAsView();
                });
                $('.listitem .down').click(function(){
                  var elm=$(this).parent();
                  var elmat=elm.next();
                  while(elmat.css("display")=="none"){
                    elmat=elmat.next();
                  }
                  elm.insertAfter(elmat);
                  cms.window.menueditor.saveAsView();
                });
                $(".listitem .addsub").click(function() {
                    var elm = $(this).parent();
                    cms.core.preloader.show();
                    $.getJSON(cms.core.addCK("api/getid.php"), function(data) {
                        var mo = {
                            title: "menu subnew",
                            id: data.id,
                            action: "",
                            target: "",
                            sub: []
                        };
                        cms.window.menueditor.buildeditor(mo, elm.attr("data-id"));
                    });
                });
            }
        },
        menueditor: {
            create: function(data, id) {
                cms.core.preloader.hide();
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
                    cms.core.preloader.show();
                    $.getJSON(cms.core.addCK("api/getid.php"), function(data) {
                        var mo = {
                            title: "menu new",
                            id: data.id,
                            action: "",
                            target: "",
                            sub: []
                        };
                        cms.window.menueditor.buildeditor(mo, 0);
                    });
                } else {
                    cms.window.menueditor.buildeditor(mo, 0);
                }

            },
            buildeditor: function(o, parent) {
                cms.core.preloader.hide();
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
                code.push(cms.window.button("save", "save"));
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
                    cms.window.menueditor.saveAsView();
                });

            },
            saveAsView:function(){
            cms.core.preloader.show();
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
            cms.window.menu.data.menu = menuNew;
            $.post("api/savejson.php?file=__sitelist.json", {
                    data: JSON.stringify(cms.window.menu.data)
                })
                .done(function(data) {
                    cms.window.menu.create();
            });
          }
        },
        files: {
            dir:"uploads/",
            startdir:"uploads/",
            selectmode:"no",
            handle:function(){},
            create: function(dir, selectmode="no", handle=function(){}) {

              cms.window.files.selectmode=selectmode;
              cms.window.files.handle=handle;

              if(dir!=undefined && dir!=""){
                cms.window.files.dir=dir;
              }else{
                cms.window.files.dir=cms.window.files.startdir;
              }
              cms.window.start.menu.mark("files");

              var code=[];
              code.push('<div class="filemanager">');
                code.push('<div class="nav"><div class="folder"></div><h2>Create new Folder</h2><input class="foldername" placeholder="name of new folder"></input>'+cms.window.button(" create new folder","newfolder")+"<br>"+cms.window.button("delete","delete")+'</div>');
                code.push("<h2>upload new files</h2>");
                code.push('<div class="uploader"></div>');
                if(selectmode!="no"){
                  code.push(cms.window.button("select files","select_f"))
                }
                code.push('<div class="files"></div>');
              code.push('<div>');
              if(selectmode=="no"){
                $("#content").html(code.join(""));
              }else{
                $("#content .filemanager").remove();
                $("#content").append(code.join(""));
              }

              cms.window.files.addFolderNav();

              $('.uploader').ajaxUploader(true,function(){cms.window.files.create(cms.window.files.dir,cms.window.files.selectmode,cms.window.files.handle)},function(data){alert("upload error:"+data)},cms.window.files.dir);

              cms.core.preloader.show();

              $.getJSON(cms.core.addCK("api/getdirlist.php?dir="+cms.window.files.dir), function(data) {
                  cms.window.files.addFiles(data);
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
                var newdir=cms.window.files.dir+$(".filemanager .foldername").val()+"/";
                cms.core.preloader.show();
                $.getJSON(cms.core.addCK("api/createfolder.php?dir="+newdir), function(data) {
                    cms.window.files.create(newdir,cms.window.files.selectmode,cms.window.files.handle);
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
                    thumppath+="/thumps/"+parts[parts.length-1];
                    var gallerythumppath=thumppath+"/thumps/gallery_"+parts[parts.length-1];
                    thumps.push(thumppath);
                    thumps.push(gallerythumppath);
                  }
                  toDelete.push($(this).attr("data-path"));
                });
                var r = confirm("Delete "+toDelete.length+" files?");
                if (r == true) {
                  cms.core.preloader.show();
                  $.getJSON(cms.core.addCK("api/delete.php?files="+toDelete+","+thumps), function(data) {
                      cms.window.files.create(cms.window.files.dir,cms.window.files.selectmode,cms.window.files.handle);
                  });
                }
              });


            },
            addFolderNav:function(){
              var at="";
              var path=cms.window.files.dir.split("/");
              var navCode=[];
              for(var i=0; i<path.length-1; i++){
                at+=path[i]+"/";
                navCode.push('<a data-path="'+at+'">'+path[i]+'</a>');
              }
              if(path.length>2)navCode.push(cms.window.button("delete folder","deletefolder"));
              $('.filemanager > .nav > .folder').html(navCode.join(""));
              $('.filemanager > .nav > .folder > a').click(function(){
                cms.window.files.create($(this).attr("data-path"),cms.window.files.selectmode,cms.window.files.handle);
              });
              $('.filemanager .deletefolder').click(function(){
                var folderToDelete=$(".filemanager .nav .folder a").last().attr("data-path");
                var r=confirm("delete folder: "+folderToDelete+"?");
                if(r){
                  $.getJSON(cms.core.addCK("api/deletedir.php?dir="+folderToDelete), function(data) {
                      cms.window.files.create("uploads/",cms.window.files.selectmode,cms.window.files.handle);
                  });
                }
              });

            },
            addFiles:function(data){
              cms.core.preloader.hide();

              for(var i=0; i<data.files.length; i++){
                var type=getType(data.files[i]);
                if(data.files[i]!="." && data.files[i]!=".." && data.files[i]!="thumps"){
                  var parts=data.files[i].split("/");
                  data.files[i]=parts[parts.length-1];
                  var style="";
                  if(type=="image"){
                    style='style="background:url('+cms.window.files.dir+"thumps/"+data.files[i]+')"';
                  }
                  $('#content > .filemanager > .files').append('<div class="file '+type+'" '+style+' data-path="'+cms.window.files.dir+data.files[i]+'"><div class="title">'+data.files[i]+'</div></div>')
                }
              }
              $('#content > .filemanager .files').append('<div class="clear"></div>');
              $('.filemanager .files .file').click(function(){
                if($(this).hasClass("folder")){
                  cms.window.files.create($(this).attr("data-path")+"/",cms.window.files.selectmode,cms.window.files.handle);
                }else{
                  if(cms.window.files.selectmode=="single"){
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

        },
        newsletter: {
            data:[],
            create: function() {
                cms.window.start.menu.mark("newsletter");
                cms.core.preloader.show();
                $.getJSON(cms.core.addCK("/admin/data/__newsletterlist.json"), function(data) {
                  cms.window.newsletter.data=data;
                  cms.window.newsletter.build();
                });
            },
            build:function(){
              var code=[];
              code.push("<div class='newsletter'>");
                code.push("<div class='topnav'>"+cms.window.button("Newsletters","newsletters")+cms.window.button("Receivers","receivers")+"</div>");
                code.push("<div class='newslettercontent'></div>")
              code.push("</div>");
              $("#content").html(code.join(""));
              $('.newsletter > .topnav > .newsletters').click(cms.window.newsletter.buildnewsletterlist);
              $('.newsletter > .topnav > .receivers').click(cms.window.newsletter.buildReceiverlist);
              cms.window.newsletter.buildnewsletterlist();
            },
            buildnewsletterlist:function(){
              cms.core.preloader.hide();
              var data=cms.window.newsletter.data.newsletters;
              var code=[];
              code.push("<div class='secnav'>"+cms.window.button("new newsletter","new")+"</div>");
              code.push("<div class='list'>");
              for(var i=0; i<data.length; i++){
                code.push("<div class='item' data-src='"+data[i].file+"'><span class='title'>"+data[i].title+"</span><a class='delete'>delete</a></div>");
              }
              code.push("</div>");
              $('.newslettercontent').html(code.join(""));
              $('.newslettercontent > .secnav > .new').click(function(){
                cms.window.newsletter.buildNewsletterEditor("new");
              });
              $('.newslettercontent > .list > .item > .title').click(function(){
                cms.window.newsletter.buildNewsletterEditor($(this).parent().attr("data-src"));
              });
            },
            buildNewsletterEditor:function(file){
              alert("build newslettereditor:"+file);
              if(file=="new"){

              }else{

              }
              function handleData(){

              }
            },
            buildReceiverlist:function(){
              cms.core.preloader.hide();
              var data=cms.window.newsletter.data.receiverlists;
              var code=[];
              code.push("<div class='secnav'>"+cms.window.button("new receiverlist","new")+"</div>");
              code.push("<div class='list'>");
              for(var i=0; i<data.length; i++){
                code.push("<div class='listitem' data-src='receiverlist_"+data[i].id+".json' data-id='"+data[i].id+"'><span class='title'>"+data[i].title+"</span><a class='remove'>delete</a></div>");
              }
              code.push("</div>");
              $('.newslettercontent').html(code.join(""));
              $('.newslettercontent > .secnav > .new').click(function(){
                cms.window.newsletter.buildReceiverlistEditor("new");
              });
              $('.newslettercontent > .list > .listitem > .title').click(function(){
                cms.window.newsletter.buildReceiverlistEditor($(this).parent().attr("data-src"));
              });
              $('.newslettercontent > .list > .listitem > .remove').click(function(){
                var id=$(this).parent().attr("data-id");
                var newData=[];
                for(var i=0; i<cms.window.newsletter.data.receiverlists.length; i++){
                  if(cms.window.newsletter.data.receiverlists[i].id!=id){
                    newData.push(cms.window.newsletter.data.receiverlists[i]);
                  }
                }
                cms.window.newsletter.data.receiverlists=newData;
                $.post("api/savejson.php?file=__newsletterlist.json&delete=receiverlist_"+id+".json", {
                  data: JSON.stringify(cms.window.newsletter.data)
                }).done(function(){
                  cms.window.newsletter.buildReceiverlist();
                })
              });
            },
            buildReceiverlistEditor:function(file){
              if(file=="new"){

                $.getJSON(cms.core.addCK("api/getid.php"), function(data) {
                  var o={title:"new receiverlist",id:data.id,receivers:[]};
                  var o2={title:"new receiverlist",id:data.id};
                  cms.window.newsletter.data.receiverlists.push(o2);
                  handleData(o);
                });

              }else{

                $.getJSON(cms.core.addCK("api/crypt.php?mode=get&file="+file), function(data) {
                  handleData(data);
                });

              }

              function handleData(o){
                var code=[]
                code.push("<div class='receiverList'>");
                  code.push("<input class='title' placeholder='title of reiceiver list' type='text' value='"+o.title+"'>");
                  code.push("<textarea placeholder='receivers one per line'>"+o.receivers.join("\r\n")+"</textarea>");
                  code.push("<input type='hidden' class='id' value='"+o.id+"'>");
                  code.push(cms.window.button("save","save"));
                code.push("</div>");
                $(".newslettercontent").html(code.join(""));
                $(".receiverList .save").click(function(){
                  cms.core.preloader.show();
                  for(var i=0; i<cms.window.newsletter.data.receiverlists.length; i++){
                    if(cms.window.newsletter.data.receiverlists[i].id==$(".receiverList .id").val()){
                      cms.window.newsletter.data.receiverlists[i].title=$(".receiverList .title").val();
                    }
                  }
                  $.post("api/savejson.php?file=__newsletterlist.json", {
                    data: JSON.stringify(cms.window.newsletter.data)
                  });
                  var listdata={};
                  listdata.id=$(".receiverList .id").val();
                  listdata.title=$(".receiverList .title").val();
                  listdata.receivers=$(".receiverList textarea").val().split("\n");
                  console.log(listdata.receivers);
                  $.post("api/crypt.php?mode=save&file=receiverlist_"+$(".receiverList .id").val()+".json", {
                    data: JSON.stringify(listdata)
                  }).done(function(){
                    cms.window.newsletter.buildReceiverlist();
                  });
                });
              }
            }
        }
    }

}
