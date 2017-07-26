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
    function prepareUpload (event){
        instance.files = event.target.files;
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
