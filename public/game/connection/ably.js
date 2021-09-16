function AblyHandler(playerz) {
	// TODO: Replace with authUrl
	this.playerz = playerz;
	this.connection = new Ably.Realtime.Promise({ authUrl: '/token' });
	this.stateChannel = this.connection.channels.get('states:' + gameID);
	this.shouldChangeColor = false;

	this.stateChannel.subscribe((msg) => {
			playerz[msg.data.id].alive = false;
			this.updateState(playerz[msg.data.id]);
			setTimeout(() => {playerz[msg.data.id].respawn(); }, 3000);
		}
	);

	for (let player in playerz) {
		this.joinState(player);
	}
}

AblyHandler.prototype.sendMessage = function(name, message) {
	this.stateChannel.publish(name, message);
}

AblyHandler.prototype.changeColors = function() {
	this.stateChannel.publish('update-colors', null);
}

let bb = 0;
AblyHandler.prototype.joinState = function (player) {
	bb++;
	console.log(bb);
	this.stateChannel.presence.enterClient(player.id, copyWithoutMap(player));
};

AblyHandler.prototype.updateState = function (player) {
	console.log(player.id);
    this.stateChannel.presence.updateClient(player.id, copyWithoutMap(player));
};

AblyHandler.prototype.getState = async function (playerId) {
	console.log(playerId);
    const me = await this.stateChannel.presence.get({ clientId: playerId });
    return me;
};

AblyHandler.prototype.playerPositions = async function () {
	const presenceSet = await this.stateChannel.presence.get();
	return presenceSet;
};

function copyWithoutMap (player) {
	var newPlayer = {
		'id' : player.id,
		'x' : player.x,
		'y' : player.y,
		'width' : player.width,
		'height' : player.height,
		'name' : player.name,
		'color' : player.color,
		'alive': player.alive,
		'score': player.score
	}
	return newPlayer;
}