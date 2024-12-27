// async function runExample() {
//   // Create an ONNX inference session with WebGL backend.
//   const session = new onnx.InferenceSession({ backendHint: 'webgl' });
//   console.log('Loading model...')

//   // Load an ONNX model. This model is Resnet50 that takes a 1*3*224*224 image and classifies it.
// //   const path_to_model = "./cnn6.onnx"
//   const path_to_model = "https://cdn.glitch.com/f997e8ab-24ac-475d-ae6e-34a6681dc9a8%2FsqueezenetV1_8.onnx?v=1618507515646"
//   await session.loadModel(path_to_model);
//   console.log('Model loaded...')
//   // Load image.

// }

// Option 1 for recording audio

// AUDIO STUFF

// const recordAudio = () => {
//   return new Promise(resolve => {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(stream => {
//         const mediaRecorder = new MediaRecorder(stream);
//         const audioChunks = [];

//         mediaRecorder.addEventListener("dataavailable", event => {
//           audioChunks.push(event.data);
//         });

//         const start = () => {
//           mediaRecorder.start();
//         };

//         const stop = () => {
//           return new Promise(resolve => {
//             mediaRecorder.addEventListener("stop", () => {
//               const audioBlob = new Blob(audioChunks);
//               const audioUrl = URL.createObjectURL(audioBlob);
//               const audio = new Audio(audioUrl);
//               const play = () => {
//                 audio.play();
//               };

//               resolve({ audioBlob, audioUrl, play });
//             });

//             mediaRecorder.stop();
//           });
//         };

//         resolve({ start, stop });
//       });
//   });
// };

// async function app() {
//   const recorder = await recordAudio();
//   recorder.start();

//   setTimeout(async () => {
//     const audio = await recorder.stop();
//     audio.play();
//   }, 3000);
// };


// class lambdaLayer extends tf.layers.Layer {
//     constructor(config) {
//         super(config);
//         if (config.name === undefined) {
//             config.name = ((+new Date) * Math.random()).toString(36); //random name from timestamp in case name hasn't been set
//         }
//         this.name = config.name;
//         this.lambdaFunction = config.lambdaFunction;
//         this.lambdaOutputShape = config.lambdaOutputShape;
//     }

//     call(input) {
//         return tf.tidy(() => {
//             let result = null;
//             eval(this.lambdaFunction);
//             return result;
//         });
//     }

//     computeOutputShape(inputShape) {
//         if (this.lambdaOutputShape === undefined) { //if no outputshape provided, try to set as inputshape
//             return inputShape[0];
//         } else {
//             return this.lambdaOutputShape;
//         }
//     }

//     getConfig() {
//         const config = super.getConfig();
//         Object.assign(config, {
//             lambdaFunction: this.lambdaFunction,
//    lambdaOutputShape: this.lambdaOutputShape
//         });
//         return config;
//     }

//     static get className() {
//         return 'lambdaLayer';
//     }
// }
// tf.serialization.registerClass(lambdaLayer);

class ReduceMean extends tf.layers.Layer {
    constructor() {
        super();
    }

    call(input) {
        return tf.tidy(() => {
            const tensor = tf.mean(input[0],3,keepDims=false);
            console.log(tensor);
            return tensor;
        });
    }

    computeOutputShape(inputShape) {
        return [inputShape[0], inputShape[1], inputShape[2]]
      }
    
    getConfig() {
        const config = super.getConfig();
        return config;
    }

    static get className() {
        return 'ReduceMean';
    }
}
tf.serialization.registerClass(ReduceMean);


class SoftMax extends tf.layers.Layer {
    constructor() {
        super();
    }

    call(input) {
        return tf.tidy(() => {
            const tensor = tf.softmax(input[0]);
            return tensor;
        });
    }

    getConfig() {
        const config = super.getConfig();
        return config;
    }

    static get className() {
        return 'SoftMax';
    }
}
tf.serialization.registerClass(SoftMax);

// Option 2 for recording audio


let mic, recorder, soundFile;

let state = 0; // mousePress will increment from Record, to Stop, to Play

function setup() {
  var myCanvas = createCanvas(400, 200);
  myCanvas.parent('spect');
  // background(150);
  // fill(0);
  // text('Enable mic and click the mouse to begin recording', 20, 20);

  // create an audio in
  mic = new p5.AudioIn();

  // users must manually enable their browser microphone for recording to work properly!
  mic.start();

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();
}

