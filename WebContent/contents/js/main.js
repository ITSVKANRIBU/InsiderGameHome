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
// サブミット用関数
function submitAction() {

	// 非活性
	$('.button').prop('disabled', true);

	// メッセージ非表示
	$('.alert-success').hide();
	$('.alert-danger').hide();
	
	// ぐるぐるにする
	var spinner = '<span class="spinner"></span>';
	$('.button').toggleClass('loading').html(spinner);
	
	var messageList = [];
	
	$.each($('[name="message"]'), function(index, dao) {
		messageList.length = [index + 1]
		messageList[index] = dao.value;
	})
	
	var data = {
		"message": messageList
	}
	console.log(data);

	// 通信実行
	$.ajax({
		type:"post",				// method = "POST"
		url:"https://insidergamehelper.herokuapp.com/specialvillage",		// POST送信先のURL
		contentType: 'application/json', // リクエストの Content-Type
		data:JSON.stringify(data),  // JSONデータ本体
		dataType: "json",		   // レスポンスをJSONとしてパースする
		success: function(json_data) {   // 200 OK時
		setTimeout(function(){
			$('#villagenum').text(json_data['data']);
			$('.alert-success').show();
		},500);
		},
		error: function() {		 // HTTPエラー時
			$('.alert-danger').show();
		},
		complete: function() {	  // 成功・失敗に関わらず通信が終了した際の処理
			// 活性
			setTimeout(function(){
				$('.button').prop('disabled', false);
				$('.button').toggleClass('loading').html("村作成");
			},500);
		}
	});
	
	// 通信実行
	$.ajax({
		type:"post",				// method = "POST"
		url:"https://script.google.com/macros/s/AKfycbxlgG1Vd-ZXECvaD4YB2dtyZBfQ_MyJRYnFKl97IPtKpTaZTTg/exec",		// POST送信先のURL
		data:JSON.stringify(data),  // JSONデータ本体
		dataType: "json",		   // レスポンスをJSONとしてパースする
		success: function(json_data) {   // 200 OK時
			console.log("成功");
		},
		error: function() {		 // HTTPエラー時
			console.log("書き込みエラー");
		},
		complete: function() {	  // 成功・失敗に関わらず通信が終了した際の処理
			console.log("完了");
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
						$('#page_top').show();
						$('#page_top2').hide();
			}
		}
	});
	pagetop.click(function() {
		$('#page_top').hide();
		$('#page_top2').show();
		
		$('body, html').animate({
			scrollTop : 0
		}, 500); //0.5秒かけてトップへ戻る
		
		setTimeout(function(){
			$('#page_top').show();
			$('#page_top2').hide();
		},500);
		return false;
	});

	//変動ボタン
	var arySpinnerCtrl = [];
	var num;
	//長押し押下時
	$('.btnspinner').on('click', function(e){
		if(arySpinnerCtrl['interval']) return false;
		var target = $(this).data('target');
		arySpinnerCtrl['target'] = target;
		arySpinnerCtrl['cal'] = Number($(this).data('cal'));

		//クリックは単一の処理に留める
		spinnerCal();
		arySpinnerCtrl = [];
		return false;

	});

	//変動計算関数
	function spinnerCal(){
		var target = $(arySpinnerCtrl['target']);
		num = Number(target.val());
		num = num + arySpinnerCtrl['cal'];
		if(num > Number(target.data('max'))){
			target.val(Number(target.data('max')));
		}else if(Number(target.data('min')) > num){
			target.val(Number(target.data('min')));
		}else{
			if(arySpinnerCtrl['cal'] > 0){
				addDiv();
			}else{
				removeDiv();
			}
			target.val(num);
		}
	}

	function addDiv(){
		var labelstr = '参加者' + num;
		$('.userdiv').eq(0).clone().appendTo('.group');
		$('.userdiv').eq(num - 1).find('label').text(labelstr);
	}

	function removeDiv(){
		var size = $('.userdiv').length;
		$('.userdiv').eq(num).remove();
	}
	
});


