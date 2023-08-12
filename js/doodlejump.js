
//Phần biến cho board
let context;
let board;
let boardHeight = 753;
let boardWidth = 503;


//Phần biến cho doodler
let doodlerHeight = 70;
let doodlerWidth = 70;
let doodlerLeftImg;
let doodlerRightImg;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight,
}

//Phần biến cho di chuyển
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -5.11 ;
let gravity =  0.09;

//Phần biến cho platform
let platformArray = [];
let platformHeight = 29;
let platformWidth = 97;
let platformImg;

//Phần biến cho điểm
let score = 0;
let highscore= 0;

//Phần biến cho gameover
let gameover = false;

// Phần biến cho âm thanh 
let soundJump;
let soundGameover;

// Phần biến lưu trữ điểm trên bảng xh
let headScoreBoard = "<thead><tr><td>Stt</td><td>Người chơi</td><td>Điểm số</td></tr></thead>"; 
let bodyScoreBoard;
let handleScoreBoard = [
    {name: 'Jonh', point: 20},
    {name: 'Mike', point: 30},
    {name: 'Jolie', point: 24},
    {name: 'Jason', point: 60},
    {name: 'Kylie', point: 50},
    {name: 'Travis', point: 350},
];
handleScoreBoard.sort(compareValues('point','desc'));

// let ScoreBoard = [];

// const tableScore = document.querySelector('#tableScore');
// console.log(tableScore);

window.onload = function(){
    board = document.getElementById('board');
    board.height =  boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Khởi tạo âm thanh 
    soundJump = new sound("../sounds/jump.wav");
    soundGameover = new sound("../sounds/gameover.wav");

    doodlerRightImg = new Image();
    doodlerRightImg.src = "/img/doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function(){
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height );
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "/img/doodler-left.png"

    platformImg = new Image();
    platformImg.src = "/img/platform.png"

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
    // placePlatforms();
    // document.addEventListener("keydown", moveDoodler);
}

//Hàm cập nhật chính
function update(){
    requestAnimationFrame(update);
    if(gameover){
        return;
    }
    context.clearRect(0, 0, board.width, board.height);
    //dùng để cho doodler di chuyển
    doodler.x += velocityX;
    

    if(doodler.x > boardWidth){
        doodler.x = 0;
    }else if(doodler.x + doodlerWidth < 0){
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;    
    if(doodler.y > board.height){
        gameover = true;
    }
    //cập nhật hình doodler
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //cập nhật hình platform    //platform[0] là platform bắt đầu có vị trị cố định ở giữa 
    for(let i = 0; i < platformArray.length; i++){
        let platform = platformArray[i];

        if(velocityY < 0 && doodler.y <= boardHeight*3/6){
            platform.y = platform.y + 6;  //để chạy các plat xuống khi doodler nhảy lên trên 
            if(platform.y >= boardHeight) { //tính điểm 
                score++;
            };
        }
        if(velocityY > 0 && dectectCollision(doodler, platform)){
                soundJump.play();
                velocityY = initialVelocityY;//để cho doodler nhảy
        }

        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }
    
    while(platformArray.length > 0 && platformArray[0].y >= boardHeight){
        platformArray.shift();
        newPlatform();
    }

    updateHighscore(score);
    context.fillStyle = "black";
    context.font = "20px sans-serif";
    context.fillText(score, 5, 25);

    // if(startGame){
    //     document.getElementById("boxStartbtn").style.visibility = 'hidden';
    //     document.getElementById("btnStart").style.visibility = 'hidden';
    //     document.getElementById("boxScorebtn").style.visibility = 'hidden';
    //     document.getElementById("btnScore").style.visibility = 'hidden';
    //     document.getElementById("yourScore").style.visibility = 'hidden';
    //     document.getElementById("board").style.backgroundImage="url(../img/doodlejumpbg.png)";
    //     document.getElementById("gifdoodle").style.visibility='hidden';
    // }
    if(gameover){
        soundGameover.play();
        context.fillText("Game Over: Press \"Space\" to Restart", boardWidth/4, boardHeight*7/8);
        document.getElementById("boxScorebtn").style.visibility = 'visible';
        document.getElementById("btnScore").style.visibility = 'visible';
        // document.getElementById("btnStart").value = 'Restart';
        document.getElementById("yourScore").style.visibility = 'visible';
        document.getElementById("yourScore").innerHTML = "<h1>Your Score: </h1>" + score + "<h2>Your High Score: </h2>" + highscore ;
        if(score == highscore && score > 0 && gameover){
            document.getElementById("yourScore").innerHTML = "<h1>Your Score: </h1>" + score + "<h2>Your High Score: </h2>" + highscore + "<span>New Record</span>" ;
        }
        document.getElementById("boxScorebtn").style.transform = 'translate(188px, 447px)';
        document.getElementById("btnScore").style.width = "155px";
        if(highscore > 0){
            handleScoreBoard.push({name: "You Here!", point: score});
        }
        handleScoreBoard.sort(compareValues('point','desc'));
    }
}
    
function placePlatforms(){
    platformArray = [];

    let platform = {
        img: platformImg,
        x: boardWidth/2 - doodlerX/3,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight,
    }

    platformArray.push(platform);

    for(let i = 1; i < 6; i++){
        let randomX = Math.floor(Math.random() * boardWidth*0.9);

        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 100*i - 150, //100*i là khoảng cách giữa các platform    
            width: platformWidth,
            height: platformHeight
        }
        
        platformArray.push(platform);
    }
}