const sleep = m => new Promise(r => setTimeout(r, m))

function record() {
    return Promise.resolve()
        .then (async function(){
            recorder.record(soundFile);
            await sleep(3000)
        })
        .then (function(){
            recorder.stop()
            // console.log(soundFile.buffer);
            processSound();
        })
}

const path_to_model = './cnn14_tfjs_keras/model.json';  //'./cnn14_tfjs_keras/model.json';

async function processSound() {
  
    soundFile.play(); // play the result!
    
    // Obtain spectrogram 
    spectrogram = createSpectrogram(soundFile.buffer,true);
    image(spectrogram,10,10,400,170)
    // console.log(spectrogram.imageData.data);
    
    const imgHeight = 662;
    const imgWidth = 64;
    const channels = 1;
    const data = preprocess(spectrogram.imageData.data, imgHeight, imgWidth, channels);
  
    // ONNX Stuff 
//     const tensor = new onnx.Tensor(data, 'float32', [1,channels,imgHeight,imgWidth]);
//     const session = new onnx.InferenceSession({ backendHint: 'webgl' });
    // Load an ONNX model. This model is Resnet50 that takes a 1*3*224*224 image and classifies it.
//     const path_to_model = "https://cors-anywhere.herokuapp.com/https://drive.google.com/file/d/1-s4vHfWx9zXUoUYTx7aR4jMRq3n4YdOZ/view?usp=sharing" //"./cnn6.onnx"
//     await session.loadModel(path_to_model);
//     const outputMap = await session.run([tensor]);
//     // const outputData = outputMap.values().next().value.data;
//     printMatches(outputMap.get("artist").data,'artist');
    // END ONNX STUFF
  
    console.log('Loading model...')
    // model = await tf.loadGraphModel(path_to_model);  
    model = await tf.loadLayersModel(path_to_model);
    console.log('Model loaded...')
    //model.predict(tf.zeros([1,channels,imgHeight,imgWidth])).dispose();
    
    const tensor = new tf.tensor(data,[1,channels,imgHeight,imgWidth],'float32');
    outputs = model.predict(tensor);
    console.log(outputs)
    printMatches(outputs,'artist');
  
}

// async function mousePressed() {
//   // use the '.enabled' boolean to make sure user enabled the mic (otherwise we'd record silence)
//   if (state === 0 && mic.enabled) {
//     // Tell recorder to record to a p5.SoundFile which we will use for playback
//     recorder.record(soundFile);

//     background(255, 0, 0);
//     text('Recording now! Click to stop.', 20, 20);
//     state++;
//   } else if (state === 1) {
//     recorder.stop(); // stop recorder, and send the result to soundFile

//     background(0, 255, 0);
//     text('Recording stopped. Click to play & save', 20, 20);
//     state++;
//   } else if (state === 2) {
//     soundFile.play(); // play the result!
    
//     // Obtain spectrogram 
//     spectrogram = createSpectrogram(soundFile.buffer,true);
//     image(spectrogram,10,10)
//     // console.log(spectrogram.imageData.data);
    
//     const imgHeight = 662;
//     const imgWidth = 64;
//     const channels = 1;
//     const data = preprocess(spectrogram.imageData.data, imgHeight, imgWidth, channels);
//     const tensor = new onnx.Tensor(data, 'float32', [1,channels,imgHeight,imgWidth]);
    
//     const session = new onnx.InferenceSession({ backendHint: 'webgl' });
//     console.log('Loading model...')
//     // Load an ONNX model. This model is Resnet50 that takes a 1*3*224*224 image and classifies it.
//     const path_to_model = "https://cdn.glitch.com/f997e8ab-24ac-475d-ae6e-34a6681dc9a8%2Fcnn6.onnx?v=1618659068286"
//     await session.loadModel(path_to_model);
//     console.log('Model loaded...')
//     const outputMap = await session.run([tensor]);
//     // const outputData = outputMap.values().next().value.data;
//     printMatches(outputMap.get("artist").data,'artist');
//     // printMatches(outputMap.get("song").data,'song');
    
//     // saveSound(soundFile, 'mySound.wav'); // save file
//     state++;
//   }
// }

