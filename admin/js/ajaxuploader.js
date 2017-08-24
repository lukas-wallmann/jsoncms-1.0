var ajaxUploaderInstace=0;
$.fn.ajaxUploader = function(multiple,done,error,dir) {

    ajaxUploaderInstace++;

    var instance=this;
    instance.files=[];
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
      $(".ajaxUploader_"+instance.uploaderID).on('submit', uploadFiles);
    }
    function prepareUpload (evt){
      var files = evt.target.files; // FileList object

      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        reader.onload = (function(theFile) {
          return function(e) {
            // Render thumbnail.
            if (theFile.type=="image/jpeg") {
              resize(e.target.result,[200,200],"thump_"+theFile.name,callback);
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
    function uploadFiles(event){
          event.stopPropagation();
          event.preventDefault();

          var data = new FormData();
          $.each(instance.files, function(key, value){
              data.append(key, value);
          });

          $.ajax({
          	xhr: function() {
              var xhr = new window.XMLHttpRequest();
              xhr.upload.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {
                  var percentComplete = Math.round(evt.loaded / evt.total*100);
                  $(".ajaxUploader_"+instance.uploaderID+" .preloader .bar").width(percentComplete+"%");
                } }, false);
              xhr.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {
                  var percentComplete = evt.loaded / evt.total * 100;
                  $(".ajaxUploader_"+instance.uploaderID+" .preloader .bar").width(percentComplete+"%");
                }
              }, false);
               return xhr;
          },
              url: 'api/uploadfile.php?dir='+instance.dir+'&files',
              type: 'POST',
              data: data,
              cache: false,
              dataType: 'json',
              processData: false, // Don't process the files
              contentType: false, // Set content type to false as jQuery will tell the server its a query string request
              success: function(data, textStatus, jqXHR){
                  if(typeof data.error === 'undefined'){
                    instance.done(data);
                  }else{
                      // Handle errors here
                    instance.error(data.error);
                  }
              },
              error: function(jqXHR, textStatus, errorThrown){
                  instance.error( textStatus);
              }
          });
      }



    build();
    return this;
}
