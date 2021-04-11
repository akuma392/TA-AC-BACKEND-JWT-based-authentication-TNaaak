var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var articleSchema = new Schema(
  {
    title: { type: String, require: true },
    description: { type: String, require: true },
    body: { type: String, require: true },
    slug: String,
    tagList: [String],
    favoorited: { type: Boolean, default: false },
    favoritesCount: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
articleSchema.pre('save', function (next) {
  let random = Math.floor(Math.random() * 10);
  let str = this.title.split(' ').join('-').concat(random);
  this.slug = str;
  next();
});

var Article = mongoose.model('Article', articleSchema);

module.exports = Article;
