var ctx, w, h, maxCount = 25, radiusGap = 20;
var wave = [];

var textbox1,frequencyText,inputText,outputText,calculatedText,frequencySlider;

var context,onState = false, frequency=440, onStateOutput = false,volume = 0.1,o,oOut;

var inputSpeed = 0,outputSpeed = 0;

function start()
{
  // html element setup
  canvas = document.getElementById('canvas1');
  w = canvas.width = document.body.clientWidth;
  h = canvas.height ;
  ctx = canvas.getContext('2d');
  textbox1 = document.getElementById("textbox1")
  frequencyText = document.getElementById("frequencyText");
  inputText = document.getElementById("inputText");
  outputText = document.getElementById("outputText");
  calculatedText = document.getElementById("calculatedText");
  frequencySlider = document.getElementById("slider2");


  // wave instantiation
  for(var i = 0; i<3;i++)
  {
    wave.push(new createWave(150,h/2,1+i*radiusGap));
  }
  draw();
}


function draw()
{
   ctx.clearRect(0,0,w,h);
   ctx.save();

   // main loop
   for(var i = 0;i<wave.length;i++)
   {
     ctx.beginPath();

     // values that change over time(x, r, a)
     move(textbox1.value);
     if(i!==0 && i!==1)
     {
       wave[i].r++;
     }
     wave[i].a = squareFalloff(wave[i].a,i);

     // if wave goes off screen bounce it back
     if(wave[i].x >= w || wave[i].x <= 0)
     {
       wave[i].v *= -1;
     }

     // draw waves
     ctx.arc(wave[i].x, wave[i].y, wave[i].r, 0, 2 * Math.PI);
     ctx.strokeStyle = "rgba(0,85,0," + wave[i].a + ")";

     ctx.stroke();
   }

   // generate new waves in center (and move them to start of array)
   if(wave[wave.length-1].r % radiusGap == 0)
   {
     wave.unshift(new createWave(wave[0].x,wave[0].y,1,wave[0].v));


     // remove if reaches cap
     if(wave.length > maxCount)
     {
       wave.pop();
     }
   }

   // draw first wave (red circle)
   ctx.beginPath();
   ctx.arc(wave[0].x,wave[0].y,5,0,2*Math.PI);
   ctx.fillStyle = "#F00";
   ctx.fill();

   ctx.restore();
   requestAnimationFrame(draw);
}

// wave constructor
function createWave(newX,newY,newR,newV = 1)
{
  this.x = newX;
  this.y = newY;
  this.r = newR
  this.a = 1;
  this.v = newV;
}

// wave movement
function move(speed)
{
  if(speed == "-")
  {
    speed = -1;
  }
  else if(isNaN(speed))
  {
    speed = 0;
  }
  speed/=7750;
  for(var i = 0;i<wave.length;i++)
  {
    wave[i].x += (speed/(i+1)) * wave[i].v;
  }
}

// square falloff for alpha
function squareFalloff(a,i)
{
  return a - 0.0001*(i*i);
}

// change volume of both oscillators
function changeVolume(obj)
{
  volume = obj.value/1000;
  if(g !== undefined)
  {
    if(g.gain.value > 0.01)
    {
      g.gain.value = volume;
    }
    if(gOut.gain.value > 0.01)
    {
      gOut.gain.value = volume;
    }
  }
}

// change frequency with slider and using formula
function changeFrequency(obj)
{
  calculateFrequency();
  if(o !== undefined)
  {
    o.frequency.value = obj.value;
  }

  frequencyText.innerHTML ="Dažnis (" + Math.round(frequencySlider.value) + "Hz):";
}

// change input speed with slider
function changeInputSpeed(obj)
{
  inputSpeed = obj.value;
  inputText.innerHTML = "Klausytojo greitis link šaltinio (" + inputSpeed + "m/s):"
  calculateFrequency();
}

// change output speed with slider
function changeOutputSpeed(obj)
{
  outputSpeed = obj.value;
  outputText.innerHTML = "Šaltinio greitis link klausytojo (" + outputSpeed + "m/s):"
  calculateFrequency();
}

function playSound()
{
  // generate oscillator
  if (context == undefined)
  {
    context = new AudioContext();
    o = context.createOscillator();
    g = context.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(context.destination);
    o.frequency.value=frequencySlider.value;
    o.start();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 1);

    oOut = context.createOscillator();
    gOut = context.createGain();
    oOut.type = "sine";
    oOut.connect(gOut);
    gOut.connect(context.destination);
    oOut.frequency.value = frequency;
    oOut.start();
    gOut.gain.value = 0.0001;
  }

  //switch
  onState=!onState;
  if(onState)
  {
    g.gain.exponentialRampToValueAtTime(volume, context.currentTime + 1);
  }
  else if(!onState)
  {
    g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1);
  }
}

function playOutputSound()
{
  // generate oscillator
  if (context == undefined)
  {
    context = new AudioContext();
    o = context.createOscillator();
    g = context.createGain();
    o.type = "sine";
    o.connect(g);
    g.connect(context.destination);
    o.frequency.value = frequencySlider.value;
    o.start();
    g.gain.value = 0.0001;;

    oOut = context.createOscillator();
    gOut = context.createGain();
    oOut.type = "sine";
    oOut.connect(gOut);
    gOut.connect(context.destination);
    oOut.frequency.value = frequency;
    oOut.start();
    gOut.gain.value = 0.0001;
    gOut.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.5);

  }

  // switch
  onStateOutput=!onStateOutput;
  if(onStateOutput)
  {
    gOut.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.5);
  }
  else if(!onStateOutput)
  {
    gOut.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
  }
}

// calculates frequency with formula
function calculateFrequency()
{
    frequency = Number(frequencySlider.value) * (((343+Number(inputSpeed)))/(343-Number(outputSpeed)));
    calculatedText.innerHTML = "Apskaičiuotas(girdimas) dažnis: "+ frequency.toFixed(2) +"Hz";

    if(oOut !== undefined)
    {
      oOut.frequency.value = frequency;
    }
}
