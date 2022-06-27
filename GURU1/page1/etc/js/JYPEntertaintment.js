var JYP = {};


// TODO : 서브페이지간의 전환 시 좌측의 2depth 메뉴는 남겨둔 채 내용만 변경하기..
(function($){
    var $window = $(window);
    var $document = $(document);
    var $wrapper = null;
    var $loading = null;
    var $disableArea = null;

    var $target = null;
    var $container = null;

    var $content = null;
    var currentPageUrl = null;

    var bLoading = false;

    // 페이지 전환 시, 불러들일 html 구조의 wrapper..
    var matchClassName = "layout-content-frame";


    var arrUnloadHandler = new Array();



    var settings = {
        container: null,
        size: { width:980, height:760 },
        direction: 1,
        animation: "swing",
        speed: 600,
        defaultUrl: "/Main.aspx",
        defaultUrlSize: { width:"100%", height:675 },
        adjustSize: true,
        loadingMessage: '<img src="/images/ajax-loader.gif" alt="Loading" title="Loading" />',
        loadCallback: function(){ }
    };


    var methods = {
        directions: { left:-1, right:1, top:-2, bottom:2 },
        init: function(target, options){
            if( options )
                $.extend(settings, options);

            $wrapper = $(".sub-outside-subwrap");
            $wrapper.css({ overflow:"hidden" });

            $container = target;
            $container.css({ margin:0, padding:0, position:"relative", overflow:"hidden" });


            var defaultPageUrl = (JYP.stripHash() || settings.defaultUrl);
            JYP.changePage(defaultPageUrl);






            var timer = null;

            $window.bind("resize.JYP.frameLoader", function () {
                if( timer != null )
                    window.clearTimeout(timer);

                timer = window.setTimeout(function(){
                    var width = ((settings.defaultUrl == currentPageUrl) ? $window.width() : settings.size.width);
                    var height = (($content != null) ? $content.height() : $container.height());

                    JYP.changeSize(width, height);
                }, 200);

            });


            methods.observeHashChange();

            return methods;
        },



        // HTML 페이지 구조 가져오기..!
        loadHtmlPage: function( src, method, params ){
            method = (method || "GET");

            var value = '';

            $.ajax({
                url: src,
                type: method,
                dataType: "html",
                async: false,
                success: function(html) {
                    value = html;
                },
                error: function(html){
                    alert("\"" + src + "\" 페이지를 읽을 수 없습니다!");
                }
            });

            return value;
        },




        // 레이어 페이지 열기..!
        loadDialog: function( src, width, height, loadCallback ){
            var html = JYP.loadHtmlPage( src );
            var bodyTags = html.split(/<\/?body[^>]*>/gmi)[1];

            var $dialog = $("<div />").prependTo("body").hide();
            $dialog.append( ((typeof(innerShiv) == "function") ? $(innerShiv(bodyTags, false)) : $(bodyTags)) );

            //var top = (($window.height() - height) / 3);
            var top = 100;
            var left = (($window.width() - width) / 2);

            methods.showDisableArea();

            $dialog
                    .stop()
                    .css({ position:"absolute", top:top, left:left, width:0, height:0, zIndex:($disableArea.css("zIndex")+5) })
                    .show()
                    .animate(
                        { top:top, left:left, width:width, height:height },
                        function () {
                            if( typeof(loadCallback) == "function" )
                                loadCallback( $dialog, src );
                        }
                    );


            $window.bind("resize.dialog", function () {
                //top = (($window.height() - height) / 3);
                top = 100;
                left = (($window.width() - width) / 2);

                $dialog.stop().animate({ top: top, left: left });
            });


            return $dialog;
        },



        // 레이어 페이지 닫기..!
        closeDialog: function( $dialog, callback ){
            $dialog.hide();
            methods.hideDisableArea();

            if( typeof(callback) == "function" )
                callback( $dialog );
        },




        // 페이지 이동
        changePage: function( src, callback ){
            if( bLoading || (currentPageUrl == src) )
                return;

            if( ($container == null) || ($container.length != 1) ){
                if( path.isExternal(src) )
                    window.open(src);
                else
                    window.location.href = src;

                return;
            }

            if( path.isExternal(src) ){
                window.open(src);
                return;
            }


            currentPageUrl = src;
            methods.showLoading();





            var html = methods.loadHtmlPage( src );
            var title = methods.parseHtmlTitle(html);
            var bodyTags = html.split(/<\/?body[^>]*>/gmi)[1];
            var $body = ((typeof(innerShiv) == "function") ? $( innerShiv(bodyTags, false) ) : $(bodyTags));
            $body.remove("header").remove("footer");

            $container.children().css({ zIndex: -1 }).remove();
            $container.empty();

            document.title = title;


            // 페이지 이동 위치에 따른 시작 좌표값 설정..!
            var startPosition = { top:0, left:0 };

            switch( settings.direction ){
                case methods.directions.left:
                    startPosition.left = settings.size.width;
                    break;

                case methods.directions.right:
                    startPosition.left = (-1 * settings.size.width);
                    break;

                case methods.directions.top:
                    startPosition.top = settings.size.height;
                    break;

                case methods.directions.bottom:
                    startPosition.top = (-1 * settings.size.height);
                    break;
            }



            var contentsTags = $body.find("section." + matchClassName).html();

            $content = $("<section />")
                                    .css({ width:settings.size.width, height:settings.defaultUrlSize.height, position:"absolute", top:startPosition.top, left:startPosition.left, zIndex:10 })
                                    .append( ((typeof(innerShiv) == "function") ? innerShiv(contentsTags, false) : contentsTags) )
                                    .find(".contents-wrap").css({ backgroundColor:"#ffffff" }).end()
                                    .find("a")
                                        .unbind("click")
                                        .click(function(e){
                                            methods.captureLink( $(this), e );
                                        })
                                    .end()
                                    .find("area")
                                        .unbind("click")
                                        .click(function(e){
                                            methods.captureLink( $(this), e );
                                        })
                                    .end()
                                    .appendTo( $container );



            // 컨텐츠 내용중에 iframe이 포함된 경우, div 요소로 영역만 차지하게 대체한다.
            var arrContentIframes = new Array();

            if( $content.find("iframe").size() > 0 ){
                $content.find("iframe").each(function(i, iframe){
                    var $iframe = $(iframe);
                    var $replace = $('<div />').css({ width:$iframe.width(), height:$iframe.height() });

                    arrContentIframes.push({ iframe:$iframe.clone(), replacement:$replace });

                    $iframe.replaceWith($replace).remove();
                });

            }


            $content.find(".contents-wrap").css({ backgroundColor:"#ffffff" });



            /* JYP: IE6에서 contents-wrap 영역이 밀리는 현상 패치.. */
            if( $.browser.msie && ($.browser.version < 8) ){
				$content.find(".note").css("height",parseInt($content.find(".contents-wrap").css("height"))+700);
                $content.find(".artist-wrap .contents-wrap").css({ position:"static", top:0, left:(($.browser.version < 7) ? 140 : 143) });
                $content.find(".artist-wrap .profile-tab").css({ margin:0, left:420 });
                $content.find(".artist-wrap .album-caption, .artist-wrap .album-info").css({ marginLeft:0, left:467 });
            }






            if( settings.adjustSize ){
                if( settings.defaultUrl == src )
                    methods.changeSize($window.width(), settings.defaultUrlSize.height );
                else
                    methods.changeSize(settings.size.width, settings.size.height );
            }



            if( typeof(settings.loadCallback) == "function" )
                settings.loadCallback( $content, src );


            $content
                .animate(
                    { top:0, left:0 },
                    settings.speed,
                    settings.animation,
                    function(){

                        document.title = title;

                        $content.css({ position:"static", zIndex:0 });

                        if( settings.adjustSize ){
                            var contentsHeight = (($content.children().height() < settings.size.height) ? ((settings.defaultUrl == src) ? settings.defaultUrlSize.height : settings.size.height) : ($content.children().height() + 40));
                            methods.changeSize( ((settings.defaultUrl == src) ? $window.width() : settings.size.width), contentsHeight );
                        }




                        // div 요소로 대체된 iframe을 다시 불러들인다.
                        if( arrContentIframes.length > 0 ){
                            $.each(arrContentIframes, function(i, oDATA){
                                oDATA.replacement.replaceWith( oDATA.iframe );
                            });
                        }


                        methods.changeHash(src);
                        $("html, body").animate({ scrollTop:0 });

                        if( typeof(callback) == "function" )
                            callback( $content, src, contentsTags );

                        methods.hideLoading();







                        window.setTimeout(function(){
                            methods.importJavascriptFiles(html);

                            $content.find("section").each(function(i, item){
                                methods.dispatchLoadEvent( $(item) );
                            });

                        }, 200);


                        if( arrUnloadHandler.length > 0 ){
                            $.each(arrUnloadHandler, function(i, func){
                                try{
                                    func();

                                } catch(e){ }
                            });

                            arrUnloadHandler = new Array();
                        }

                    }
                );

        },



        // 컨텐츠페이지에서 다른 URL로 이동할 때 실행될 기능을 추가한다.
        bindUnloadHandler: function( func ){
            if( typeof(func) == "function" )
                arrUnloadHandler.push( func );
        },



        // 서브페이지에서의 링크 설정
        captureLink: function($anchor, event){
            event.preventDefault();

            var linkUrl = ( $anchor.attr("href") || "" );
            var target = ( $anchor.attr("target") || "" );


            if( (linkUrl == "#") || ($.trim(linkUrl) == "") || (linkUrl == ("http://" + document.domain + (path.parseUrl(linkUrl).port ? (":" + path.parseUrl(linkUrl).port) : "") + "/#")) || (linkUrl == ("http://" + document.domain + (path.parseUrl(linkUrl).port ? (":" + path.parseUrl(linkUrl).port) : "") + "/")) ) {
                event.preventDefault();

            } else if( methods.isSameDomain(linkUrl) && !(($.trim(target) != "") && (target != "_self")) ){
                if( currentPageUrl && (path.parseUrl(currentPageUrl).directory == path.parseUrl(linkUrl).directory) ){
                    methods.changePage( path.parseUrl(linkUrl).pathname + path.parseUrl(linkUrl).search );

                } else{
                    methods.changePage( path.parseUrl(linkUrl).pathname + path.parseUrl(linkUrl).search );
                }

            } else if( linkUrl.indexOf("javascript:") < 0 ){
                window.open( linkUrl );
            }

        },


        // 노드에서 로드시점에 발생할 이벤트정의를 찾아 있을경우 이벤트를 발생시킨다.
        dispatchLoadEvent: function( $node ){
            var loadFunction = $node.data("load");

            if( loadFunction != null )
                dispatchFunction(loadFunction, $node.data("param"));


            function dispatchFunction(functionName){
                var fn = (typeof(eval(functionName)) == "function") ? eval(functionName) : window[functionName];
                return fn.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        },



        importJavascript: function( scriptUrl ){
            var $script = $('<script type="text/javascript" language="javascript" src="' + scriptUrl + '"></script>');
            $script.appendTo("head");
        },


        // html 태그요소에서 자바스크립트 파일을 분석하여, 실행시킨다.
        importJavascriptFiles: function( html ){
            $.each(html.match( /<script[^>]*>([^<]*)/gmi ), function(i, script){
                if( $.trim(script) != "" ){
                    var $script = $(script);
                    var scriptUrl = path.parseUrl($script.attr("src")).pathname;

                    if( !isExists(scriptUrl) ){
                        methods.importJavascript( scriptUrl );
                    }
                }

            });



            function isExists( src ){
                var bool = false;

                $("script").each(function(ii, script){
                    if( path.parseUrl($(script).attr("src")).pathname.toLowerCase() == src.toLowerCase() )
                        bool = true;
                });

                return bool;
            }
        },




        // html 태그요소에서 타이틀 영역의 값을 가져온다.
        parseHtmlTitle: function( html ){
            var value = html.match( /<title[^>]*>([^<]*)/ )[1];
            value = value.replaceAll("\r\n", "");

            return value;
        },







        // 서브페이지 간의 화면전환 정의..!
        setSubPageNavigator: function( navigatorClassName ){
            if( $container != null ){
                var $navigator = $container.find("nav." + navigatorClassName);

                $navigator
                    .find("a")
                        .unbind("click")
                        .click(function(e){
                            e.preventDefault();

                            JYP.captureLink( $(this), e );
                        })
                    .end()
                    .find("span")
                        .unbind("click")
                        .click(function(e){
                            $(this).parent().find("a").trigger("click");
                        })
                    .end();

            }
        },








        // 해쉬값이 변경될 때 페이지 전환시킨다.
        observeHashChange: function(){


            $window
                .bind("hashchange", function(e){
                    var url = methods.stripHash();

                    if( url && (currentPageUrl != url) ){
                        methods.changePage( path.parseUrl(url).pathname + path.parseUrl(url).search );
                    }
                });
        },


        // 현재 페이지 반환
        currentPage: function(){
            return $content;
        },


        // 현재 페이지 URL 반환
        currentPageUrl: function(){
            return currentPageUrl;
        },


        // location 에서 해쉬값 분리
        stripHash: function(){
            if( window.location.href.indexOf("#") > 0 )
                return window.location.href.substring(window.location.href.indexOf("#")+1);
            else
                return "";
        },


        // hashchange 이벤트를 무효화시키고 hash 값을 변경한다.
        changeHash: function(url){
            $window.unbind("hashchange");
			//_PL(location.hostname+url);
            window.location.hash = "#" + url;
            currentPageUrl = url;

            methods.observeHashChange();
        },


        parseUrl: function( url ){
            return path.parseUrl( url );
        },



        hasParentWindow: function(){
            return ((window.parent != null) && (window.parent != window) && (window.parent.JYP.frameLoader != null));
        },


        // 로딩바 보이기
        showLoading: function(modal){
            if( modal == null )
                modal = true;


            if( $loading == null ){
                $loading = $("<div />")
                                        .css({ position:"absolute", top:(($window.height() / 2) + $(document).scrollTop()), left:"50%", zIndex:10000 })
                                        .html(settings.loadingMessage)
                                        .hide()
                                        .appendTo("body");
            }

/*
            if( modal )
                methods.showDisableArea();
*/

            bLoading = true;
            $loading.show();
        },


        // 로딩바 감추기
        hideLoading: function(modal){
            if( modal == null )
                modal = true;
/*
            if( modal )
                methods.hideDisableArea();
*/

            bLoading = false;

            try{
                $loading.hide();
            } catch(e){};
        },



        showDisableArea: function(){
            if( $disableArea == null ){
                $disableArea = $("<div />").prependTo("body");
                $disableArea.css({ position:"absolute", top:0, left:0, background:"#000000", opacity:0.2, zIndex:1000 }).hide();

                $window.bind("resize.JYP.frameLoader.disabledArea", function () {
                    width = $window.width() - 5;
                    height = $document.height() - 5;

                    $disableArea.css({ width: width, height: height });
                });
            }


            var width = $window.width() - 5;
            var height = $document.height() - 5;

            $disableArea.css({ width:width, height:height }).show();
        },


        hideDisableArea: function(){
            $disableArea.fadeOut();
        },


        // 동일 도메인인지 여부를 반환
        isSameDomain: function( url ){
            if( url.indexOf("http://") < 0 )
                url = ("http://" + document.domain + (documentUrl.port ? (":" + documentUrl.port) : "") + url);


            var u = path.parseUrl( url );
            return (u.domain == documentUrl.domain);
        },


        // 페이지 크기변경..
        changeSize: function(width, height){
            if( $container == null ){
                $("." + matchClassName).css({ width:width, height:height });

            } else{
                $wrapper.add($container).add($content).css({ width:width });
                $content.css({ height:height });

                if( $.browser.msie && (parseInt($.browser.version, 10) < 7) ){
                    $wrapper.add($container).css({ height:height });
                } else{
                    $wrapper.add($container).stop().animate({ height:height }, "fast");
                }

            }
        },


        // 페이지 크기 반환..!
        getContentSize: function(){
            if( $container == null ){
                return { width: $("." + matchClassName).width(), height: $("." + matchClassName).height() };

            } else{
                return { width:$container.width(), height:$container.height() };
            }
        },


        isLoading: function(){
            return bLoading;
        },


        printLog: function( msg ){
            try{
                console.log(msg);

            } catch(e){};
        }
    };






    //url path helpers for use in relative url management
    var path = {

        // This scary looking regular expression parses an absolute URL or its relative
        // variants (protocol, site, document, query, and hash), into the various
        // components (protocol, host, path, query, fragment, etc that make up the
        // URL as well as some other commonly used sub-parts. When used with RegExp.exec()
        // or String.match, it parses the URL into a results array that looks like this:
        //
        //     [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
        //     [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
        //     [2]: http://jblas:password@mycompany.com:8080/mail/inbox
        //     [3]: http://jblas:password@mycompany.com:8080
        //     [4]: http:
        //     [5]: jblas:password@mycompany.com:8080
        //     [6]: jblas:password
        //     [7]: jblas
        //     [8]: password
        //     [9]: mycompany.com:8080
        //    [10]: mycompany.com
        //    [11]: 8080
        //    [12]: /mail/inbox
        //    [13]: /mail/
        //    [14]: inbox
        //    [15]: ?msg=1234&type=unread
        //    [16]: #msg-content
        //
        urlParseRE: /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,

        //Parse a URL into a structure that allows easy access to
        //all of the URL components by name.
        parseUrl: function( url ) {
            // If we're passed an object, we'll assume that it is
            // a parsed url object and just return it back to the caller.
            if ( $.type( url ) === "object" ) {
                return url;
            }

            var u = url || "",
                path.exec( url ),
                results;
            if ( matches ) {
                // Create an object that allows the caller to access the sub-matches
                // by name. Note that IE returns an empty string instead of undefined,
                // like all other browsers do, so we normalize everything so its consistent
                // no matter what browser we're running on.
                results = {
                    href:         matches[0] || "",
                    hrefNoHash:   matches[1] || "",
                    hrefNoSearch: matches[2] || "",
                    domain:       matches[3] || "",
                    protocol:     matches[4] || "",
                    authority:    matches[5] || "",
                    username:     matches[7] || "",
                    password:     matches[8] || "",
                    host:         matches[9] || "",
                    hostname:     matches[10] || "",
                    port:         matches[11] || "",
                    pathname:     matches[12] || "",
                    directory:    matches[13] || "",
                    filename:     matches[14] || "",
                    search:       matches[15] || "",
                    hash:         matches[16] || ""
                };
            }
            return results || {};
        },

        //Turn relPath into an asbolute path. absPath is
        //an optional absolute path which describes what
        //relPath is relative to.
        makePathAbsolute: function( relPath, absPath ) {
            if ( relPath && relPath.charAt( 0 ) === "/" ) {
                return relPath;
            }

            relPath = relPath || "";
            absPath = absPath ? absPath.replace( /^\/|(\/[^\/]*|[^\/]+)$/g, "" ) : "";

            var absStack = absPath ? absPath.split( "/" ) : [],
                relStack = relPath.split( "/" );
            for ( var i = 0; i < relStack.length; i++ ) {
                var d = relStack[ i ];
                switch ( d ) {
                    case ".":
                        break;
                    case "..":
                        if ( absStack.length ) {
                            absStack.pop();
                        }
                        break;
                    default:
                        absStack.push( d );
                        break;
                }
            }
            return "/" + absStack.join( "/" );
        },

        //Returns true if both urls have the same domain.
        isSameDomain: function( absUrl1, absUrl2 ) {
            return path.parseUrl( absUrl1 ).domain === path.parseUrl( absUrl2 ).domain;
        },

        //Returns true for any relative variant.
        isRelativeUrl: function( url ) {
            // All relative Url variants have one thing in common, no protocol.
            return path.parseUrl( url ).protocol === "";
        },

        //Returns true for an absolute url.
        isAbsoluteUrl: function( url ) {
            return path.parseUrl( url ).protocol !== "";
        },

        //Turn the specified realtive URL into an absolute one. This function
        //can handle all relative variants (protocol, site, document, query, fragment).
        makeUrlAbsolute: function( relUrl, absUrl ) {
            if ( !path.isRelativeUrl( relUrl ) ) {
                return relUrl;
            }

            var relObj = path.parseUrl( relUrl ),
                absObj = path.parseUrl( absUrl ),
                protocol = relObj.protocol || absObj.protocol,
                authority = relObj.authority || absObj.authority,
                hasPath = relObj.pathname !== "",
                pathname = path.makePathAbsolute( relObj.pathname || absObj.filename, absObj.pathname ),
                search = relObj.search || ( !hasPath && absObj.search ) || "",
                hash = relObj.hash;

            return protocol + "//" + authority + pathname + search + hash;
        },

        //Add search (aka query) params to the specified url.
        addSearchParams: function( url, params ) {
            var u = path.parseUrl( url ),
                p = ( typeof params === "object" ) ? $.param( params ) : params,
                s = u.search || "?";
            return u.hrefNoSearch + s + ( s.charAt( s.length - 1 ) !== "?" ? "&" : "" ) + p + ( u.hash || "" );
        },

        convertUrlToDataUrl: function( absUrl ) {
            var u = path.parseUrl( absUrl );
            if ( path.isEmbeddedPage( u ) ) {
                // For embedded pages, remove the dialog hash key as in getFilePath(),
                // otherwise the Data Url won't match the id of the embedded Page.
                return u.hash.split( dialogHashKey )[0].replace( /^#/, "" );
            } else if ( path.isSameDomain( u, documentBase ) ) {
                return u.hrefNoHash.replace( documentBase.domain, "" );
            }
            return absUrl;
        },

        //get path from current hash, or from a file path
        get: function( newPath ) {
            if( newPath === undefined ) {
                newPath = location.hash;
            }
            return path.stripHash( newPath ).replace( /[^\/]*\.[^\/*]+$/, '' );
        },

        //return the substring of a filepath before the sub-page key, for making a server request
        getFilePath: function( path ) {
            var splitkey = '&' + $.mobile.subPageUrlKey;
            return path && path.split( splitkey )[0].split( dialogHashKey )[0];
        },

        //set location hash to path
        set: function( path ) {
            location.hash = path;
        },

        //test if a given url (string) is a path
        //NOTE might be exceptionally naive
        isPath: function( url ) {
            return ( /\// ).test( url );
        },

        //return a url path with the window's location protocol/hostname/pathname removed
        clean: function( url ) {
            return url.replace( documentBase.domain, "" );
        },

        //just return the url without an initial #
        stripHash: function( url ) {
            return url.replace( /^#/, "" );
        },

        //remove the preceding hash, any query params, and dialog notations
        cleanHash: function( hash ) {
            return path.stripHash( hash.replace( /\?.*$/, "" ).replace( dialogHashKey, "" ) );
        },

        //check whether a url is referencing the same domain, or an external domain or different protocol
        //could be mailto, etc
        isExternal: function( url ) {
            var u = path.parseUrl( url );
            return u.protocol && u.domain !== documentUrl.domain ? true : false;
        },

        hasProtocol: function( url ) {
            return ( /^(:?\w+:)/ ).test( url );
        },

        isEmbeddedPage: function( url ) {
            var u = path.parseUrl( url );

            //if the path is absolute, then we need to compare the url against
            //both the documentUrl and the documentBase. The main reason for this
            //is that links embedded within external documents will refer to the
            //application document, whereas links embedded within the application
            //document will be resolved against the document base.
            if ( u.protocol !== "" ) {
                return ( u.hash && ( u.hrefNoHash === documentUrl.hrefNoHash || ( documentBaseDiffers && u.hrefNoHash === documentBase.hrefNoHash ) ) );
            }
            return (/^#/).test( u.href );
        }
    };

    var documentUrl = path.parseUrl( location.href );




    $.extend(JYP, settings);
    $.extend(JYP, methods);

})( jQuery );


/*
    ※ 앨범 미리듣기 관련 ※
*/
(function($){

    var oMusicPlayer = null;
    var isAudio = true;
    var status = { stop:0, play:1, pause:2 };

    var currentStatus = 0;
    var currentSoundFile = null;


    function initPlayer(){
        if( /iphone|ipad|ipod|android/gmi.test(navigator.userAgent) ){
            isAudio = true;

            $("<audio />").prependTo("body");
            oMusicPlayer = $("audio").get(0);

        } else{
            isAudio = false;

            var params = { allowScriptAccess: "always" };
            var atts = { id: "PreviewMusicPlayer" };

            swfobject.embedSWF("/swf/MP3Player.swf", "divMusicPlayer", 500, 375, "10", null, null, params, atts);

            window.setTimeout(function(){
                oMusicPlayer = document.getElementById("PreviewMusicPlayer");

            }, 500);
        };

    }


    function loadMusic( soundFile ){
        if( currentSoundFile == soundFile ){
            if( currentStatus == status.play )
                stop();
            else if( currentStatus == status.pause )
                play();
            else
                load(soundFile);

        } else{
            load(soundFile);
        }
    }



    function load( soundFile ){
        if( isAudio ){
            $(oMusicPlayer)
                .html('<source src="' + soundFile + '" type="audio/mpeg" />');

            oMusicPlayer.play();


        } else{
            oMusicPlayer.sndLoad( soundFile );
        }


        currentStatus = status.play;
        currentSoundFile = soundFile;
    }


    function play(){
        if( isAudio ){
            oMusicPlayer.play();
        } else{
            oMusicPlayer.sndPlay();
        }

        currentStatus = status.play;
    }


    function stop(){
        if( isAudio ){
            oMusicPlayer.pause();
        } else{
            oMusicPlayer.sndStop();
        }

        currentStatus = status.stop;
    }


    function pause(){
        if( isAudio ){
            oMusicPlayer.pause();
        } else{
            oMusicPlayer.pause();
        }

        currentStatus = status.pause;
    }


    function setVolume( volume ){
        if( isAudio ){
            oMusicPlayer.volume = volume;
        } else{
            oMusicPlayer.sndVolume(volume);
        }
    }



    $.extend(JYP, {
        initMusicPlayer: initPlayer,
        playMusic: loadMusic,
        pauseMusic: pause,
        stopMusic: stop,

        getSoundFile: function(){
            return currentSoundFile;
        }
    });

})(jQuery);







/*
        ※ AJAX configuration's ※
*/
$(function () {
    $.ajaxSetup({ cache: false });
    $.ajaxPrefilter(function (options) {
        options.global = true;
    });


    $("<div />")
        .ajaxStart(function () {
//            if( !JYP.isLoading() )
                JYP.showLoading(false);
        })
        .ajaxStop(function () {
//            if( !JYP.isLoading() )
                JYP.hideLoading(false);
        });

});


$(function(){
    // call onload event's..
    $("section").each(function(i, item){
        JYP.dispatchLoadEvent( $(item) );
    });
});




/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
//
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
//
// About: Known issues
//
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
//
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
//
// Also note that should a browser natively support the window.onhashchange
// event, but not report that it does, the fallback polling loop will be used.
//
// About: Release History
//
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.

  // Reused string.
  var str_hashchange = 'hashchange',

    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,

    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );

  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };

  // Method: jQuery.fn.hashchange
  //
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  //
  // Usage:
  //
  // > jQuery(window).hashchange( [ handler ] );
  //
  // Arguments:
  //
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  //
  // Returns:
  //
  //  (jQuery) The initial jQuery collection of elements.

  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };

  // Property: jQuery.fn.hashchange.delay
  //
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.

  // Property: jQuery.fn.hashchange.domain
  //
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  //
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  //
  // Usage:
  //
  // jQuery.fn.hashchange.domain = document.domain;

  // Property: jQuery.fn.hashchange.src
  //
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  //
  // Usage:
  //
  // jQuery.fn.hashchange.src = 'path/to/file.html';

  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */

  // Event: hashchange event
  //
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  //
  // Usage as described in <jQuery.fn.hashchange>:
  //
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // >
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  //
  // A more verbose usage that allows for event namespacing:
  //
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // >
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  //
  // Additional Notes:
  //
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.

  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {

    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }

      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },

    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }

      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }

  });

  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,

      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),

      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;

    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };

    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };

    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );

      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );

        $(window).trigger( str_hashchange );

      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }

      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };

    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    $.browser.msie && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.

      var iframe,
        iframe_src;

      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();

          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()

            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })

            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )

            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;

          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };

        }
      };

      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;

      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };

      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;

        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;

          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();

          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );

          iframe_doc.close();

          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };

    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    return self;
  })();

})(jQuery,this);





