/*
	Welcome to my Javascript

	Please vist mikevalstar.com for an explination
	about how some of the below is done.
*/

jQuery.event.fixHooks.drop = { props: [ "dataTransfer" ] };

if(typeof MV == 'undefined') var MV = {};

MV.admin = {};

/*******************************
Image List builder for display
*******************************/
MV.admin.imageList = function(list, selectfunc){ this._ele = list; this.init(selectfunc); };
MV.admin.imageList.prototype = {
    _ele: null,
    _onselect: null,
    
    init: function(selectfunc){
        // display the image listing in the element
        var imgListObj = this;
        this._onselect = selectfunc || function(e){e.preventDefault();};
        
        MV.admin.data.images.list(function(data){ imgListObj._fillContainer.call(imgListObj, data); });
        
        // Define drop zone for uploading
        if($('.dropimglead').length > 0){
            $('.dropimglead').on( 'dragenter', function(e) {
                e.preventDefault();
                $(this).html('Drop Here');
            }).on( 'dragover', function(e) {
                // do nothing.. fixes chrome bug
            }).on( 'dragleave', function(e) {
                e.preventDefault();
                $(this).html('Drag a file here to upload');
            }).on( 'drop', function(e){
                e.preventDefault();
                
                $(this).html('Uploading file!!!');
                
                // Send the image to the server
                var self = this;
                MV.admin.data.images.upload('lead', e.dataTransfer.files[0], function(results){
                    $(self).html('File Uploaded.').hide().fadeIn(2000);
                    var reset = function(){ $(self).html('Drag a file here to upload'); };
                    setTimeout(reset, 3000);
                    imgListObj.refresh();
                });
            });
        }
    },
    refresh:function(){
        var self = this;
        MV.admin.data.images.list(function(data){ self._fillContainer.call(self, data); });
    },
    _fillContainer: function(data){
        this._ele.html(''); // clear the gallary
        if(data.images){
            var list = $('<ul></ul>').addClass('thumbnails');
            this._ele.append(list);
            $(data.images).each(function(index, item){
                list.append('<li class="span2"><a href="#" class="thumbnail" data-id="' + item.imageShort + '"><img class="retina" src="' + item.image + '" alt="' + item.imageShort + '" style="height: 150px; width: 150px;" /></a></li>');
            });
            
            this._ele.find('.thumbnail').click(this._onselect);
            
            MV.imageReplace();
        }
    }
};

/*******************************
Data Getters and Setters
*******************************/
MV.admin.data = {
    images: {
        list: function(callback){
            $.get('/Admin/AJAX/Images', callback);
        },
        upload: function(type, file, callback){
            // using:
            // http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
            // http://hacks.mozilla.org/2011/03/the-shortest-image-uploader-ever/
            
            if (!file || !file.type.match(/image.*/)) return; // TODO: present error if non-image
        
            // send form data to image post url
            var fd = new FormData();
            fd.append("image", file);
            fd.append("type", type);
            $.ajax({
                    url: '/Admin/AJAX/Image', 
                    data: fd, 
                    processData: false,
                    contentType: false,
                    type: 'POST'
                }).done(callback);
        }
    }  
};


$(function(){
    if($('#imageListFull').length == 1){
        var bigList = new MV.admin.imageList($('#imageListFull'));
        bigList.refresh();
    }
    
    $('.imageSelector').click(function(e){
        e.preventDefault();
        var self = this;
        var selectList = new MV.admin.imageList($( $(this).attr('data-port') ), function(e){
            e.preventDefault();
            $($(self).attr('data-fill')).val($(this).attr('data-id')); // set the value of the textbox
            $($(self).attr('data-port')).html(''); // hide the images
        });
    });
    
    // convert textarea tabs to the tab character
    $("textarea").keydown(function(e) {
        if(e.keyCode === 9) { // tab was pressed
            // prevent the focus lose
            e.preventDefault();
            
            // get caret position/selection
            var start = this.selectionStart;
            var end = this.selectionEnd;
    
            var $this = $(this);
            var value = $this.val();
    
            // set textarea value to: text before caret + tab + text after caret
            $this.val(value.substring(0, start)
                        + "\t"
                        + value.substring(end));
    
            // put caret at right position again (add one for the tab)
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });
});