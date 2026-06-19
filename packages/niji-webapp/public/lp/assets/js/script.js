 //Q&A
$(function(){
  $(".vote_detail h3, .faq_category h3").on("click", function() {
    $(this).next().slideToggle();
    $(this).toggleClass('on');
  });
});

//Menu
$(function() {
  $('h1').click(function() {
     if($('h1').hasClass('active')){
       $('h1').removeClass('active');
     } else {
       $('h1').addClass('active');
     }
   });
 });
 $(function () {
     var $body = $('body');
     //開閉用ボタンをクリックでクラスの切替え
     $('h1').on('click', function () {
         $body.toggleClass('open');
     });
     //メニュー名以外の部分をクリックで閉じる
     $('#js__nav, .menuInner li a').on('click', function () {
         $body.removeClass('open');
         $('h1').removeClass('active');
     });
 });

//フッター固定ボタン
$(function() {
  $(window).scroll(function () {
    var scrollTop = $(this).scrollTop(); // 現在のスクロール位置を取得
    var fadeInThreshold = 400; // フェードインするスクロール位置のしきい値

    if($(window).width() <= 961) { // 画面幅が961px以下の場合にのみ実行
      if(scrollTop > fadeInThreshold) {
        $(".launch_bt_fixed").fadeIn(400); // 400ミリ秒かけてフェードイン
      } else {
        $(".launch_bt_fixed").fadeOut(400); // 400ミリ秒かけてフェードアウト
      }
    } else {
      $(".launch_bt_fixed").hide(); // 画面幅が961pxを超える場合は常に非表示
    }
  });

  // 初期表示の制御
  if($(window).width() <= 961 && $(window).scrollTop() > 400) {
    $(".launch_bt_fixed").show(); // 初期表示の状態でフェードインする条件を満たしている場合に表示
  } else {
    $(".launch_bt_fixed").hide(); // 初期表示の状態で非表示にする条件を満たしている場合に非表示
  }
});
