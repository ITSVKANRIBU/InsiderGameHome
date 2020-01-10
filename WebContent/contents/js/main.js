// 共通化
function includeHtml(url) {
	$.ajax({
		url : url, // 読み込むHTMLファイル
		cache : false,
		async : false,
		dataType : 'html',
		success : function(html) {
			document.write(html);
		}
	});
}

$(function() {
	// #で始まるアンカーをクリックした場合に処理
	$('a[href^="#"]').click(function() {
		// スクロールの速度
		var speed = 300; // ミリ秒
		// アンカーの値取得
		var href = $(this).attr("href");
		// 移動先を取得
		var target = $(href == "#" || href == "" ? 'html' : href);
		// 移動先を数値で取得
		var position = target.offset().top;
		// スムーススクロール
		$('body,html').animate({
			scrollTop : position
		}, speed, 'swing');
		return false;
	});

	var appear = false;
	var pagetop = $('#page_top');
	$(window).scroll(function() {
		if ($(this).scrollTop() > 100) { //100pxスクロールしたら
			if (appear == false) {
				appear = true;
				pagetop.stop().animate({
					'bottom' : '50px' //下から50pxの位置に
				}, 300); //0.3秒かけて現れる
			}
		} else {
			if (appear) {
				appear = false;
				pagetop.stop().animate({
					'bottom' : '-100px' //下から-50pxの位置に
				}, 300); //0.3秒かけて隠れる
				$('#page_top').css('background-image', 'url(./contents/img/top1.png)');
			}
		}
	});
	pagetop.click(function() {
		$('#page_top').css('background-image', 'url(./contents/img/top2.png)');
		$('body, html').animate({
			scrollTop : 0
		}, 500); //0.5秒かけてトップへ戻る
		return false;
	});
});
