feather.replace();


//gets the html elements
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video#live');
const recordedVideo = document.querySelector('video#recording');
const canvas = document.querySelector('canvas');
const screenshotImage = document.querySelector('img');
const controls = document.querySelector('.controls');
const videoControls = document.querySelector('.video-controls');
const photoControls = document.querySelector('.photo-controls');
const buttons = [...controls.querySelectorAll('button')];
const videoButtons = [...videoControls.querySelectorAll('button')];
const photoButtons = [...photoControls.querySelectorAll('button')];
const [start, pause, record, stop] = buttons;
const [download, play] = videoButtons;
const [screenshot, save] = photoButtons;

let streamStarted = false;

let recorder;
var recordedBlobs = [];

var options = {mimeType: "video/webm; codecs=vp9"};

//resolution of the video
const constraints = {
    //audio: true,
    video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440
    }
  }
};

//original code apart from css changes 
//goes through and selects video input devices
const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const options = videoDevices.map(videoDevice => {
        return `<options value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
    })
    cameraOptions.innerHTML = options.join('');
};

cameraOptions.onchange = () => {
  const updatedConstraints = {
    ...constraints,
    deviceId: {
      exact: cameraOptions.value
    }
  };

  startStream(updatedConstraints);
};

start.onclick = () => {
  if (streamStarted) {
  //method starts playing current video 
    video.play();
      start.classList.add('d-none');
      pause.classList.remove('d-none');
    return;
  }
    //checks if the mediaDevices API exists within the navigator then if the getUserMedia API is available in the mediaDevices
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    const updatedConstraints = {
      ...constraints,
        deviceId: {
            exact: cameraOptions.value
        }
    };
      
    startStream(updatedConstraints);
      
  }
};

const pauseStream = () => {
  video.pause();
  start.classList.remove('d-none');
  pause.classList.add('d-none');
    
    record.classList.add('d-none');
    download.classList.add('d-none');
    
};

const doScreenshot = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  screenshotImage.src = canvas.toDataURL('image/webp');
  screenshotImage.classList.remove('d-none');
};


screenshot.onclick = () => {
    doScreenshot();
    save.classList.remove('d-none');
}

pause.onclick = pauseStream;



const startStream = async (constraints) => {
    //requests user permisson
  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  handleStream(stream);
    //creates a recorder media using the video stream and set options
    recorder = new MediaRecorder(stream, options);
};



const handleStream = (stream) => {
    //mediaStream from the camera is assigned to created video element
  video.srcObject = stream;
    
    start.classList.add('d-none');
    pause.classList.remove('d-none');
    screenshot.classList.remove('d-none');
    record.classList.remove('d-none');
    
};

getCameraSelection();

//end of original code


//record triggers when button clicked 
record.onclick = (stream) => {
    //array to contain recorded data
    recordedBlobs =[];
    
    record.classList.add('d-none');
    stop.classList.remove('d-none');
    play.classList.add('d-none');
    recordedVideo.classList.add('d-none');
    download.classList.add('d-none');
    //recorder.addEventListener('dataavailable', onRecordingReady);
    
    //fired when the recorder delivers media data for use 
    recorder.ondataavailable = handleDataAvailable;
    
    //start recording
    recorder.start();
}

//pushs the recorded data into an array for use
function handleDataAvailable(event){
    if(event.data && event.data.size > 0){
        recordedBlobs.push(event.data);
    }
}

//stop recording 
stop.onclick=()=>{
    
    record.classList.remove('d-none');
    stop.classList.add('d-none');
    play.classList.remove('d-none');
    download.classList.remove('d-none');
    recorder.stop();
    
    //play.click();
    
}

//
//function onRecordingReady(e){
//    recordedVideo.src = URL.createObjectURL(e.data);
//    recordedVideo.play();
//}


download.onclick = () => {
    
    //binaryData.push(recordedVideo);
    //raw data for processing
    const blob = new Blob(recordedBlobs, {type:'video/webm'});
    //create the domstring containing the url 
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.style.display='none';
    a.href=url;
    //downloads
    var video_id = get_id();
    a.download = 'video'+video_id+'.webm';
    document.body.appendChild(a);
    a.click();
    //releases the url 
    window.URL.revokeObjectURL(url);
  
}



//plays the recorded video when clicked
play.onclick = () => {
    const superBuffer = new Blob(recordedBlobs, {type:'video/webm'});
    recordedVideo.src=null;
    recordedVideo.srcObject = null;
    recordedVideo.src= window.URL.createObjectURL(superBuffer);
    recordedVideo.play();

    recordedVideo.classList.remove('d-none');
}

//saves the screenshot
save.onclick = () => {
    //returns a data containig the image in png 
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    var photo_id = get_id();
    link.download = 'photo'+photo_id+'.png';
    link.href = image;
    //downloads
    link.click();
}


function get_id() {
    var newDate = new Date();
    return newDate.getTime();
}


