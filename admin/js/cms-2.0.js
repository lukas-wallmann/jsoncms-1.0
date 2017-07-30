var cms={

//initialize cms

  initialize:function(){

  },

//Core Functions

  c:{
    ck: function(url) {
        var ck = new Date().getTime() + cms.c.gT(4);
        if (url.split("?").length == 1) {
            return url + "?ck=" + ck;
        } else {
            return url + "&ck=" + ck;
        }
    },
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
    btn: function(name, cl) {
        return "<button class='" + cl + "'>" + name + "</button>";
    },
    gT: function(l) {
        var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
        var token = [];
        for (var i = 0; i < l; i++) {
            token.push(chars.charAt(Math.round(Math.random() * chars.length)));
        }
        return token.join("");
    },
    gFFT: function(t) {
        t = t.toLowerCase();
        t = t.replace(/[^a-zA-Z0-9 ]/g, "");
        t = t.split(" ").join("-");
        t = t.split("---").join("-");
        t = t.split("--").join("-");
        t = t + ".json";
        return t;
    }
  },


// WINDOWS

  w:{

  }



}

cms.c.pl=function(){
  alert("preloader");
};

cms.c.pl();
