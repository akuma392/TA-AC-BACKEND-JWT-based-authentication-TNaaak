var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var bookSchema = new Schema(
  {
    title: String,
    description: String,
    author: String,
    price: Number,
    page: Number,
    category: [String],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    tags: String,
  },
  { timestamps: true }
);

var Book = mongoose.model('Book', bookSchema);

module.exports = Book;
