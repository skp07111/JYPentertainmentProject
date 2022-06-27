    //-----------------------------------------------------------------------------
    //
    //	이미지 노드의 크기 리사이즈..!
    //
    // @input:
    //		img: 이미지노드
    //		width: 최대 가로사이즈
    //		height: 최대 세로사이즈
    //
    // ex) <img src="이미지경로" onload="resizeImage(this, 40, 20);" />
    //-----------------------------------------------------------------------------
    function resizeImage(img, maxWidth, maxHeight, align) {
        if (align && $(img).parent().css("textAlign") && ($(img).parent().css("textAlign") != "")) {
            $(img).parent().css("textAlign", "");
        }

        resize();


        function resize() {
            var timer = null;

            if (img.complete) {
                var width = $(img).width();
                var height = $(img).height();

                if (width > maxWidth) {
                    height = Math.ceil(height * (maxWidth / width));
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = Math.ceil(width * (maxHeight / height));
                    height = maxHeight;
                }

                window.clearTimeout(timer);

                $(img)
                            .data("originSize", { width: $(img).width(), height: $(img).height() })
                            .data("resizeSize", { width: width, height: height })
                            .css({ width: width, height: height })
                            .show();

                if (align)
                    $(img).css({ marginLeft: Math.ceil((maxWidth - width) / 2), marginTop: Math.ceil((maxHeight - height) / 2) });

            } else {
                timer = window.setTimeout(resize, 500);
            }
        }
    }



	//-----------------------------------------------------------------------------
	// IE 스타일과 무관하게 Window Resize..
	// @return : null
	// ex) fixedResizeWindow(800, 600);
	//-----------------------------------------------------------------------------
	function fixedResizeWindow(iWidth, iHeight){
		var currentWidth, currentHeight;
		var windowWidth, windowHeight;
		var borderWidth, boderHeight;

		if(document.all){
			currentWidth = document.body.offsetWidth;
			currentHeight = document.body.offsetHeight;

			window.resizeTo(iWidth, iHeight);

			windowWidth = iWidth - document.body.offsetWidth + currentWidth;
			windowHeight = iHeight - document.body.offsetHeight + currentHeight;

			window.resizeTo(windowWidth, windowHeight);
		} else{
			windowWidth = window.outerWidth;
			windowHeight = window.outerHeight;
		}

		borderWidth = windowWidth - document.body.clientWidth;
		borderHeight = windowHeight - document.body.clientHeight;

		window.resizeTo(iWidth + borderWidth, iHeight + borderHeight);
	}




	//-----------------------------------------------------------------------------
	// 화면의 중앙으로 팝업창 띄우기..
	// @return : null
	// ex) PopUp(경로, 팝업창이름, 넓이, 높이);
	//-----------------------------------------------------------------------------
	function PopUp(url, wName, width, height) {//화면의 중앙
		var LeftPosition = (screen.width/2) - (width/2);
		var TopPosition = (screen.height/2) - (height/2);
		var win = window.open(url, wName, "left="+LeftPosition+",top="+TopPosition+",width="+width+",height="+height);

		if(win == null){
			alert("팝업차단을 해제해주세요!");
		} else{
			win.focus();
		}
	}


	//-----------------------------------------------------------------------------
	// 화면의 중앙으로 팝업창 띄우기..(스크롤포함)
	// @return : null
	// ex) PopUp(경로, 팝업창이름, 넓이, 높이);
	//-----------------------------------------------------------------------------
	function PopUpWithScroll(url, wName, width, height) {//화면의 중앙
		var LeftPosition = (screen.width/2) - (width/2);
		var TopPosition = (screen.height/2) - (height/2);
		var win = window.open(url, wName, "left="+LeftPosition+",top="+TopPosition+",width="+width+",height="+height+",scrollbars=yes");

		if(win == null){
			alert("팝업차단을 해제해주세요!");
		} else{
			win.focus();
		}
	}


	//-----------------------------------------------------------------------------
	// 쿠키저장
	// @return : null
	// ex) SetCookie(쿠키이름, 쿠키값, 만료기간);
	//-----------------------------------------------------------------------------
	function SetCookie(name, value, expiredays){//쿠키 설정
		var todayDate = new Date(); 

		todayDate.setDate( todayDate.getDate() + expiredays ); 
		document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";";
	} 



	//-----------------------------------------------------------------------------
	// 쿠키추출
	// @return : null
	// ex) GetCookie(쿠키이름);
	//-----------------------------------------------------------------------------
	function GetCookie(name){
		var arg = name + "=";
		var alen = arg.length; 
		var clen = document.cookie.length;
		var i = 0;

		while (i < clen) {
			var j = i + alen; 

			if(document.cookie.substring(i, j) == arg){
				var endstr = document.cookie.indexOf (";", j);
				if(endstr == -1) 
					endstr = document.cookie.length; 

				return unescape(document.cookie.substring(j, endstr));
			}

			i = document.cookie.indexOf(" ", i) + 1;
			if (i == 0) break;
		}

		return null;
	} 



	//-----------------------------------------------------------------------------
	// 쿠키삭제
	// @return : null
	// ex) DeleteCookie(쿠키이름);
	//-----------------------------------------------------------------------------
	function DeleteCookie(name){
		var exp = new Date(); 
		var cval = GetCookie(name);

		exp.setTime(exp.getTime() - 1); 
		document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString(); 
	}




	//-----------------------------------------------------------------------------
	// 클립보드에 복사..
	// @return : boolean
	// ex) textToClip(이미지파일경로);
	//-----------------------------------------------------------------------------
	function textToClip(strClipData){
		if (window.clipboardData){
			window.clipboardData.setData("Text", strClipData);

		} else if (window.netscape){
			try{
				netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				
				var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
				if(!clip)	return false;
			
				var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
				if(!trans)	return false;
			
				trans.addDataFlavor('text/unicode');

				var str = new Object();
				var len = new Object();
				var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

				var copytext = strClipData;

				str.data=copytext;
				trans.setTransferData("text/unicode",str,copytext.length*2);
				
				var clipid=Components.interfaces.nsIClipboard;

				if(!clipid)	return false;

				clip.setData(trans,null,clipid.kGlobalClipboard);

			} catch(e){
				alert('파이어폭스 보안 설정으로 클립보드로 복사할 수 없습니다.\n\n주소 창에 about:config 라고 입력해 설정 페이지로 이동한 후 Signed.applets.codebase_principal_support 항목을 true로 변경하시면, 클립보드를 정상적으로 이용하실 수 있습니다.');
				return false;
			}
		}

		return true;
	}




	//-----------------------------------------------------------------------------
	// 이미지 사이즈에 맞게 크기조절된 팝업창띄우기
	// @return : null
	// ex) showPicture(이미지파일경로);
	//-----------------------------------------------------------------------------
	function showPicture(src) {
		var oImage = new Image();
		oImage.src = src;

		var strWindowOption = "";
		strWindowOption += "scrollbars=no,status=no,resizable=no";
		strWindowOption += ",width=" + oImage.width;
		strWindowOption += ",height=" + oImage.height;

		var wbody = "";
		wbody += "<head><title>사진 보기</title>";
		wbody += "<script language='javascript'>";
		wbody += "function finalResize(){";
		wbody += "  var oBody=document.body;";
		wbody += "  var oImg=document.images[0];";
		wbody += "  var xdiff=oImg.width-oBody.clientWidth;";
		wbody += "  var ydiff=oImg.height-oBody.clientHeight;";
		wbody += "  window.resizeBy(xdiff,ydiff);";
		wbody += "}";
		wbody += "</"+"script>";
		wbody += "</head>";
		wbody += "<body onLoad='finalResize()' style='margin:0'>";
		wbody += "<a href='javascript:window.close()'><img src='" + src + "' border=0></a>";
		wbody += "</body>";

		winResult = window.open("about:blank","",strWindowOption);
		winResult.document.open("text/html", "replace");
		winResult.document.write(wbody);
		winResult.document.close();
		return;
	}




    // 월의 마지막 날 구하기..
    function getLastDay(year, month){
        var arrLastDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if( (month == 2) && ((year%4==0) && ((year%10!=0) || (year%400==0))) ){
            arrLastDays[1] = 29;
        }

        return arrLastDays[month-1];
    }


    // "년-월-일"의 문자열을 Date() 객체로 변환..!
    function stringToDate( dateStr ){
        var year = parseInt(dateStr.substring(0, 4), 10);
        var month = parseInt(dateStr.substring(5, 7), 10);
        var day = parseInt(dateStr.substring(8), 10);

        return new Date(year, (month-1), day);
    }


    // Date() 객체를 "년-월-일"의 문자열로 변환..!
    function dateToString(year, month, day){
        if( typeof(year) == "object" ){
            var dt = year;

            year = dt.getFullYear();
            month = (dt.getMonth() + 1);
            day = dt.getDate();
        }

        year = parseInt(year, 10);
        month = parseInt(month, 10);
        day = parseInt(day, 10);

        return ( year + "-" + (((month < 10) ? "0" : "") + month) + "-" + (((day < 10) ? "0" : "") + day) );
    }


    // 날짜 계산..!
    function addDays( dt, diff ){
        var year = dt.getFullYear();
        var month = (dt.getMonth() + 1);
        var day = dt.getDate();

        if( diff > 0 ){
            if( (day + diff) > getLastDay(year, month) ){
                day = ((day + diff) - getLastDay(year, month));

                if( month == 12 ){
                    month = 1;
                    year++;

                } else{
                    month++;
                }

            } else{
                day += diff;
            }

        } else{
            if( (day + diff) < 0 ){
                if( month == 1 ){
                    month = 12;
                    year--;

                } else{
                    month--;
                }

                day = (getLastDay(year, month) - Math.abs(diff + day));

            } else{
                day += diff;
            }


        }

        return new Date(year, (month-1), day);
    }





	//-----------------------------------------------------------------------------
	// 플래시 점선없이 띄우기..
	// @return : null
	// ex) getFlashObject(플래시경로, 넓이, 높이, 전달변수, 플래시이름);
	//-----------------------------------------------------------------------------
	function getFlashObject(flashSrc, objWidth, objHeight, etcParam, flaName) {
		document.writeln( getFlashObjectTags(flashSrc, objWidth, objHeight, etcParam, flaName) );
	}


	//-----------------------------------------------------------------------------
	// 플래시 태그 값 반환..
	// @return : String
	// ex) getFlashObjectTags(플래시경로, 넓이, 높이, 전달변수, 플래시이름);
	//-----------------------------------------------------------------------------
	function getFlashObjectTags(flashSrc, objWidth, objHeight, etcParam, flaName) {
        flaName = (flaName || Math.ceil(Math.random()*100000));

		var tag = "";
		var baseFlashDir="";
		flashSrc = baseFlashDir + flashSrc;

		if ( etcParam != "" || etcParam != null ) {
			if ( etcParam.substr(0, 1) == "?" )
				flashSrc += etcParam;
			else
				flashSrc += "?" + etcParam;
		}

		tag += "<object id=\"" + flaName + "\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" ";
		tag += "codebase=\"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0\" ";
		tag += "width=\"" + objWidth + "\" height=\"" + objHeight + "\">";
		tag += "<param name=\"movie\" value=\"" + flashSrc + "\">";
		tag += "<param name=\"menu\" value=\"true\">";
		tag += "<param name=\"quality\" value=\"high\">";
		tag += "<param name=\"wmode\" value=\"transparent\">";
		tag += "<param name=\"allowFullScreen\" value=\"true\">";
        tag += "<param name=\"allowScriptAccess\" value=\"always\">";
        tag += "<embed name=\"" + flaName + "\" src=\"" + flashSrc + "\" quality=\"high\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" ";
		tag += "type=\"application/x-shockwave-flash\" width=\"" + objWidth + "\" height=\"" + objHeight + "\" ";
		tag += "wmode=\"transparent\"></embed>";
		tag += "</object>";


		return tag;
	}







	//-----------------------------------------------------------------------------
	// 동영상 
	// @return : null
	// ex) getMovieObject(동영상경로, 넓이, 높이, 동영상ID);
	//-----------------------------------------------------------------------------
	function getMovieObject(sPath, iWidth, iHeight, sMovieID){
		document.writeln( getMovieObjectTags(sPath, iWidth, iHeight, sMovieID) );
	}




	//-----------------------------------------------------------------------------
	// 동영상 태그 반환
	// @return : null
	// ex) getMovieObjectTags(동영상경로, 넓이, 높이, 동영상ID);
	//-----------------------------------------------------------------------------
	function getMovieObjectTags(sPath, iWidth, iHeight, sMovieID){
		var strMovieID = (sMovieID) ? sMovieID : Math.random();
		var strMovie = "";
		
		strMovie += "<object classid=\"clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95\" id=\"" + strMovieID + "\" width=\"" + iWidth + "\" height=\"" + iHeight + "\" style=\"margin:0px; padding:0px;\">\n";
		strMovie += "	<param name=\"AutoStart\" value=\"true\">\n";
		strMovie += "	<param name=\"Loop\" value=\"-1\">\n";
		strMovie += "	<param name=\"ShowControls\" value=\"true\">\n";
		strMovie += "	<param name=\"ShowStatusBar\" value=\"true\">\n";
		strMovie += "	<param name=\"ShowPositionControls\" value=\"false\">\n";
		strMovie += "	<param name=\"Filename\" value=\"" + sPath + "\">\n";
		strMovie += "</object>\n";

		return strMovie;
	}





