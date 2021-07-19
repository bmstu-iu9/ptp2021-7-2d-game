let Client;

export function switchTo(fromID, toID) {
    document.getElementById(fromID).style.display = 'none';
    document.getElementById(toID).style.display = 'flex';
}

function createRoom(fromID, toID) {
    let playerNum = document.getElementById('playerNum').value;
    Client.Room.size = playerNum;
    if (playerNum) {
        switchTo(fromID, toID);
        Client.socket.emit('createRoom', playerNum);
    }
}

function joinRoom(roomID) {
    Client.socket.emit('joinRoom', roomID.value);
}

export function initPages(Clnt) {
    Client = Clnt;
    document.getElementById('btn1').addEventListener('click', _ => switchTo('mainPage', 'creatingPage'));
    document.getElementById('btn2').addEventListener('click', _ => switchTo('mainPage', 'joiningPage'));
    document.getElementById('btn3').addEventListener('click', _ => createRoom('creatingPage', 'gamingPage'));
    document.getElementById('btn4').addEventListener('click', _ => switchTo('creatingPage', 'mainPage'));
    document.getElementById('btn5').addEventListener('click', _ => joinRoom(document.getElementById('inRoomId')));
    document.getElementById('btn6').addEventListener('click', _ => switchTo('joiningPage', 'mainPage'));

    document.getElementById('game').addEventListener('contextmenu', e => e.preventDefault());
}