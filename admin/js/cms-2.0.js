var cms={

//initialize cms

  initialize:function(){

  },

//Core Functions

  c:{

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
    btn: function(name, cl) {
        return "<button class='" + cl + "'>" + name + "</button>";
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

  }



}

cms.c.pl=function(){
  alert("preloader");
};

cms.c.pl();
