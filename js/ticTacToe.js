/**
 * @fileOverview tbc
 */


// *** USER ***

/**
 * Factory method for creating new players.
 * @param {string} name The name associated with the player.
 * @param {Team} team The team for whom the player is playing - this defines
 *     the markers that will be placed by the players.
 * @returns {Player} An object representing the player, with methods for
 *     getting and incrementing their score and getting their name and marker.
 */
const Player = (name, team) => {
	const _score = Score()
	const getName = () => name
	const getMarker = () => team.getMarker()
	const getScore = () => _score.getScore()
	const incrementScore = () => _score.increment()

	return {getName, getMarker, getScore, incrementScore}
}


/**
 * Factory method for creating a new score, initialised to zero.
 * @return {Score} An object representing a player score, with methods for
 *     reading the value and incrementing by one.
 */
const Score = () => {
	let _score = 0
	const getScore = () => _score
	const increment = () => ++_score

	return {getScore, increment}
}


// *** MODEL ***

/**
 * Factory method for creating a new marker.
 * TODO(mcbln): can we ensure the id is unique?
 * @param  {string} id String to uniquely identify the marker with.
 * @return {Marker} An object representing a player marker, with a method to
 *     get its ID.
 */
const Marker = (name, imagePath) => {
	const getName = () => name
	const getImagePath = () => imagePath

	return {getName, getImagePath}
}


/**
 * Factory method for creating a new team.
 * @param  {string} name The name of the team.
 * @param  {string} imagePath Path to where the image to associate with the 
 *     team's marker is stored.
 * @return {Team} An object representing the team, with methods to get its
 *     name and marker.
 */
const Team = (name, imagePath) => {
	const _marker = Marker(name, imagePath)
	const getName = () => name
	const getMarker = () => _marker
	const getImagePath = () => imagePath

	return {getName, getMarker, getImagePath}
}


/**
 * Available teams.
 * @enum {Team}
 */
const teams = {
	NEIL: Team("Neilts", "images/neil.jpg"),
	GUS: Team("Gusses", "images/gus.jpg"),
}


/**
 * Factory method for creating a new board cell.
 * @return {Cell} An object representing the cell, with methods to set its
 *     marker, get its marker and check if it is occupied.
 */
const Cell = () => {
	let _marker = null
	const setMarker = (marker) => _marker = marker
	const getMarker = () => _marker
	const isEmpty = () => _marker === null

	return {setMarker, getMarker, isEmpty}
}


/**
 * Singleton object representing the gameboard.
 * TODO(mcbln): what is the proper way to document modules?
 */
const gameboard = (() => {
	const _width = 3
	const _height = 3
	let _gameboard = Array.from({length: _width*_height}, () => Cell())

	// -- Helpers --
	const _coordinateToIndex = (i, j) => {
		// TODO(mcbln): how to make this a neater function?
		if (i >= _width || i < 0) {
			throw `i=${i} must be in range (0,${_width})`
		}
		if (j >= _height || j < 0) {
			throw `j=${j} must be in range (0,${_height})`
		}
		return i + j * _width
	}
	const _getCellAt = (i, j) => _gameboard[_coordinateToIndex(i, j)]
	// -- API --
	const setMarkerAt = (i, j, marker) => _getCellAt(i, j).setMarker(marker)
	const getMarkerAt = (i, j) => _getCellAt(i, j).getMarker()
	const isEmptyAt = (i, j) => _getCellAt(i, j).isEmpty()
	const clear = () => 
		_gameboard = Array.from({length: _width*_height}, () => Cell())

	return {setMarkerAt, getMarkerAt, clear, isEmptyAt}
})()


/**
 * Possible states for the game to be in:
 * - NEW: This is a new game, player names and teams are required.
 * - IN_PROGRESS: Markers can be played until a player wins or no more markers
 *     can be placed.
 * - STOPPED: A result has been reached, a new round must be started or the
 *     game reset before another piece can be placed.
 * @enum {Int}
 */
const gameState = {
	NEW: 0,
	IN_PROGRESS: 1,
	STOPPED: 2,
}


/**
 * Possible outcomes for each round.
 * @enum {Int}
 */
