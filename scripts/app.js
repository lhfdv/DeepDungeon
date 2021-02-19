class Player{
    constructor(ctx, canvasSize, posX, posY, width, height){
      this.ctx = ctx;
      this.pos = { x: posX, y: posY };
      this.size = { w: width, h: height };
      this.canvas = canvasSize;
      this.imagePlayer = new Image();
      this.imagePlayer.src = `../images/player.jfif`;
    }
  
    movePlayer(distance) {

    }
  
    drawPlayer(){
      this.ctx.drawImage(this.imagePlayer, this.pos.x, this.pos.y, this.size.w, this.size.h);
    }
}