function ClassesTopK(classProbabilities, k, classType) {
  
  if (!k) { k = 5; }
  const probs = Array.from(classProbabilities);
  const probsIndices = probs.map(
    function (prob, index) {
      return [prob, index];
    }
  );
  const sorted = probsIndices.sort(
    function (a, b) {
      if (a[0] < b[0]) {
        return -1;
      }
      if (a[0] > b[0]) {
        return 1;
      }
      return 0;
    }
  ).reverse();
  const topK = sorted.slice(0, k).map(function (probIndex) {
    let iClass;
    if (classType == 'artist') {
      iClass = artistClasses[probIndex[1]]; // imagenetClasses[probIndex[1]]
    }
    if (classType == 'song') {
      iClass = songClasses[probIndex[1]];
    }

    return {
      // id: iClass[0],
      index: parseInt(probIndex[1], 10), // probIndex[1]
      name: iClass, //iClass[1].replace(/_/g, ' '),
      probability: probIndex[0]
    };
  });
  return topK;
}


function printMatches(data, classType) {
  let outputClasses = [];
  if (!data || data.length === 0) {
    const empty = [];
    for (let i = 0; i < 5; i++) {
      empty.push({ name: '-', probability: 0, index: 0 });
    }
    outputClasses = empty;
  } else {
    outputClasses = ClassesTopK(data, 5, classType);
  }
  const predictions = document.getElementById(classType + 'predictions');
  predictions.innerHTML = '';
  const results = [];
  for (let i of [0, 1, 2, 3, 4]) {
    
    const element = document.getElementById(`prediction-${i}`);    
    element.children[0].children[0].style.height = `${outputClasses[i].probability * 100}%`;
    element.children[1].innerText = outputClasses[i].name;
    element.className = outputClasses[i].probability === Math.max(...data) ? "prediction-col top-prediction": "prediction-col";
    // default version next
    // results.push(`${outputClasses[i].name}: ${Math.round(100 * outputClasses[i].probability)}%`);
  }
  // default version next
  // predictions.innerHTML = results.join('<br/>');
}

function preprocess(data, width, height, channels) {
  const dataFromImage = ndarray(new Float32Array(data), [height, width, channels + 1]);
  const dataProcessed = ndarray(new Float32Array(width * height * channels), [1, channels, height, width]);
  
  // console.log(dataFromImage);
  // Normalize 0-255 to (-1)-1
  // ndarray.ops.divseq(dataFromImage, 128.0);
  // ndarray.ops.subseq(dataFromImage, 1.0);

  // Realign imageData from [224*224*4] to the correct dimension [1*3*224*224].
  ndarray.ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 2));
  ndarray.ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
  ndarray.ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 0));

//   dataProcessed = dataProcessed.transpose(0,3,1,2);
  
  return dataProcessed.data;
}

// Extra stuff for visualization and spectrogram conversion

// var SR_model = 16000;
var NB_mel = 64; //128    // Num of MelFilterBank bins
var MIN_DB = -80; 

function createSpectrogram(buffer, returnsImage){

   const fftSize = 512; //1024               // fft window size
   const hopSize = 256;    //256            // overlap size
   const channelOne = buffer.getChannelData(0);  // use only the first channel
   const bufferLength = buffer.length;
   const sampleRate = buffer.sampleRate;
   const spectrogram = [];
   const db_spectrogram = [];
   const melCount = NB_mel; 

   // Create a fft object. Here we use default "Hanning" window function
   const fft = new FFT(fftSize, sampleRate); 

   // Mel Filterbanks
   var melFilterbanks = constructMelFilterBank(fftSize/2, melCount, 
                                               lowF=0, highF=sampleRate/2, sr=sampleRate);

   // Segment 
   let currentOffset = 0;
   let maxValue = 0.0;

   var maxdb = -100;
   while (currentOffset + fftSize < channelOne.length) {
      const segment = channelOne.slice(currentOffset, currentOffset + fftSize); 
      fft.forward(segment);  // generate spectrum for this segment
      let spectrum = fft.spectrum.map(x => x * x); // should be power spectrum!

      const melspec = applyFilterbank(spectrum, melFilterbanks);

      for (let j = 0; j < melCount; j++) {
         melspec[j] += 0.000000001; // avoid minus infinity
      }

      const decibels = new Float32Array(melCount); 
      for (let j = 0; j < melCount; j++) {
         // array[j]    = Math.max(-255, Math.log10(melspec[j]) * 100);  // for drawing  
         db = 10 * Math.log10(melspec[j]);
         decibels[j] = db;               
         if (db > maxdb) maxdb  = db;
      }
      db_spectrogram.push(decibels);
      currentOffset += hopSize;
   }
   for (let i=0; i < db_spectrogram.length; i++){
      for (let j = 0; j < melCount; j++){
         db_spectrogram[i][j]  -= maxdb; // i is time bins, j is mel bins
      }
   }
  
   // Create P5 Image and return for showing  the waveform
   if (returnsImage){
      var specW = 662; //melCount;
      var specH = melCount; //melCount;
      var img = createImage(specW, specH);
      img.loadPixels();
      for (var i = 0; i < img.width; i++) {
         for (var j = 0; j < img.height; j++) {
            var c = MIN_DB; // minimum dB value             
            if (i < db_spectrogram.length) c = db_spectrogram[i][img.height - j - 1]; // Y-axis should be flipped.
            c = map(c, MIN_DB, 0, 0, 255);
            img.set(i, j, color(c));     
         }
      }
      img.updatePixels();
      // filter(GRAY);
      return img;
   }

   return db_spectrogram;
}

