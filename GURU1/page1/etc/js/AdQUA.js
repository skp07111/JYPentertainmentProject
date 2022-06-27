var AdQUA = {
    layerFrame: null,
    disabledZone: null,
    loading: null,

    __postCloseFrameAction__: null,



    // 로딩 상태창 보이기..!
    showLoading: function (visible) {
        if (AdQUA.loading == null) {
            AdQUA.loading = $("<div />")
                                .html('<img src="http://www.adqua.co.kr/images/ajax-loader.gif" border="0" />')
                                .css({ position: "absolute", width: 32, height: 32, zIndex: 10010 })
                                .appendTo("body");
        }


        if (visible == true) {
            var $window = $(window);
            var top = (Math.floor($window.height() / 2) + $window.scrollTop());
            var left = Math.floor($window.width() / 2);

            AdQUA.loading.css({ top: top, left: left }).show();

        } else {
            AdQUA.loading.hide();
        }
    },



    // 페이지 레이어 내부의 프레임 반환
    getLayerFrame: function () {
        if (AdQUA.layerFrame == null) {
            AdQUA.layerFrame = $("<div/>").html("<iframe frameborder='0' ALLOWTRANSPARENCY='true' scrolling='no' id='__searchFrame__' name='__searchFrame__'  style='width:100%; height:100%;' />").appendTo("body").css({
                width: 0,
                height: 0,
                margin: 0,
                padding: 0,
                top: 0,
                left: 0,
                position: "absolute",
                border: 0
            });
        }


        return AdQUA.layerFrame;
    },



    // 반투명 레이어 반환
    getDisabledZone: function () {
        if (AdQUA.disabledZone == null) {
            var swidth = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollWidth : document.body.scrollWidth);
            var sheight = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollHeight : document.body.scrollHeight);

            var width = (($(window).width() >= swidth) ? $(window).width() : swidth);
            var height = (($(window).height() >= sheight) ? $(window).height() : sheight);




            AdQUA.disabledZone = $("<div />").appendTo("body");
            AdQUA.disabledZone.css({
                width: width,
                height: height,
                top: 0,
                left: 0,
                background: "#000",
                opacity: 0.3,
                position: "absolute",
                zIndex: 9000

            }).hide();


            $(window).bind("resize.disabledZone", function () {
                swidth = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollWidth : document.body.scrollWidth);
                sheight = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollHeight : document.body.scrollHeight);

                width = (($(window).width() >= swidth) ? $(window).width() : swidth);
                height = (($(window).height() >= sheight) ? $(window).height() : sheight);


                AdQUA.disabledZone.css({ width: width, height: height });
            });
        }


        return AdQUA.disabledZone;
    },



    // 레이어 페이지 로드( 경로, 넓이, 높이, 닫기시 액션 )
    loadPage: function (src, width, height, fnPostClose, callback) {
        if (typeof (width) == "string")
            width = Number(width.replace("px", ""));

        if (typeof (height) == "string")
            height = Number(height.replace("px", ""));



        var swidth = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollWidth : document.body.scrollWidth);
        var sheight = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollHeight : document.body.scrollHeight);

        var windowWidth = (($(window).width() >= swidth) ? $(window).width() : swidth);
        var windowHeight = (($(window).height() >= sheight) ? $(window).height() : sheight);

        var top = ((windowHeight - height) / 2);
        var left = ((windowWidth - width) / 2);

        top = ((top <= 0) ? 0 : top);
        left = ((left <= 0) ? 0 : left);

        var options = {
            url: src,
            width: width,
            height: height,
            top: top,
            left: left,
            modal: true,
            fixedPosition: false,
            loadCallback: callback,
            closeCallback: fnPostClose
        };

        AdQUA.loadInlinePage(options);
    },


    // 특정 포지션에 레이어 페이지로드 (경로, 넓이, 높이, 닫기시 액션)
    loadInlinePage: function (options) {
        /*if ($.browser.msie)*/
            $("select").hide();


        if (typeof (options.closeCallback) == "function")
            AdQUA.__postCloseFrameAction__ = options.closeCallback;



        AdQUA.getLayerFrame().css({
            width: 0,
            height: 0,
            top: options.top,
            left: options.left,
            zIndex: (AdQUA.getDisabledZone().css("zIndex") + 1)

        }).find("iframe")
            .attr("src", options.url)
            .one("load", function () {
                if ($(this).attr("src").indexOf("about:blank") < 0) {
                    AdQUA.getLayerFrame().find("iframe").css({ width: options.width, height: options.height });
                    AdQUA.getLayerFrame().show().stop().animate(
                        { width: options.width, height: options.height },
                        function () {
                            if (typeof (options.loadCallback) == "function")
                                options.loadCallback();
                        }
                    );
                }
            });


        if (options.modal == true)
            AdQUA.getDisabledZone().show();
        else
            AdQUA.getDisabledZone().hide();


        if (options.fixedPosition == false) {
            $(window).bind("resize.layerFrame", function () {
                var swidth = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollWidth : document.body.scrollWidth);
                var sheight = ((document.compatMode == "CSS1Compat") ? document.documentElement.scrollHeight : document.body.scrollHeight);

                var windowWidth = (($(window).width() >= swidth) ? $(window).width() : swidth);
                var windowHeight = (($(window).height() >= sheight) ? $(window).height() : sheight);

                var top = ((windowHeight - options.height) / 2);
                var left = ((windowWidth - options.width) / 2);


                AdQUA.getLayerFrame().find("iframe").css({ top: top, left: left });
                AdQUA.getLayerFrame().stop().animate({ top: top, left: left });
            });
        }
    },


    // 레이어 페이지 닫기..
    closePage: function () {
        AdQUA.getLayerFrame().find("iframe").attr("src", "about:blank").end().hide();
        AdQUA.getDisabledZone().hide();

        /*if ($.browser.msie)*/
            $("select").show();



        $(window).unbind("resize.layerFrame");

        if (typeof (AdQUA.__postCloseFrameAction__) == "function") {
            AdQUA.__postCloseFrameAction__(arguments[0]);
            AdQUA.__postCloseFrameAction__ = null;
        }
    },

    // 레이어 팝업 보이기..!
    showDialog: function ($dialog, callback) {
        /*if ($.browser.msie) {
            if (Number($.browser.version.substring(0, 1)) >= 8)
                AdQUA.getDisabledZone().show();

        } else {
            AdQUA.getDisabledZone().show();
        }*/
        AdQUA.getDisabledZone().show();


        var $window = $(window);
        var $body = $("body");



        var top = ((($window.height() - $dialog.height()) / 2) + $window.scrollTop() - $dialog.parent().offset().top);
        var left = ((($window.width() - $dialog.width()) / 2) - $dialog.parent().offset().left);
        var width = $dialog.width();
        var height = $dialog.height();


        $dialog
                .stop()
                .css({ position: "absolute", top: top, left: left, width: 0, height: 0, zIndex: (AdQUA.getDisabledZone().css("zIndex") + 5) })
                .show()
                .animate(
                    { top: top, left: left, width: width, height: height },
                    function () {
                        if (typeof (callback) == "function")
                            callback();
                    }
                );


        $window.bind("resize.dialog", function () {
            top = ((($window.height() - $dialog.height()) / 2) + $window.scrollTop() - $dialog.parent().offset().top);
            left = ((($window.width() - $dialog.width()) / 2) - $dialog.parent().offset().left);

            $dialog.stop().animate({ top: top, left: left });
        });
    },

    hideDialog: function (oDialog) {
        AdQUA.getDisabledZone().hide();
        oDialog.hide();

        $(window).unbind("resize.dialog");
    },


    // 이미지 뷰어~
    showPicture: function (src, modal) {

        window.scrollTo(0, 0);
        AdQUA.showLoading(true);



        if (modal == null) modal = true;
        if (modal == true) AdQUA.getDisabledZone().show();


        var $window = $(window);
        var $wrapper = $('<div><img src="' + src + '" /></div>')
                        .css({ position: "absolute", top: 0, left: 0, opacity: 0, border: "2px solid #000", cursor: "pointer", zIndex: (AdQUA.getDisabledZone().css("zIndex") + 10) })
                        .attr("title", "이미지를 클릭하시면 닫힙니다!")
                        .click(function () {
                            $wrapper.remove();
                            AdQUA.getDisabledZone().hide();

                            $window.unbind("resize.showPicture");

                        })
                        .appendTo("body");


        var $image = $wrapper.find("img").load(resize).hide();

        var maxWidth = Math.ceil($window.width() * 0.8);
        var maxHeight = Math.ceil($window.height() * 0.8);

        function resize() {
            var timer = null;

            if ($image.get(0).complete) {
                var width = $image.width();
                var height = $image.height();

                if (width > maxWidth) {
                    height = Math.ceil(height * (maxWidth / width));
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = Math.ceil(width * (maxHeight / height));
                    height = maxHeight;
                }


                var top = Math.ceil(($window.height() - height) / 2);
                var left = Math.ceil(($window.width() - width) / 2);

                window.clearTimeout(timer);


                $image.data({ originWidth: $image.width(), originHeight: $image.height() }).css({ width: width, height: height }).show();
                $wrapper.css({ width: 0, height: 0, top: top, left: left, opacity: 1 }).animate({ width: width, height: height });



                $window.bind("resize.dialog", function () {
                    width = $image.data("originWidth");
                    height = $image.data("originHeight");

                    maxWidth = Math.ceil($window.width() * 0.8);
                    maxHeight = Math.ceil($window.height() * 0.8);

                    if (width > maxWidth) {
                        height = Math.ceil(height * (maxWidth / width));
                        width = maxWidth;
                    }

                    if (height > maxHeight) {
                        width = Math.ceil(width * (maxHeight / height));
                        height = maxHeight;
                    }


                    top = Math.ceil(($window.height() - height) / 2);
                    left = Math.ceil(($window.width() - width) / 2);

                    $image.css({ width: width, height: height });
                    $wrapper.css({ width: width, height: height }).animate({ top: top, left: left });
                });


                AdQUA.showLoading(false);



            } else {
                timer = window.setTimeout(resize, 500);
            }
        }

    }
};