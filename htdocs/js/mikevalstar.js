/* 
	Welcome to my Javascript 

	Please vist mikevalstar.com for an explination 
	about how some of the below is done.
*/

var MV = {};

MV.nav = {
	  isExpanded: function(){
	  	return $('.ex').length > 0;
	  }
	, transform: function(){
		if(!MV.nav.isExpanded()) return; // already shrunk
		
		$('#Nav>ul>li').animate({ height: '50', paddingTop: '25', paddingBottom: '25' }, 700, function(){
			$('#Nav').removeClass('ex');
			$("#NTwitter div li:not(.tweet_first)").remove();
		});
		$('#C').removeClass('hide');
	}
};

MV.content = {
	load: function(hash, fn){
		if(!hash || hash == '') return; // nothing to do; main page
		
		MV.nav.transform(); // transform the navigation if needed
		
		$('#CC').html('Loading Content...');
	
		var url = (hash[0] == '#') ? '/' + hash.substring(1): '/' + hash;
		$('#CC').load(url + ' #CC', fn);
	}
}


$(function(){
	// Initialize page

	// Initialize the navigation
	$('#NBlog a').click(function(e){
		e.preventDefault();
		MV.content.load('#Blog', function(){
			var links = $('#CC a[href^="/"]');
			$.each(links, function(i, val){
				$(val).attr('href', '#' + $(val).attr('href').substring(1) );
				});
		});
	});
	$('#NProjects a').click(function(e){
		e.preventDefault();
		MV.content.load('#Projects');
	});
	$('#NAbout a').click(function(e){
		e.preventDefault();
		MV.content.load('#About');
	});

	// Initialize twitter feed
	$("#NTwitter div").tweet({
        username: "mikevalstar",
        join_text: "auto",
        avatar_size: 48,
        count: $('#Nav.ex').length == 0 ? 1 : 6,
        loading_text: "loading tweets..."
    });
    
    // initialize the hash lookup
    $(window).hashchange( function(){
		MV.content.load( location.hash );
	});
	$(window).hashchange();
});