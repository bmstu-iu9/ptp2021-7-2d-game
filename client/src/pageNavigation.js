export class PageNavigation {
    fromPageID;

    constructor(client) {
        this.client = client;
    }

    initPages() {
        document.getElementById('btn1').addEventListener('click', _ => PageNavigation.switchTo('mainPage', 'creatingPage')); 
        document.getElementById('btn2').addEventListener('click', _ => PageNavigation.switchTo('mainPage', 'joiningPage'));
        document.getElementById('btn3').addEventListener('click', _ => this.#createRoom());
        document.getElementById('btn4').addEventListener('click', _ => PageNavigation.switchTo('creatingPage', 'mainPage'));
        document.getElementById('btn5').addEventListener('click', _ => this.#joinRoom(document.getElementById('inRoomId').value));
        document.getElementById('btn6').addEventListener('click', _ => PageNavigation.switchTo('joiningPage', 'mainPage'));
	    document.getElementById('btn7').addEventListener('click', _ => this.#exitRoom());
   
        document.getElementById('game').addEventListener('contextmenu', e => e.preventDefault());
    }

    static switchTo(fromID, toID) { 
        document.getElementById(fromID).style.display = 'none';
        document.getElementById(toID).style.display = 'flex';
    }

    #createRoom() { 
        const playerNum = parseInt(document.getElementById('playerNum').value); 
        this.client.socket.emit('createRoom', playerNum);
    }

    #joinRoom(roomID) {
        this.client.socket.emit('joinRoom', roomID);
    }

	#exitRoom() {
        PageNavigation.switchTo('gamingPage', this.fromPageID);
        this.client.socket.emit('leaveRoom');		
	}
}
