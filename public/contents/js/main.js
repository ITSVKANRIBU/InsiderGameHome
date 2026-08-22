// Legacy common script retained for the karaoke island until Phase 7.
$(function () {
  // #で始まるアンカーをクリックした場合に処理
  $('a[href^="#"]').click(function () {
    // スクロールの速度
    var speed = 300; // ミリ秒
    // アンカーの値取得
    var href = $(this).attr("href");
    // 移動先を取得
    var target = $(href == "#" || href == "" ? "html" : href);
    // 移動先を数値で取得
    var position = target.offset().top;
    // スムーススクロール
    $("body,html").animate(
      {
        scrollTop: position,
      },
      speed,
      "swing"
    );
    return false;
  });

  var appear = false;
  var pagetop = $("#page_top");

  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      //100pxスクロールしたら
      if (appear == false) {
        appear = true;
        pagetop.stop().animate(
          {
            bottom: "50px", //下から50pxの位置に
          },
          300
        ); //0.3秒かけて現れる
      }
    } else {
      if (appear) {
        appear = false;
        pagetop.stop().animate(
          {
            bottom: "-100px", //下から-50pxの位置に
          },
          300
        ); //0.3秒かけて隠れる
        $("#page_top").show();
        $("#page_top2").hide();
      }
    }
  });
  pagetop.click(function () {
    $("#page_top").hide();
    $("#page_top2").show();

    $("body, html").animate(
      {
        scrollTop: 0,
      },
      500
    ); //0.5秒かけてトップへ戻る

    setTimeout(function () {
      $("#page_top").show();
      $("#page_top2").hide();
    }, 500);
    return false;
  });

  //変動ボタン
  var arySpinnerCtrl = [];
  var num;
  //長押し押下時
  $(".btnspinner").on("click", function (e) {
    if (arySpinnerCtrl["interval"]) return false;
    var target = $(this).data("target");
    arySpinnerCtrl["target"] = target;
    arySpinnerCtrl["cal"] = Number($(this).data("cal"));

    //クリックは単一の処理に留める
    spinnerCal();
    arySpinnerCtrl = [];
    return false;
  });

  //変動計算関数
  function spinnerCal() {
    var target = $(arySpinnerCtrl["target"]);
    num = Number(target.val());
    num = num + arySpinnerCtrl["cal"];
    if (num > Number(target.data("max"))) {
      target.val(Number(target.data("max")));
    } else if (Number(target.data("min")) > num) {
      target.val(Number(target.data("min")));
    } else {
      if (arySpinnerCtrl["cal"] > 0) {
        addDiv();
      } else {
        removeDiv();
      }
      target.val(num);
    }
  }

  function addDiv() {
    var labelstr = "参加者" + num;
    $(".userdiv").eq(0).clone().appendTo(".group");
    $(".userdiv")
      .eq(num - 1)
      .find("label")
      .text(labelstr);
  }

  function removeDiv() {
    $(".userdiv").eq(num).remove();
  }

  $(window).scroll(function () {
    var windowHeight = $(window).height(),
      topWindow = $(window).scrollTop();
    $(".animationFadeIn").each(function () {
      var targetPosition = $(this).offset().top;
      if (topWindow > targetPosition - windowHeight + 100) {
        $(this).addClass("fadeInDown");
      }
    });
  });
});
