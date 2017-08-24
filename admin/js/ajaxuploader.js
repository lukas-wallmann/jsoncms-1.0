var ajaxUploaderInstace=0;
$.fn.ajaxUploader = function(multiple,done,error,dir) {

    ajaxUploaderInstace++;

    var instance=this;
    instance.files=[];
    instance.at=0;
    instance.done=done;
    instance.error=error;
    instance.uploaderID=ajaxUploaderInstace;
    instance.dir=dir;

    function build(){
      var code=[];
      code.push("<form class='ajaxUploader_"+ajaxUploaderInstace+"'>");
      var multi="";
      if(multiple)multi="multiple";
      code.push('<input type="file" '+multi+'>');
      code.push('<button type="submit">upload</button>');
      code.push('<div class="preloader"><div class="bar"></div></div>');
      code.push('</form>');
      instance.html(code.join(""));
      $(".ajaxUploader_"+instance.uploaderID+" input[type=file]").on('change', prepareUpload);
      $(".ajaxUploader_"+instance.uploaderID).on('submit', startupload);
    }
    function prepareUpload (evt){
      instance.at=0;
      instance.files=[];
      var files = evt.target.files; // FileList object

      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e) {
            // Render thumbnail.
            if (theFile.type=="image/jpeg") {
              resize(e.target.result,[200,200],"thumps/"+theFile.name,callback);
              resize(e.target.result,[1920,1080],theFile.name,callback);
            }else{
              callback(e.target.result,theFile.name)
            }
          };
        })(f);

        reader.readAsDataURL(f);
      }
    }
    function callback(data,filename){
      instance.files.push([filename,data]);
    }
    function resize(url,info=[1920,1080],name="file.jpg",callback=function(){},q=0.8){
      var image = new Image();
      image.onload = function (imageEvent) {

          // Resize the image
          var canvas = document.createElement('canvas'),
              width = image.width,
              height = image.height,
              widthto=image.info[0],
              heigthto=image.info[1],
              relw = widthto/width,
              relh = heigthto/height;

          if (relh > relw) {
              relto=relw;
          } else {
              relto=relh;
          }
          width*=relto;
          height*=relto;
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(image, 0, 0, width, height);
          var dataUrl = canvas.toDataURL('image/jpeg',q);
          callback(dataUrl,image.name);
      }

      image.src = url
      image.info=info;
      image.name=name;
    }
    function startupload(event){
          event.stopPropagation();
          event.preventDefault();
          upload();
    }

    function upload(){
      console.log(instance.files[instance.at][0]);
      $.post( 'api/uploadfile.php?dir='+instance.dir, { filename: instance.files[instance.at][0], data:instance.files[instance.at][1]  } ).done(function(){
        instance.at++;
        $(".ajaxUploader_"+instance.uploaderID+" .preloader .bar").width((instance.at/instance.files.length*100)+"%");
        if(instance.at<instance.files.length){
          upload();
        }else{
          instance.done();
        }
      });
    }

    build();
    return this;
}
