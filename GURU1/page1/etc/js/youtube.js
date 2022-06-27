var slides = document.querySelector('.youtube-slides'); //전체 슬라이드 컨테이너 
var slideImg = document.querySelectorAll('.sliderkit-selected'); //모든 슬라이드들 
var currentIdx = 0; //현재 슬라이드 index 
var slideCount = 2; // 슬라이드 개수 
var prev = document.querySelector('.sliderkit-nav-prev'); //이전 버튼 
var next = document.querySelector('.sliderkit-nav-next'); //다음 버튼 
var slideWidth = 140; //한개의 슬라이드 넓이 
var slideMargin = 30; //슬라이드간의 margin 값


//전체 슬라이드 컨테이너 넓이 설정 
slides.style.width = (140 + 30) * 4 * slideCount + 'px';

function moveSlide(num) { 
  slides.style.left = -(num * 140 * 4) + 'px';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                00 + 'px'; 
  currentIdx = num;
   } 

prev.addEventListener('click', function () { 
  /*첫 번째 슬라이드로 표시 됐을때는 
  이전 버튼 눌러도 아무런 반응 없게 하기 위해 
  currentIdx !==0일때만 moveSlide 함수 불러옴 */ 
  if (currentIdx !== 0) 
  moveSlide(currentIdx - 1); 
  else if(currentIdx == 0)
  moveSlide(currentIdx + 1);
}); 

next.addEventListener('click', function () {
  /* 마지막 슬라이드로 표시 됐을때는 
  음 버튼 눌러도 아무런 반응 없게 하기 위해 
  currentIdx !==slideCount - 1 일때만 
  moveSlide 함수 불러옴 */ 
  if (currentIdx !== slideCount - 1) { 
    moveSlide(currentIdx + 1); 
    } 
  else if (currentIdx == slideCount -1) {
    moveSlide(currentIdx -1);
  }
  });