const gameResult = {
	IN_PROGRESS: 0,
	WIN_A: 1,
	WIN_B: 2,
	DRAW: 3,
}


/**
 * Singleton object represeting the game itself.
 * TODO(mcbln): what is the proper way to document modules>
 */
const game = (() => {
	let _state = gameState.NEW
	let _players = new Array(2)
	let _activePlayerIndex = 0  // For accessing the active player in the array

	const setState = (state) => _state = state
	const getState = () => _state

	const _setPlayer = (player, index) => _players[index] = player
	const setPlayerA = (player) => _setPlayer(player, 0)
	const setPlayerB = (player) => _setPlayer(player, 1)

	const toggleActivePlayer = () => _activePlayerIndex ^= 1  // Bitwise XOR
	const getActivePlayerIndex = () => _activePlayerIndex

	const setMarkerAt = (i, j) => {
		if (gameboard.isEmptyAt(i, j)) {
			const marker = _players[_activePlayerIndex].getMarker()
			gameboard.setMarkerAt(i, j, marker)
			return true
		} else {
			return false
		}
	}
	const checkForResult = () => {
		// TODO!
	}

	// TODO(mcbln): must be a nicer way to do this
	const reset = () => {
		_state = gameState.NEW
		_players = new Array(2)
		_activePlayerIndex = 0
		clear()
	}
	const clear = () => {
		gameboard.clear()
	}

	return {
		setState, getState, 
		setPlayerA, setPlayerB, 
		toggleActivePlayer, getActivePlayerIndex,
		setMarkerAt, 
		reset, clear,
	}
})()


// *** Controller ***
/**
 * Singleton object for controlling the game state.
 * TODO(mcbln): what is the proper way to document modules>
 */
const gameController = (() => {
	const _initialisePlayers = () => {
		game.setPlayerA(Player(prompt("Player name:", "Neilts"), teams.NEIL))
		game.setPlayerB(Player(prompt("Player name:", "Gusses"), teams.GUS))
	}

	const newRound = () => {
		if (game.getState() === gameState.NEW) _initialisePlayers()
		game.clear()
		game.setState(gameState.IN_PROGRESS)
	}
	const reset = () => {
		game.reset()
	}
	const setMarkerAt = (i, j) => {
		if (game.getState() === gameState.IN_PROGRESS) {
			// marker not set if marker already in that spot
			const markerSet = game.setMarkerAt(i, j)
			if (markerSet) game.toggleActivePlayer()
		}
	}

	return {newRound, reset, setMarkerAt}
})()


// TODO(mcbln): is there a wrapper for rendering after every click?
const btnNew = document.getElementById("new")
btnNew.addEventListener("click", () => {
	gameController.newRound()
	display.render()
})
const btnReset = document.getElementById("reset")
btnReset.addEventListener("click", () => {
	gameController.reset()
	display.render()
})

const cells = document.querySelectorAll(".cell")
cells.forEach((cell) => 
    cell.addEventListener("click", (event) => {
        const i = +event.target.getAttribute("data-i")
        const j = +event.target.getAttribute("data-j")
        gameController.setMarkerAt(i, j)
        display.render()
    })
)


// *** View ***
const display = (() => {
	// Scoreboard ToDo...
	// Duplication here - how to tidy?
	const _cells = document.querySelectorAll(".cell")


	const _render_scoreboard = () => {}
	const _render_cells = () => {
		_cells.forEach((cell) => {
			_clear_cell(cell)
			_render_cell(cell)
        })
	}
	const _clear_cell = (cell) => cell.innerHTML = "" 
	const _render_cell = (cell) => {
		const i = +cell.getAttribute("data-i")
        const j = +cell.getAttribute("data-j")
    	if (!gameboard.isEmptyAt(i, j)) {
    		const imagePath = gameboard.getMarkerAt(i, j).getImagePath()
    		cell.appendChild(_create_img_element(imagePath))
    	}
	}
	const _create_img_element = (imagePath) => {
		const image = document.createElement("img")
		image.classList.add("cell_img")
		image.src = imagePath

		return image
	}
	const render = () => {
		_render_scoreboard()
		_render_cells()
	}

	return {render, _create_img_element}
})()