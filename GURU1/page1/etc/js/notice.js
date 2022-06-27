(function($){

    var oSearchForm = null;
    var oPageNavigator = null;


    // 공지사항 리스트..!
    function loadNoticeList( pageNo ){
        oSearchForm.pageNo.value = (pageNo || 1);
		var flDiv = location.href;
		var LDiv = flDiv.split("&LDiv=");
		
		var QDiv = flDiv.split("?LDiv=");
		
		if (LDiv[1] == undefined)
		{
			LDiv[1] = QDiv[1];
		}
		
		
        var $list = $(".contents .bbs-list tbody");

        $.get(
            "/process/BoardDataList.ashx?LDiv=" + LDiv[1],
            ($(oSearchForm).serialize() + "&boardType=Notice&pageSize=9"),
            function(data){
                $list.empty();
                
                var virtualNo = (data.dataCount - ((data.pageNo-1) * data.pageSize));


                $.each(data.dataList, function(i, oDATA){
                    var linkUrl = "/company/NoticeView.aspx?" + $(oSearchForm).serialize() + "&idx=" + oDATA.Idx + "&LDiv=" + LDiv[1];
                    var tags = '';
                    tags += '<td>' + virtualNo + '</td>';
                    tags += '<td class="l"><a href="' + linkUrl + '" alt="' + oDATA.Title + '" title="' + oDATA.Title + '">' + oDATA.Title.cut(70) + '</a></td>';
                    tags += '<td><time datetime="' + oDATA.RegDate + '">' + oDATA.RegDate.substring(0,10).replaceAll("-",".") + '</time></td>';

                    $("<tr />")
                        .append(tags)
                        .click(function(e){
                            e.preventDefault();
							location.href = linkUrl;
                        })
                        .appendTo( $list );

                    virtualNo--;
                });


                // 페이지 네비 표시..!
                if( data.pageCount > 0 )
                    oPageNavigator.show( data.pageNo, data.pageCount, data.pageSize );

            },
            "json"
        );

    }


    // 검색..!
    function searchNoticeDataList(){
        if( $.trim(oSearchForm.schString.value) == "" ){
            alert("검색어를 입력해주세요!");
            return false;

        } else{
            loadNoticeList(1);
        }
    }





    $(function(){
        oPageNavigator = new PageNavigator( 
            $(".contents .board-page").get(0), 
            loadNoticeList,
            {
                linkBlockCount: 9,
                currentNodeType: "span",
                prevClassName: "prev",
                nextClassName: "next",
                firstVisible: true,
                firstClassName: "first",
                lastVisible: true,
                lastClassName: "last"
            }
        );


        oSearchForm = $("form[name='frmSearch']")[0];
        $(oSearchForm.schString).keyup(function(e){
            if( e.keyCode == 13 )
                searchNoticeDataList();
        });


        $(".board-search .btn").click(function(e){
            e.preventDefault();

            searchNoticeDataList();
        });


        loadNoticeList(1);
    });

})( jQuery );