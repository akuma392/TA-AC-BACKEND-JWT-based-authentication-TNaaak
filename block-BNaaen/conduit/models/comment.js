var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var commentSchema = new Schema(
  {
    title: { type: String, require: true },
    description: String,
    body: String,
    slug: String,
    favoorited: { type: Boolean, default: false },
    favoritesCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