(function($, undefined) {

  // $('#my-container').imagesLoaded(myFunction)
  // or
  // $('img').imagesLoaded(myFunction)

  // execute a callback when all images have loaded.
  // needed because .load() doesn't work on cached images

  // callback function gets image collection as argument
  //  `this` is the container

  $.fn.imagesLoaded = function( callback ) {
    var $this = this,
        $images = $this.find('img').add( $this.filter('img') ),
        len = $images.length,
        blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    function triggerCallback() {
      callback.call( $this, $images );
    }

    function imgLoaded( event ) {
      if ( --len <= 0 && event.target.src !== blank ){
        setTimeout( triggerCallback );
        $images.unbind( 'load error', imgLoaded );
      }
    }

    if ( !len ) {
      triggerCallback();
    }

    $images.bind( 'load error',  imgLoaded ).each( function() {
      // cached images don't fire load sometimes, so we reset src.
      if (this.complete || this.complete === undefined){
        var src = this.src;
        // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
        // data uri bypasses webkit log warning (thx doug jones)
        this.src = blank;
        this.src = src;
      }
    });

    return $this;
  };
})(jQuery);




$(function(){
    var url = JYP.parseUrl(window.location.href);
	
	if( url.directory != '/' ){
        if( url.search )
            window.location.href = ('/' + url.directory + url.filename + url.search);
        else
            window.location.href = ('/' + url.directory + url.filename);
    }
});

