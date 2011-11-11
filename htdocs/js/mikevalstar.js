/* 
	Welcome to my Javascript 

	Please vist mikevalstar.com for an explination 
	about how some of the below is done.
*/

var disqus_shortname = 'mikevalstar'; // required: replace example with your forum shortname
var disqus_identifier = 'bp_0';
var disqus_url = 'http://mikevalstar.com/';

script.defaults.defer = true;
script.defaults.base = 'http://gist.github.com';

var MV = {};

MV.nav = {
	  isExpanded: function(){
	  	return $('.ex').length > 0;
	  }
	  
	, transform: function(quick){
		if(!MV.nav.isExpanded()) return; // already shrunk
		
		if(quick){ 
			$('#Nav').removeClass('ex');
			$("#NTwitter div li:not(.tweet_first)").remove();
			$('#C').removeClass('hide');
			return;
		}
		
		$('#Nav>ul>li').animate({ height: '50', paddingTop: '25', paddingBottom: '25' }, 700, function(){
			$('#Nav').removeClass('ex');
			$("#NTwitter div li:not(.tweet_first)").remove();
			$('#Nav>ul>li').css('height', '').css('paddingTop', '').css('paddingBottom', '');
		});
		$('#C').removeClass('hide');
	}
};

MV.content = {
	  load: function(hash, fn, transform){
		if(!hash || hash == '') return; // nothing to do
		
		MV.nav.transform(transform); // transform the navigation if needed
		
		$('#CC').html('Loading Content...');
		
		var callback = function(responseText, textStatus, XMLHttpRequest){
			if($('#disqus_thread').length == 1)
				MV.content.loadDisqus();
				
			MV.content.loadGist();
			$(document).attr('title',  $(responseText).filter('title').text());
			
			if(fn) fn();
		}
	
		var url = (hash[0] == '#') ? hash.substring(2): hash;
		$('#C').load(url + ' #CC', callback);
	}
	
	,  loadDisqus: function(){
		disqus_identifier = $('#disqus_identity').html();
		disqus_url = $('#disqus_permalink a').attr('href');
		/* * * DON'T EDIT BELOW THIS LINE * * */
		var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
		dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
	
	}
	
	, loadGist: function(){
		var gists = $('.gistC');
		$.each(gists, function(){
			script({src: $(this).attr('id'), append: $(this).attr('id')});
		});
	}
}


$(function(){
	// Initialize page
	$("a").live("click", function(event){
	    var href = $(this).attr("href");
	    if(href[0] == "/" 
			&& href.substring(href.length - 4) != '.png'
			&& href.substring(href.length - 4) != '.jpg'
			&& href.substring(href.length - 5) != '.jpeg'
			&& href.substring(href.length - 4) != '.gif'
			&& !(href.indexOf('usrimg') > 0)
			&& !(href.indexOf('usrfiles') > 0)
				){
	        event.preventDefault();
	        window.location.hash = "#!" + href;
	    }
	});

	// Initialize twitter feed
	$("#NTwitter div").tweet({
        username: "mikevalstar",
        join_text: "auto",
        avatar_size: 48,
        count: $('#Nav.ex').length || (location.hash && location.hash != '') == 0 ? 1 : 6,
        loading_text: "loading tweets..."
    });
    
    // initialize the hash lookup
    $(window).hashchange( function(){
		MV.content.load( location.hash );
	});
	MV.content.load( location.hash, false, true );
});