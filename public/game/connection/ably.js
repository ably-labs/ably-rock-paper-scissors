function AblyHandler(player) {
	// TODO: Replace with authUrl
	this.connection = new Ably.Realtime.Promise({authUrl: '/token', clientId: player.id,   
	  plugins: {
	  	vcdiff: vcdiffDecoder
	  }});
	this.stateChannel = this.connection.channels.get('states:' + gameID, { params: { delta: 'vcdiff' } });
	this.shouldChangeColor = false;

	this.stateChannel.subscribe('update-colors', (msg) => {
			this.shouldChangeColor = true;
		}
	);

	this.stateChannel.subscribe(player.id, (msg) => {
			player.alive = false;
			this.updateState(player);
			setTimeout(() => {player.respawn(); }, 3000);
		}
	);

	this.joinState(copyWithoutMap(player));
}

AblyHandler.prototype.sendMessage = function(name, message) {
	// this.stateChannel.publish(name, message);
}

AblyHandler.prototype.changeColors = function() {
	// this.stateChannel.publish('update-colors', null);
}

AblyHandler.prototype.joinState = function (player) {
	// this.stateChannel.presence.enter(copyWithoutMap(player));
};

AblyHandler.prototype.updateState = function (player) {
    // this.stateChannel.presence.update(copyWithoutMap(player));
};

AblyHandler.prototype.getState = async function (playerName) {
    const me = await this.stateChannel.presence.get({ clientId: playerName});
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