/*****************************************************************************************
		※ String 객체 확장..
*****************************************************************************************/

	//-----------------------------------------------------------------------------
	// 문자의 좌, 우 공백 제거
	// @return : String
	// ex) 문자열.trim();
	//-----------------------------------------------------------------------------
	String.prototype.trim = function() {
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};


	String.prototype.Trim = function() {
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};


	//-----------------------------------------------------------------------------
	// 문자의 좌 공백 제거
	// @return : String
	// ex) 문자열.ltrim();
	//-----------------------------------------------------------------------------
	String.prototype.ltrim = function() {
		return this.replace(/(^\s*)/, "");
	};



	//-----------------------------------------------------------------------------
	// 문자의 우 공백 제거
	// @return : String
	// ex) 문자열.rtrim();
	//-----------------------------------------------------------------------------
	String.prototype.rtrim = function() {
		return this.replace(/(\s*$)/, "");    
	};


	//-----------------------------------------------------------------------------
	// 문자열의 바이트수 리턴
	// @return : int
	// ex) 문자열.bytes();
	//-----------------------------------------------------------------------------
	String.prototype.bytes = function() {
		var cnt = 0;

		for (var i = 0; i < this.length; i++) {
			if (this.charCodeAt(i) > 127)
				cnt += 2;
			else
				cnt++;
		}

		return cnt;
	};




	//-----------------------------------------------------------------------------
	// 정수형으로 변환
	// @return : int
	// ex) 문자열.int();
	//-----------------------------------------------------------------------------
	String.prototype.int = function() {
		if(!isNaN(this)) {
			return parseInt(this, 10);
		}
		else {
			return null;    
		}
	};



	//-----------------------------------------------------------------------------
	// 숫자에 3자리마다 , 를 찍어서 반환
	// @return : 변환된 String ( ex) 12,345,678 )
	// ex) 문자열.money();
	//-----------------------------------------------------------------------------
	String.prototype.money = function() {
		var num = this.trim();

		while((/(-?[0-9]+)([0-9]{3})/).test(num)) {
			num = num.replace((/(-?[0-9]+)([0-9]{3})/), "$1,$2");
		}

		return num;
	};



	//-----------------------------------------------------------------------------
	// 문자열에 포함된 숫자만 가져 오기
	// @return : String					ex) "-123$asdf456".num() => "123456";
	// ex) 문자열.num();
	//-----------------------------------------------------------------------------
	String.prototype.num = function() {
		return (this.trim().replace(/[^0-9]/g, ""));
	};



	//-----------------------------------------------------------------------------
	// 문자열을 원하는 바이트만큼 자르기..
	// @return : String					ex) "abcdefghijklmn".cut(5) => "abcde";
	// ex) 문자열.cut(바이트);
	//-----------------------------------------------------------------------------
	String.prototype.cut = function(iCount) {
		var strReturn = this;
		var intLength = 0;

		for (var i=0; i<strReturn.length; i++) {
			intLength += (strReturn.charCodeAt(i) > 128) ? 2 : 1;

			if (intLength > iCount)
				return strReturn.substring(0,i) + "..";
		}

		return strReturn;
	};




	//-----------------------------------------------------------------------------
	// 문자열에 포함된 특정문자를 모두 바꾸기..
	// @return : String					ex) "asdflkj&&&qwerpio".replaceAll("&", "-") => "asdflkj---qwerpio";
	// ex) 문자열.replaceAll(원본문자, 바꿀문자);
	//-----------------------------------------------------------------------------
	String.prototype.replaceAll = function(source, target) {
		source = source.replace(new RegExp("(\\W)", "g"), "\\$1");
		target = target.replace(new RegExp("\\$", "g"), "$$$$");

		return this.replace(new RegExp(source, "gm"), target);
	};



	//-----------------------------------------------------------------------------
	// 문자열에 포함된 특정문자의 갯수 반환
	// @return : int					ex) "abczzzkk".count("z") => 3;
	// ex) 문자열.count(문자);
	//-----------------------------------------------------------------------------
	String.prototype.count = function(str) {
		var matches = this.match(new RegExp(str.replace(new RegExp("(\\W)", "g"), "\\$1"), "g"));

		return matches ? matches.length : 0;
	}



	String.prototype.htmlspecialchars = function()	{ 
		return this.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("<", "&gt;"); 
	}

	String.prototype.unhtmlspecialchars = function() {
		return this.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">"); 
	}

	String.prototype.stripquote = function() {	
		return this.replaceAll("'", "").replaceAll('"', '').replaceAll("&#39;", "").replaceAll("&#039;", "").replaceAll("&quote;", ""); 
	}



	//-----------------------------------------------------------------------------
	// 올바른 URL 패턴의 문자열인지 체크
	//-----------------------------------------------------------------------------
    String.prototype.isValidateUri = function(){
        var oRegExp = new RegExp();
        oRegExp.compile("(http|https)://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");

        return oRegExp.test(this);
    };




