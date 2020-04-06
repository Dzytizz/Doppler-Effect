var ctx, w, h, maxCount = 25, radiusGap = 10;
var wave = [];
var textbox1;

function start()
{
  canvas = document.getElementById('canvas1');
  w = canvas.width = window.innerWidth;
  h = canvas.height ;
  ctx = canvas.getContext('2d');

  textbox1 = document.getElementById("textbox1")

  for(var i = 0; i<5;i++)
  {
    wave.push(new createWave(150,h/2,1+i*radiusGap));
  }
  draw();
}


function draw()
{
   ctx.clearRect(0,0,w,h);
   ctx.save();


   for(var i = 0;i<wave.length;i++)
   {
     ctx.beginPath();
     wave[i].r++;
     move(textbox1.value);
     wave[i].a = squareFalloff(wave[i].a,i);

     if(wave[i].x - wave[i].r>w+wave[wave.length-1].r)
     {
       wave[i].x = -wave[i].r;
     }

     ctx.arc(wave[i].x, wave[i].y, wave[i].r, 0, 2 * Math.PI);
     ctx.strokeStyle = "rgba(0,85,0," + wave[i].a + ")";
     ctx.stroke();
   }

   if(wave[wave.length-1].r%radiusGap == 0)
   {
     wave.unshift(new createWave(wave[0].x,wave[0].y,1));
     if(wave.length>maxCount)
     {
       wave.pop();
     }
   }

   ctx.beginPath();
   ctx.arc(wave[0].x,wave[0].y,5,0,2*Math.PI);
   ctx.fillStyle = "#F00";
   ctx.fill();

   ctx.restore();
   requestAnimationFrame(draw);
}

function createWave(newX,newY,newR)
{
  this.x = newX;
  this.y = newY;
  this.r = newR
  this.a = 1;
}

function move(speed)
{
  speed/=4000;
  for(var i = 0;i<wave.length;i++)
  {
    wave[i].x += speed/(i+1);
  }
}

function squareFalloff(a,i)
{
  return a - 0.0001*(i*i);
}
