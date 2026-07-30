// voice.js
import { socket } from './socketManager.js';
import { gameState } from './main.js';

let localStream = null;
let peerConnection = null;
let isMicActive = false;

// خوادم STUN مجانية من جوجل لربط اللاعبين وتجاوز الجدار الناري (Firewall)
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// أيقونات SVG مطابقة للصورة التي طلبتها
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

        // ضبط الشكل الافتراضي (مغلق)
        this.updateMicUI(false);

        micBtn.addEventListener('click', () => {
            this.toggleMic();
        });

        // الاستماع لإشارات WebRTC من السيرفر
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
                } catch (e) { console.error('خطأ في إضافة بيانات الاتصال:', e); }
            }
        });
    },

    updateMicUI(isActive) {
        const micBtn = document.getElementById('mic-toggle-btn');
        if (!micBtn) return;

        if (isActive) {
            micBtn.innerHTML = micOnIcon;
            micBtn.style.background = 'rgba(46, 204, 113, 0.8) !important'; // أخضر
            micBtn.style.borderColor = '#2ecc71';
            micBtn.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.5)';
            micBtn.title = "إيقاف المايك";
        } else {
            micBtn.innerHTML = micOffIcon;
            micBtn.style.background = 'rgba(45, 48, 55, 0.65) !important'; // داكن
            micBtn.style.borderColor = 'rgba(135, 206, 235, 0.4)';
            micBtn.style.boxShadow = '0 0 3px rgba(135, 206, 235, 0.3)';
            micBtn.title = "تشغيل المايك";
        }
    },

    async toggleMic() {
        if (!isMicActive) {
            try {
                // طلب صلاحية المايك من اللاعب
                localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                isMicActive = true;
                this.updateMicUI(true);
                this.startCall();
            } catch (err) {
                alert("تعذر الوصول إلى الميكروفون. يرجى السماح للمتصفح باستخدام المايك.");
                console.error("Mic error:", err);
            }
        } else {
            this.closeCall();
            isMicActive = false;
            this.updateMicUI(false);
        }
    },

    async startCall() {
        if (!gameState.onlineRoomID) return;
        
        peerConnection = new RTCPeerConnection(servers);

        // إضافة الصوت الخاص بك للاتصال
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // استقبال صوت الخصم
        peerConnection.ontrack = (event) => {
            this.playRemoteAudio(event.streams[0]);
        };

        // إرسال مسار الاتصال للخصم
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('voice-candidate', { roomID: gameState.onlineRoomID, candidate: event.candidate });
            }
        };

        // إنشاء عرض الاتصال (Offer)
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('voice-offer', { roomID: gameState.onlineRoomID, offer: offer });
    },

    async handleOffer(offer) {
        peerConnection = new RTCPeerConnection(servers);

        // إذا كان المايك لديك مفتوحاً، أرسل صوتك أيضاً
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

        // قبول العرض وإنشاء الرد (Answer)
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
    }
};

// تهيئة الملف ليكون جاهزاً فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    voiceChat.init();
});
