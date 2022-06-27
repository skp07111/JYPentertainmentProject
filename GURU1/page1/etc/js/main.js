function loadYouTubeVideos(){
    var $list = $(".youtube-wrap .sliderkit-nav-clip ul");

    $.get(
        "/process/YouTubeList.ashx",
        { count: 8 },
        function(data){
            $list.empty();

            $.each(data.dataList, function(i, oDATA){
                var tags = '';
                tags += '<figure>';
                tags += '    <img src="' + oDATA.ThumbImage + '" width="120" height="90" alt="' + oDATA.VideoTitle + '" class="clip-img" />';
                tags += '    <figcaption>' + oDATA.VideoTitle + '</figcaption>';
                tags += '    <a class="play" href="#">Play</a>';
                tags += '    <span class="over">';
                tags += '        <span class="type"><img src="images/mv_caption.gif" alt="music video" /></span>';
                tags += '        <span class="featby">' + oDATA.VideoTitle + '</span>';
                tags += '    </span>';
                tags += '</figure>';


                if( window.innerShiv )
                    tags = innerShiv(tags, false);


                $("<li />")
                    .append(tags)
                    .click(function(e){
                        e.preventDefault();

                        showYouTubeVideo(oDATA);
                    })
                    .appendTo( $list );

            });

            $(".thumbil-std").sliderkit({
                mousewheel: true,
                shownavitems: 4,
                panelbtnshover: false,
                auto: false,
                circular: true,
                navscrollatend: false
            });
        },
        "json"
    );
}


var $window = $(window);
var $document = $(document);

var $player = null;
var $dialog = null;

var $disableArea = null;


var $caption = null;
var $videoArea = null;
var $timeline = null;

var oYouTubePlayer = null;
var timer = null;
var playerLoaded = false;


// 영상 플레이어 초기화..!
function initVideoPlayer( oDATA ){
    $player
        .find(".close")
            .click(function(e){
                e.preventDefault();
                closeVideo();
            })
        .end()
        .find("#playbtn")
            .click(function(e){
                e.preventDefault();
                playVideo();
            })
        .end()
        .find("#pausebtn")
            .click(function(e){
                e.preventDefault();
                pauseVideo();
            })
        .end()
        .find("#stopbtn")
            .click(function(e){
                e.preventDefault();
                stopVideo();
            })
        .end();


    playerLoaded = false;

    $caption = $player.find(".youtube-data .caption");
    $timeline = $player.find(".youtube-timeline");
    $videoArea = $player.find(".youtube-data .video");

    $caption.text( oDATA.VideoTitle );
    $videoArea.html('<div id="ytapiplayer">You need Flash player 8+ and JavaScript enabled to view this video.</div>');
}

// 영상 플레이어 닫기
function closeVideo(){
    if( playerLoaded && (oYouTubePlayer != null) ){
        oYouTubePlayer.stopVideo();
        oYouTubePlayer.clearVideo();

        swfobject.removeSWF("YouTubePlayer");
    }

    if( timer != null )
        window.clearInterval(timer);

    $player.remove();
}

// 유튜브 영상 보기..!
function showYouTubeVideo ( oDATA ){
    if( /iphone|ipad|ipod|android/gmi.test(navigator.userAgent) ){
        window.open( "https://m.youtube.com/watch?v=" + oDATA.VideoId );
    } else{
        //$player = loadDialog("/popup/recent-video.html", 720, 450, function(){
        //	var params = { allowScriptAccess: "always", allowFullScreen: "true" };
        //	var atts = { id: "YouTubePlayer" };
        //	swfobject.embedSWF("http://www.youtube.com/v/" + oDATA.VideoId + "?version=3&enablejsapi=1&controls=1&autoplay=1&autohide=0&cc_load_policy=0", "ytapiplayer", 600, 450, "8", null, null, params, atts);
        //});
        
        //initVideoPlayer( oDATA );
        window.open( "https://m.youtube.com/watch?v=" + oDATA.VideoId );
    }
}