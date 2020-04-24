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
	const getWidth = () => _width
	const getHeight = () => _height
	const setMarkerAt = (i, j, marker) => _getCellAt(i, j).setMarker(marker)
	const getMarkerAt = (i, j) => _getCellAt(i, j).getMarker()
	const isEmptyAt = (i, j) => _getCellAt(i, j).isEmpty()
	const isFull = () => _gameboard.every(cell => !cell.isEmpty())
	const clear = () => 
		_gameboard = Array.from({length: _width*_height}, () => Cell())

	return {setMarkerAt, getMarkerAt, 
			getHeight, getWidth, 
			isEmptyAt, isFull,
			clear,
		}
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
	const initialisePlayers = () => {
		_setPlayer(Player(prompt("Player name:", "Neilts"), teams.NEIL), 0)
		_setPlayer(Player(prompt("Player name:", "Gusses"), teams.GUS), 1)
	}
	const toggleActivePlayer = () => _activePlayerIndex ^= 1  // Bitwise XOR
	const getActivePlayerIndex = () => _activePlayerIndex
	const getPlayerA = () => _players[0]
	const getPlayerB = () => _players[1]

	const isEmptyAt = (i, j) => {
		return gameboard.isEmptyAt(i, j)
	}
	const setMarkerAt = (i, j) => {
		const marker = _players[_activePlayerIndex].getMarker()
		gameboard.setMarkerAt(i, j, marker)
	}
	const updateScore = (result) => {
		switch(result) {
			case gameResult.WIN_A:
				_players[0].incrementScore()
				break;
			case gameResult.WIN_B:
				_players[1].incrementScore()
				break;
			case gameResult.DRAW:
				// Do nothing
				break;
		}
	}

	// TODO(mcbln): refactor this to say where the win was? Can then highlight.
	const checkForResultAt = (i, j) => {
		const placedMarker = _players[_activePlayerIndex].getMarker()
		const playerWin = [
			_checkRowForWin(i),
			_checkColForWin(j),
			_checkDiagonalForWin,
		].some(checker => checker(placedMarker))
		
		if (playerWin) {
			if (_activePlayerIndex === 0) {
				return gameResult.WIN_A
			} else {
				return gameResult.WIN_B
			}
		} else {
			if (gameboard.isFull()) {
				return gameResult.DRAW
			} else {
				return gameResult.IN_PROGRESS
			}
		}
	}

	const _checkLineForWin = (playerMarker, index, dimension) => {
		// TODO(mcbln): assumes equal height and width - fix
		// Get either rows (dimension = 0) or cols
		const getMarkerMap = (dimension == 0) 
			? oppDimIndex => gameboard.getMarkerAt(index, oppDimIndex)
			: oppDimIndex => gameboard.getMarkerAt(oppDimIndex, index)
		return [...Array(gameboard.getWidth()).keys()]  // eq to python range()
			.map(getMarkerMap)
			.every(marker => marker === playerMarker)
	}
	// Curried
	const _checkRowForWin = rowIndex => playerMarker => {
		return _checkLineForWin(playerMarker, rowIndex, 0)
	}
	// Curried
	const _checkColForWin = colIndex => playerMarker => {
		return _checkLineForWin(playerMarker, colIndex, 1)
	}
	// TODO(mcbln): this is all hardcoded
	const _checkDiagonalForWin = (playerMarker) => {
		const winOnDiagL2R = [
			gameboard.getMarkerAt(0,0),
			gameboard.getMarkerAt(1,1),
			gameboard.getMarkerAt(2,2),
		].every(marker => marker === playerMarker)
		const winOnDiagR2L = [
			gameboard.getMarkerAt(2,0),
			gameboard.getMarkerAt(1,1),
			gameboard.getMarkerAt(0,2),
		].every(marker => marker === playerMarker)
		return winOnDiagL2R || winOnDiagR2L
	}

	// TODO(mcbln): must be a nicer way to do this
	const reset = () => {
		_state = gameState.NEW
		_players = new Array(2)
		_activePlayerIndex = 0
		clearBoard()
	}
	const clearBoard = () => {
		gameboard.clear()
	}

	return {
		setState, getState, 
		initialisePlayers, getPlayerA, getPlayerB,
		toggleActivePlayer, getActivePlayerIndex,
		isEmptyAt, setMarkerAt, 
		updateScore, checkForResultAt,
		reset, clearBoard,
	}
})()