/*****************************************************************************************
		※ Number 객체 확장..
*****************************************************************************************/

	//-----------------------------------------------------------------------------
	// 숫자의 자리수(cnt)에 맞도록 반환
	// @return : 변환된 String			ex) 33.digits(4) => "0033";
	// ex) 숫자.digits(자리수);
	//-----------------------------------------------------------------------------
	Number.prototype.digits = function(cnt) {
		var sThis = this.toString();
		var digit = "";

		if (sThis.length < cnt) {
			for(var i = 0; i < cnt - sThis.length; i++) {
				digit += "0";
			}
		}

		return digit + sThis;
	};



	Number.prototype.money = function(){
		return this.toString().money();
	};





/*****************************************************************************************
		※ Date 객체 확장..
*****************************************************************************************/
    Date.prototype.setISO8601 = function (string) {
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
        var d = string.match(new RegExp(regexp));

        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) { date.setMonth(d[3] - 1); }
        if (d[5]) { date.setDate(d[5]); }
        if (d[7]) { date.setHours(d[7]); }
        if (d[8]) { date.setMinutes(d[8]); }
        if (d[10]) { date.setSeconds(d[10]); }
        if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset *= ((d[15] == '-') ? 1 : -1);
        }

        offset -= date.getTimezoneOffset();
        time = (Number(date) + (offset * 60 * 1000));
        this.setTime(Number(time));
    };




	//------------------------------------------------------------------------------
	//
	// png파일 투명하게 보이게하기위한 함수
	//
	//------------------------------------------------------------------------------
	function setPng24(obj) { 
		obj.width=obj.height=1; 
		obj.className=obj.className.replace(/\bpng24\b/i,''); 
		obj.style.filter = 
		"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+ obj.src +"',sizingMethod='image');" 
		obj.src='';  
		return ''; 
	} 