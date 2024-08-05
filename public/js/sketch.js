let classification_results;
let countdownInterval;
let countdown = 3;

function setup() {
  let p5canvas = createCanvas(400, 400);
  p5canvas.parent('#canvas');

  // お手々が見つかると以下の関数が呼び出される．resultsに検出結果が入っている．
  gotClassification = function (results) {
    classification_results = results;
    adjustCanvas();
  }
}

  // カウントダウンが終わったらカメラを起動
  /*const webcamButton = document.getElementById('webcamButton');
  webcamButton.addEventListener('click', () => {
    document.getElementById('status').innerText = 'Starting in 3...';
    countdown = 3;
    countdownInterval = setInterval(startCountdown, 1000);
  });
}

function startCountdown() {
  countdown--;
  if (countdown > 0) {
    document.getElementById('status').innerText = `Starting in ${countdown}...`;
  } else {
    clearInterval(countdownInterval);
    document.getElementById('status').innerText = 'Webcam enabled';
    // Webcamを有効にするためのコードをここに追加
  }
}*/

function draw() {
  // 描画処理
  clear();  // これを入れないと下レイヤーにあるビデオが見えなくなる

  if (classification_results) {
    let name = classification_results.classifications[0].categories[0].categoryName;
    let score = classification_results.classifications[0].categories[0].score;
    console.log(classification_results.classifications[0].categories[0]);
    textSize(48);
    text(`${name}: ${(score * 100).toFixed(0)} %`, 20, 64);
    /*document.querySelector('#score').innerHTML = score;*/
    if (window.socket) {
      const socket = window.socket;
      socket.emit('classification', { name, score });
    }
  }

}

function windowResized() {
  adjustCanvas();
}

function adjustCanvas() {
  var element_webcam = document.getElementById('webcam');
  resizeCanvas(element_webcam.clientWidth, element_webcam.clientHeight);
}
