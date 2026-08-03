/**
 * voice.js
 * النسخة المتوافقة مع نظام الاستئذان قبل تفعيل الصوت
 */
import { socket, socketManager } from './socketManager.js';
import { gameState } from './gameState.js'; 

let localStream = null;
let peerConnection = null;
let isMicActive = false;

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const micOffIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.88"></path>
    <path d="M19 10v2a7 7 0 0 1-11.5 5.5"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
</svg>`;

const micOnIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
</svg>`;

export const voiceChat = {
    init() {
        const micBtn = document.getElementById('mic-toggle-btn');
        if (!micBtn) return;

        this.updateMicUI(false);

        micBtn.addEventListener('click', () => {
            this.toggleMic();
        });

        socket.on('voice-offer', async (data) => {
            await this.handleOffer(data.offer);
        });

        socket.on('voice-answer', async (data) => {
            await this.handleAnswer(data.answer);
        });

        socket.on('voice-candidate', async (data) => {
            if (peerConnection && data.candidate) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {}
            }
        });
    },

    updateMicUI(isActive) {
        const micBtn = document.getElementById('mic-toggle-btn');
        if (!micBtn) return;

        if (isActive) {
            micBtn.innerHTML = micOnIcon;
            micBtn.style.background = 'rgba(46, 204, 113, 0.8) !important'; 
            micBtn.style.borderColor = '#2ecc71';
            micBtn.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.5)';
            micBtn.title = "إيقاف المايك";
        } else {
            micBtn.innerHTML = micOffIcon;
            micBtn.style.background = 'rgba(45, 48, 55, 0.65) !important'; 
            micBtn.style.borderColor = 'rgba(135, 206, 235, 0.4)';
            micBtn.style.boxShadow = '0 0 3px rgba(135, 206, 235, 0.3)';
            micBtn.title = "تشغيل المايك";
        }
    },

    async toggleMic() {
        if (!isMicActive) {
            if (gameState.onlineRoomID) {
                socketManager._showToast(gameState.lang === 'ar' ? "جاري انتظار موافقة الخصم ⏳..." : "Waiting for opponent's permission...");
                socket.emit('mic-request', { roomID: String(gameState.onlineRoomID).trim(), senderId: gameState.userProfile.id });
            }
        } else {
            this.closeCall();
            this.updateMicUI(false);
        }
    },

    async forceStartCall() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            isMicActive = true;
            this.updateMicUI(true);
            this.startCall();
        } catch (err) {
            alert(gameState.lang === 'ar' ? "تعذر الوصول إلى الميكروفون." : "Microphone access denied.");
        }
    },

    async startCall() {
        if (!gameState.onlineRoomID) return;
        
        peerConnection = new RTCPeerConnection(servers);

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.ontrack = (event) => {
            this.playRemoteAudio(event.streams[0]);
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voice-candidate', { roomID: gameState.onlineRoomID, candidate: event.candidate });
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('voice-offer', { roomID: gameState.onlineRoomID, offer: offer });
    },

    async handleOffer(offer) {
        peerConnection = new RTCPeerConnection(servers);

        if (localStream) {
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        }

        peerConnection.ontrack = (event) => {
            this.playRemoteAudio(event.streams[0]);
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voice-candidate', { roomID: gameState.onlineRoomID, candidate: event.candidate });
            }
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('voice-answer', { roomID: gameState.onlineRoomID, answer: answer });
    },

    async handleAnswer(answer) {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    },

    playRemoteAudio(stream) {
        let remoteAudio = document.getElementById('remote-audio-element');
        if (!remoteAudio) {
            remoteAudio = document.createElement('audio');
            remoteAudio.id = 'remote-audio-element';
            remoteAudio.autoplay = true;
            document.body.appendChild(remoteAudio);
        }
        remoteAudio.srcObject = stream;
    },

    closeCall() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        const remoteAudio = document.getElementById('remote-audio-element');
        if (remoteAudio) {
            remoteAudio.srcObject = null;
            remoteAudio.remove();
        }
        
        isMicActive = false;
    }
};

window.voiceChat = voiceChat;

document.addEventListener('DOMContentLoaded', () => {
    voiceChat.init();
});
