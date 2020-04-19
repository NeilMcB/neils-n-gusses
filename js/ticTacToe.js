/**
 * @fileOverview tbc
 */


/**
 * Factory method for creating new players.
 * @param {string} name The name associated with the player.
 * @param {Team} team The team for whom the player is playing - this defines
 *     the markers that will be placed by the players.
 * @returns {Player} An object representing the player, with methods for
 *     getting and incrementing their score and getting their name, team name
 *     and marker.
 */
const Player = (name, team) => {
	const _score = Score()
	const getName = () => name
	const getTeamName = () => team.getName()
	const getMarker = () => team.getMarker()
	const getScore = () => _score.getScore()
	const incrementScore = () => _score.increment()

	return {getName, getTeamName, getMarker, getScore, incrementScore}
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

	return {getValue, increment}
}


/**
 * Factory method for creating a new marker.
 * TODO(mcbln): can we ensure the id is unique?
 * @param  {string} id String to uniquely identify the marker with.
 * @param  {string} imagePath Path to where it marker image is stored.
 * @return {Marker} An object representing a player marker, with methods for
 *     getting its ID and a source for the image it prints.
 */
const Marker = (id, imagePath) => {
	const getId = () => id
	const getImagePath = () => imagePath

	return {getId, getImagePath}
}


const Team = (name, imagePath) => {
	const _marker = Marker(name, imagePath)
	const getName = () => name
	const getMarker = () => _marker

	return {getName, getMarker}
}


// TODO(mcbln): should this be made via a factory?
const teams = {
	NEIL: Team("Neilts", "images/neil.jpg"),
	GUS: Team("Gusses", "images/gus.jpg"),
}