function sum(array) {
   return array.reduce(function(a, b) { return a + b; });
}

function applyFilterbank(spectrum, filterbank) {
   if (spectrum.length != filterbank[0].length) {
      console.error(`Each entry in filterbank should have dimensions matching
FFT. |FFT| = ${spectrum.length}, |filterbank[0]| = ${filterbank[0].length}.`);
      return;
   }

   // Apply each filter to the whole FFT signal to get one value.
   let out = new Float32Array(filterbank.length);
   for (let i = 0; i < filterbank.length; i++) {
      const win = applyWindow(spectrum, filterbank[i]);
      out[i] = sum(win);
   }
   return out;
}

function  applyWindow(buffer, win) {
   let out = new Float32Array(buffer.length);
   for (let i = 0; i < buffer.length; i++) {
      out[i] = win[i] * buffer[i];
   }
   return out;
}


function melsToHz(mels) {
   return 700 * (Math.exp(mels / 1127) - 1);
}

function hzToMels(hertz) {
   return 1127 * Math.log(1 + hertz/700);
}


function constructMelFilterBank(fftSize, nFilters, lowF, highF, sr) {
   var bins = [],
       fq = [],
       filters = [];

   var lowM = hzToMels(lowF),
       highM = hzToMels(highF),
       deltaM = (highM - lowM) / (nFilters+1);

   // Construct equidistant Mel values between lowM and highM.
   for (var i = 0; i < nFilters; i++) {
      // Get the Mel value and convert back to frequency.
      // e.g. 200 hz <=> 401.25 Mel
      fq[i] = melsToHz(lowM + (i * deltaM));

      // Round the frequency we derived from the Mel-scale to the nearest actual FFT bin that we have.
      // For example, in a 64 sample FFT for 8khz audio we have 32 bins from 0-8khz evenly spaced.
      bins[i] = Math.floor((fftSize+1) * fq[i] / (sr/2));
   }

   // Construct one cone filter per bin.
   // Filters end up looking similar to [... 0, 0, 0.33, 0.66, 1.0, 0.66, 0.33, 0, 0...]
   for (var i = 0; i < bins.length; i++)
   {
      filters[i] = [];
      var filterRange = (i != bins.length-1) ? bins[i+1] - bins[i] : bins[i] - bins[i-1];
      filters[i].filterRange = filterRange;
      for (var f = 0; f < fftSize; f++) {
         // Right, outside of cone
         if (f > bins[i] + filterRange) filters[i][f] = 0.0;
         // Right edge of cone
         else if (f > bins[i]) filters[i][f] = 1.0 - ((f - bins[i]) / filterRange);
         // Peak of cone
         else if (f == bins[i]) filters[i][f] = 1.0;
         // Left edge of cone
         else if (f >= bins[i] - filterRange) filters[i][f] = 1.0 - (bins[i] - f) / filterRange;
         // Left, outside of cone
         else filters[i][f] = 0.0;
      }
   }

   // Store for debugging.
   filters.bins = bins;

   // Here we actually apply the filters one by one. Then we add up the results of each applied filter
   // to get the estimated power contained within that Mel-scale bin.
   //
   // First argument is expected to be the result of the frequencies passed to the powerSpectrum
   // method.
   return filters;
}
