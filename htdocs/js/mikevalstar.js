/*
	Welcome to my Javascript

	Please vist mikevalstar.com for an explination
	about how some of the below is done.
*/

var disqus_shortname = 'mikevalstar'; // required: replace example with your forum shortname
var disqus_identifier = 'bp_0';
var disqus_url = 'http://mikevalstar.com/';

var MV = {};

MV.content = {};


$(function(){
	// Initialize twitter feed
	$("#twitter").tweet({
        username: "mikevalstar",
        join_text: "auto",
        avatar_size: 48,
        count: 8,
        loading_text: "loading tweets...",
        finishedLoading: function(){
            $('#twitter li:not(:first)').hide();
            $('#twitter li:first').prepend("<a href='#' class='expand'><i class='icon-chevron-down'></i></a>");
            $('#twitter li:first .expand').click(function(e){
                e.preventDefault();
                $('#twitter li:not(:first)').toggle();
                if($(this).find('i').hasClass('icon-chevron-down')){
                    $(this).find('i').addClass('icon-chevron-up').removeClass('icon-chevron-down');
                }else{
                    $(this).find('i').addClass('icon-chevron-down').removeClass('icon-chevron-up');
                }
            });
        }
    });
});