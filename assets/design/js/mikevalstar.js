/* 
	Welcome to my Javascript 

	Please vist mikevalstar.com for an explination 
	about how some of the below is done.
*/

var MV = {};

MV.nav = {
	transform: function(){
		$('#Nav>ul>li').animate({ height: '50', paddingTop: '25', paddingBottom: '25' }, 700, function(){
			$('#Nav').removeClass('ex');
			$("#NTwitter div li:not(.tweet_first)").remove();
		});
		$('#C').removeClass('hide');
	}
};


$(function(){
	// Initialize page

	// Initialize the navigation
	$('#NBlog a').click(function(e){
		e.preventDefault();
		MV.nav.transform();
	});
	$('#NProjects a').click(function(e){
		e.preventDefault();
		MV.nav.transform();
	});
	$('#NAbout a').click(function(e){
		e.preventDefault();
		MV.nav.transform();
	});

	// Initialize twitter feed
	$("#NTwitter div").tweet({
        username: "mikevalstar",
        join_text: "auto",
        avatar_size: 48,
        count: $('#Nav.ex').length == 0 ? 1 : 6,
        loading_text: "loading tweets..."
    });
});