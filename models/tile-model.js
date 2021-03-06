module.exports = function(mongoose, db, Schema, ObjectId) {

	var TileSchema = new Schema({
		x: Number,
		y: Number,
		tileState: Number,
		isMapEdge: Boolean,
		background: Number,
		background2: Number,
		background3: Number,
		foreground: Number,
		foreground2: Number,
		mapIndex: Number
	});


	//the third param specifies an exact collection to look for in the DB
	var TileModel = db.model('Tile', TileSchema, 'tiles');

	return TileModel;

};