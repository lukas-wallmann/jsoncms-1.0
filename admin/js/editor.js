var editortemplate="<a href='#' data-command='undo'><i class='fa fa-undo'></i></a><a href='#' data-command='redo'><i class='fa fa-repeat'></i></a></div><a href='#' data-command='bold'><i class='fa fa-bold'></i></a><a href='#' data-command='italic'><i class='fa fa-italic'></i></a><a href='#' data-command='underline'><i class='fa fa-underline'></i></a><a href='#' data-command='strikeThrough'><i class='fa fa-strikethrough'></i></a><a href='#' data-command='justifyLeft'><i class='fa fa-align-left'></i></a><a href='#' data-command='justifyCenter'><i class='fa fa-align-center'></i></a><a href='#' data-command='justifyRight'><i class='fa fa-align-right'></i></a><a href='#' data-command='justifyFull'><i class='fa fa-align-justify'></i></a><a href='#' data-command='indent'><i class='fa fa-indent'></i></a><a href='#' data-command='outdent'><i class='fa fa-outdent'></i></a><a href='#' data-command='insertUnorderedList'><i class='fa fa-list-ul'></i></a><a href='#' data-command='insertOrderedList'><i class='fa fa-list-ol'></i></a><a href='#' data-command='h1'>H1</a><a href='#' data-command='h2'>H2</a><a href='#' data-command='createlink'><i class='fa fa-link'></i></a><a href='#' data-command='unlink'><i class='fa fa-unlink'></i></a><a href='#' data-command='subscript'><i class='fa fa-subscript'></i></a><a href='#' data-command='superscript'><i class='fa fa-superscript'></i></a>";

$.fn.Editor = function() {
    $(this).find(".toolbar").html(editortemplate);

    $('.toolbar a').click(function(e) {
      e.preventDefault();
      var command = $(this).data('command');
      if (command == 'h1' || command == 'h2' || command == 'p') {
        document.execCommand('formatBlock', false, command);
      }
      if (command == 'forecolor' || command == 'backcolor') {
        document.execCommand($(this).data('command'), false, $(this).data('value'));
      }
      if (command == 'createlink' || command == 'insertimage') {
        url = prompt('Enter the link here: ', 'http:\/\/');
        document.execCommand($(this).data('command'), false, url);
      } else document.execCommand($(this).data('command'), false, null);
    });
}
