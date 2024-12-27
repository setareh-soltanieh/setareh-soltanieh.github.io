var wavesurfer = WaveSurfer.create({
    container: document.getElementById('waveform'),
    waveColor: '#F2EDD4',
    progressColor: '#46B54D'
});

wavesurfer.on('ready', function () {
  var spectrogram = Object.create(WaveSurfer.Spectrogram);
  spectrogram.init({
    wavesurfer: wavesurfer,
    container: document.getElementById('wave-spectrogram'),
    fftSamples: 512,
    labels: true
  });
});
  
wavesurfer.load('./song.mp3');
