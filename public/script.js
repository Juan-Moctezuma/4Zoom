// All JS FOR FRONT-END IS LOCATED HERE
/**
 * MAIN VARIABLE INITIALIZATION
 */
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

/**
 * CODE BLOCK FOR VIDEO STREAM PROMISE
 */
let videoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        });
    });

    socket.on('user-connected', (name) => {
        connectToNewUser(name, stream);
    });

    let text = $("input");
    console.log(text);

    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            //console.log(text.val())
            socket.emit('message', text.val());
            text.val('');
        }   
    });

    $('#send').click((e) => {
        if (text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('');
        }
    });

    // USER GETS PROMPT - FOR USERNAME SELECTION
    let noName = 'Username-' + Math.floor(Math.random() * 101);
    let name = prompt('What is your name?', noName);

    while (name == "" || name == null) {
        name = prompt('What is your name?', noName);
    }

    socket.emit('new-user', name);

    socket.on('chat-message', data => {
        $('.messages').append(`<li class="message"><i class="fas fa-star" style="margin-right: 5px;"></i><strong>${data.name} : </strong><br/>${data.message}</li>`);
        scrollToBottom();
    });
});

// FUNCTION THAT ALLOWS SCROLLING IN CHAT WINDOW (USED INSIDE PREVIOUS PROMISE)
const scrollToBottom = () => {
    let d = $('.chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

/**
 * CODE SECTION THAT ALLOWS NEW USER CONNECTION & STREAMING WHEN JOINING THE 'ROOM' 
 */
socket.on('user-disconnected', name => {
    if (peers[name]) peers[name].close()
});

peer.on('open', id => {
    // The following code line needs to get accepted by socket block on server.js
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (name, stream) => {
    // if you open a new tab with the same link, the original console should display that
    // console.log(userId);
    const call = peer.call(name, stream)
    const video = document.createElement('video')
    // This stream is your "friend's" stream
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
    call.on('close', () => {
        video.remove()
    });

    peers[name] = call
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    // when data gets loaded for specific stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};

/**
 * CODE BLOCK FOR 'MUTE' BUTTON
 */
const muteUnmute = () => {
    const enabled = videoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      videoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      videoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone-alt"></i>
      <span>MUTE</span>
    `
    document.querySelector('.mute_btn').innerHTML = html;
}
  
const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-alt-slash"></i>
        <span style="color: #e32636;">UNMUTE</span>
    `
    document.querySelector('.mute_btn').innerHTML = html;
}

/**
 * CODE BLOCK FOR 'STOP VIDEO' BUTTON
 */
const playStop = () => {
    //console.log('object')
    let enabled = videoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        videoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        videoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>STOP VIDEO</span>
    `
    document.querySelector('.video_btn').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span style="color: #e32636;">PLAY VIDEO</span>
    `
    document.querySelector('.video_btn').innerHTML = html;
}

/**
 * CODE BLOCK FOR 'HIDE CHAT' BUTTON
 */
let hidden = false;

function hide() {
    const html = `
        <i class="fas fa-comment-slash" id="chat_icon"></i>
        <span style="color: #e32636;" id="chat">SHOW CHAT</span>
    `
    document.getElementById('right_section').style.visibility = 'hidden';
    document.querySelector('.chat_btn').innerHTML = html;
    hidden = true;
}

function unhide() {
    const html = `
        <i class="fas fa-comment" id="chat_icon"></i>
        <span id="chat">HIDE CHAT</span>
    `
    document.getElementById('right_section').style.visibility = 'visible';
    document.querySelector('.chat_btn').innerHTML = html;
    hidden = false;
}

function hideUnhide() {
    hidden ? unhide() : hide();
}