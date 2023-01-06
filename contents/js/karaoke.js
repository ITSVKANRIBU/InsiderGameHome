$(function () {
  var count = 0;

  $(".animsition").animsition();

  // ポップオーバー
  $('[data-toggle="popover"]').popover();

  $(".forward").click(function () {
    //エラーチェック
    if (count <= 0) {
      count = 0;
      return false;
    }

    count = count - 1;
    $(".fadeInAnime").css({
      "-webkit-animation-name": "fadeInAnime",
      "font-animation-name": "fadeInAnime",
    });

    $(".imageView").addClass("d-none");
    $("#" + count).removeClass("d-none");

    if (count <= 0) {
      $(".forward").addClass("disabled");
    } else {
      $(".next").removeClass("disabled");
    }
    $("#num").text(count);
  });

  $(".next").click(function () {
    //エラーチェック
    if (count >= 4) {
      count = 4;
      return false;
    }

    count = count + 1;

    $(".fadeInAnime").css({
      "-webkit-animation-name": "fadeInAnimeright",
      "font-animation-name": "fadeInAnimeright",
    });
    $(".imageView").addClass("d-none");
    $("#" + count).removeClass("d-none");

    if (count >= 4) {
      $(".next").addClass("disabled");
    } else {
      $(".forward").removeClass("disabled");
    }
    $("#num").text(count);
  });
});