//Hàm phát hiện chạm
function dectectCollision(a, b){
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}

//Hàm tạo ra platform mới 
function newPlatform(){
    let randomX = Math.floor(Math.random() * boardWidth*3/4);

        let platform = {
            img: platformImg,
            x: randomX,
            y: -platformHeight,     
            width: platformWidth,
            height: platformHeight
        }
        
        platformArray.push(platform);
}

//Hàm tính cập nhật highscore
function updateHighscore(score){
    highscore = Math.max(highscore, score);
}

// Hàm phát âm thanh
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}


// const btnStart = document.getElementById("btnStart").innerHTML;
//Hàm di chuyển trái phải doodler
function moveDoodler(e){
    if (e.code == "ArrowRight" || e.code == "KeyD"){
        velocityX = 1;
        doodler.img = doodlerRightImg;
    }else if(e.code == "ArrowLeft" || e.code == "KeyA"){
        velocityX = -1;
        doodler.img = doodlerLeftImg;
    }
    if(e.code == "Space" && gameover){
        document.getElementById("yourScore").style.visibility = 'hidden';
        document.getElementById("btnScore").style.visibility = 'hidden';
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight,
        }
        velocityX = 0;
        velocityY = initialVelocityY;
        maxScore = 0;
        score = 0;
        gameover = false;
        placePlatforms();
    }
}

function startGame(){
    doodler = {
        img: doodlerRightImg,
        x: doodlerX,
        y: doodlerY,
        width: doodlerWidth,
        height: doodlerHeight,
    }
    velocityX = 0;
    velocityY = initialVelocityY;
    maxScore = 0;
    score = 0;
    gameover = false;   
    doodlerRightImg = new Image();
    doodlerRightImg.src = "/img/doodler-right.png";
    doodler.img = doodlerRightImg;
    // doodlerRightImg.onload = function(){
    //     context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height );
    // }
    placePlatforms();
    document.addEventListener("keydown", moveDoodler);
        // maxScore = 0;
        // score = 0;
}
function showScore(){
    bodyScoreBoard = "<tr class='sc'></tr><td>"+ 1 +"</td><td>"+ handleScoreBoard[0].name +"</td><td>"+ handleScoreBoard[0].point +"</td></tr> <tr class='sc'></tr><td>"+ 2 +"</td><td>"+ handleScoreBoard[1].name +"</td><td>"+ handleScoreBoard[1].point +"</td></tr> <tr class='sc'></tr><td>"+ 3 +"</td><td>"+ handleScoreBoard[2].name +"</td><td>"+ handleScoreBoard[2].point +"</td></tr> <tr class='sc'></tr><td>"+ 4 +"</td><td>"+ handleScoreBoard[3].name +"</td><td>"+ handleScoreBoard[3].point +"</td></tr> <tr class='sc'></tr><td>"+ 5 +"</td><td>"+ handleScoreBoard[4].name +"</td><td>"+ handleScoreBoard[4].point +"</td></tr>";
    // for(let i=0; i<5; i++){
    //     bodyScoreBoard += "<tr class='sc'></tr><td>"+ (i+1) +"</td><td>"+ handleScoreBoard[i].name +"</td><td>"+ handleScoreBoard[i].point +"</td></tr>";
    //     // console.log(handleScoreBoard[i]);
    // }
    document.getElementById("boardScore").style.visibility = "visible";
    document.getElementById("boardScore").style.opacity = "100%";
    document.getElementById("btnXscore").style.opacity = "100%";
    document.getElementById("boardScore").style.transform = "translate(600px, 150px)";
    document.getElementById("tableScore").innerHTML = headScoreBoard + bodyScoreBoard;
}
function hideScore(){
    document.getElementById("boardScore").style.transition = "ease-in-out .35s";
    document.getElementById("boardScore").style.transform = "translate(600px, 250px)";
    document.getElementById("boardScore").style.opacity = "0%";
    document.getElementById("btnXscore").style.opacity = "0%";
}


// Hàm sắp xếp mảng object dùng để làm scoreboard
// hàm cho sắp xếp động
function compareValues ( key , order = 'asc' ) {
    return function ( a , b ) {
      if ( ! a . hasOwnProperty ( key ) || ! b . hasOwnProperty ( key ) ) {
        // không tồn tại tính chất trên cả hai object
          return 0 ;
      }
   
      const varA = ( typeof a [ key ] === 'string' ) ?
        a [ key ] . toUpperCase ( ) : a [ key ] ;
      const varB = ( typeof b [ key ] === 'string' ) ?
        b [ key ] . toUpperCase ( ) : b [ key ] ;
   
      let comparison = 0 ;
      if ( varA > varB ) {
        comparison = 1 ;
      } else if ( varA < varB ) {
        comparison = - 1 ;
      }
      return (
        ( order == 'desc' ) ? ( comparison * - 1 ) : comparison
      ) ;
    } ;
  }