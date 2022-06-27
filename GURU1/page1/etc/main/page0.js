$(document).ready(function(){
    
     $(document).mousemove(function(e){
        var mouseX = e.pageX;  //마우스 커서 위치 변수
        var mouseY = e.pageY;  //마우스 커서 위치 변수

        $(".cursor").show().css({ //마우스 따라 움직이기
            left: mouseX + "px",
            top : mouseY + "px"
        })
    })
})