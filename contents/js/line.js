const FIRST_MESSAGE = "こんにちは！ 参加したい村の番号を入力してください。";
let userId;

var $messages = $(".messages-content"),
  d,
  h,
  m,
  i = 0;

$(window).load(function () {
  //UserIdの作成
  setUserId();

  $messages.mCustomScrollbar();
  setTimeout(function () {
    putMessage(FIRST_MESSAGE);
  }, 100);
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar("scrollTo", "bottom", {
    scrollInertia: 10,
    timeout: 0,
  });
}

function setDate() {
  d = new Date();
  m = d.getMinutes();
  $(
    '<div class="timestamp">' +
      zeroPadding(d.getHours(), 2) +
      ":" +
      zeroPadding(m, 2) +
      "</div>"
  ).appendTo($(".message:last"));
}

function zeroPadding(num, len) {
  return (Array(len).join("0") + num).slice(-len);
}

$(".message-submit").click(function () {
  insertMessage();
});

$(window).on("keydown", function (e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
});

// 以下UOC

const setUserId = () => {
  // coolieの取得
  userId = Cookies.get("userId");
  if (!userId) {
    // userIdにタイムスタンプを利用した一意の値を設定
    userId = new Date().getTime() + Math.random().toString(36).slice(2);
    Cookies.set("userId", userId, { expires: 365 });
  }
};

const putMessage = (message) => {
  //ローディングの破棄
  $(".message.loading").remove();

  $(
    '<div class="message new"><figure class="avatar"><img src="./contents/img/icon.png" /></figure>' +
      message +
      "</div>"
  )
    .appendTo($(".mCSB_container"))
    .addClass("new");
  setDate();

  updateScrollbar();
  i++;
};

const putImg = (imgUrl) => {
  const img = new Image();
  img.src = imgUrl;
  img.onload = () => {
    const imgdom = `<img src="${imgUrl}" class="thumbnailI" alt="役職画像" />`;
    $(
      '<div class="message new"><figure class="avatar"><img src="./contents/img/icon.png" /></figure>' +
        imgdom +
        "</div>"
    )
      .appendTo($(".mCSB_container"))
      .addClass("new");
    setDate();
    updateScrollbar();
    i++;
  };
};

const insertMessage = async () => {
  msg = $(".message-input").val();
  if ($.trim(msg) == "") {
    return false;
  }
  $('<div class="message message-personal">' + msg + "</div>")
    .appendTo($(".mCSB_container"))
    .addClass("new");
  setDate();
  $(".message-input").val(null);
  updateScrollbar();

  const data = await callApi(msg);
  putMessage(getText(data));
  const imgUrl = getImg(data);
  if (imgUrl) {
    putImg(imgUrl);
  }
};

const callApi = async (message) => {
  const url = new URL("https://insidergamehelper.herokuapp.com/callapi");
  url.searchParams.append("userId", userId);
  url.searchParams.append("message", message);
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    return null;
  }
};

const getText = (data) => {
  const firstMessage = data[0];
  const messageType = firstMessage.type;

  switch (messageType) {
    case "text":
      return firstMessage.text;
    case "template":
      return firstMessage.template.text;
  }
};

const getImg = (data) => {
  const firstMessage = data[0];
  const messageType = firstMessage.type;

  switch (messageType) {
    case "template":
      return firstMessage.template.thumbnailImageUrl;
  }
  return null;
};