// *** Controller ***
/**
 * Singleton object for controlling the game state.
 * TODO(mcbln): what is the proper way to document modules?
 */
const gameController = (() => {
	// button: "new round"
	const newRoundInput = () => {
		if (game.getState() === gameState.NEW) {
			game.initialisePlayers()
		} else {
			game.clearBoard()
		}
		game.setState(gameState.IN_PROGRESS)
	}
	// button: "reset"
	const resetInput = () => {
		game.reset()
		game.setState(gameState.NEW)
	}
	// cell at location (i, j)
	const cellInput = (i, j) => {
		if (game.getState() === gameState.IN_PROGRESS) {
			if (game.isEmptyAt(i, j)) {
				game.setMarkerAt(i, j)
				
				const result = game.checkForResultAt(i, j)
				if (result != gameResult.IN_PROGRESS) {
					game.updateScore(result)
					game.setState(gameState.STOPPED)
				}

				game.toggleActivePlayer()
			}
		}
	}

	return {newRoundInput, resetInput, cellInput}
})()


// TODO(mcbln): is there a wrapper for rendering after every click?
const btnNew = document.getElementById("new")
btnNew.addEventListener("click", () => {
	gameController.newRoundInput()
	display.render()
})
const btnReset = document.getElementById("reset")
btnReset.addEventListener("click", () => {
	gameController.resetInput()
	display.render()
})
const cells = document.querySelectorAll(".cell")
cells.forEach((cell) => 
    cell.addEventListener("click", (event) => {
        const i = +event.target.getAttribute("data-i")
        const j = +event.target.getAttribute("data-j")
        gameController.cellInput(i, j)
        display.render()
    })
)


// *** View ***
const display = (() => {
	// Scoreboard ToDo...
	// Duplication here - how to tidy?
	const _cells = document.querySelectorAll(".cell")
	const _scoreboard = document.querySelector("#scoreboard")
	const _playerNameA = _scoreboard.querySelector("#player_neil")
	const _playerNameB = _scoreboard.querySelector("#player_gus")
	const _scoreA = _scoreboard.querySelector("#score_neil")
	const _scoreB = _scoreboard.querySelector("#score_gus")
	const _playerPictureA = _scoreboard.querySelector("#team_neil")
	const _playerPictureB = _scoreboard.querySelector("#team_gus")
	const _highlightClass = "img_wrap_highlight"


	const _renderScoreboard = () => {
		const playerA = game.getPlayerA() || Player("Player A", null)
		const playerB = game.getPlayerB() || Player("Player B", null)

		_playerNameA.innerHTML = playerA.getName()
		_playerNameB.innerHTML = playerB.getName()

		_scoreA.innerHTML = playerA.getScore()
		_scoreB.innerHTML = playerB.getScore()

		_highlightActivePlayer()
	}
	const _highlightActivePlayer = () => {
		const activePlayerIndex = game.getActivePlayerIndex()
		const isActivePlayerA = activePlayerIndex === 0
		_setPlayerHighlight(_playerPictureA, isActivePlayerA, _highlightClass)
		_setPlayerHighlight(_playerPictureB, !isActivePlayerA, _highlightClass)
	}
	const _setPlayerHighlight = (playerPicture, toHighlight, highlightClass) => {
		const playerClassList = playerPicture.classList
		if (game.getState() === gameState.IN_PROGRESS  && toHighlight) {
			// Highlight isn't applied -> add it
			if (!playerClassList.contains(highlightClass)) {
				playerClassList.add(highlightClass)
			}
		} else {
			// Highlight is applied -> remove it
			if (playerClassList.contains(highlightClass)) {
				playerClassList.remove(highlightClass)
			}
		}
	}
	const _renderCells = () => {
		_cells.forEach((cell) => {
			_clearCell(cell)
			_renderCell(cell)
        })
	}
	const _clearCell = (cell) => cell.innerHTML = "" 
	const _renderCell = (cell) => {
		const i = +cell.getAttribute("data-i")
        const j = +cell.getAttribute("data-j")
    	if (!gameboard.isEmptyAt(i, j)) {
    		const imagePath = gameboard.getMarkerAt(i, j).getImagePath()
    		cell.appendChild(_createImgElement(imagePath))
    	}
	}
	const _createImgElement = (imagePath) => {
		const image = document.createElement("img")
		image.classList.add("cell_img")
		image.src = imagePath

		return image
	}
	const render = () => {
		_renderScoreboard()
		_renderCells()
	}

	return {render}
})()