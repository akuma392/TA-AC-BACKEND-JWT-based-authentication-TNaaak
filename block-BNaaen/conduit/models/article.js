var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var articleSchema = new Schema(
  {
    title: { type: String, require: true },
    description: { type: String, require: true },
    body: { type: String, require: true },
    slug: String,
    tagList: [String],

    favoritesCount: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    favouritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
articleSchema.pre('save', function (next) {
  let random = Math.floor(Math.random() * 10);
  let str = this.title.split(' ').join('-').concat(random);
  if (this.title && this.isModified('title')) {
    this.slug = str;
  }
  next();
});

articleSchema.methods.toJSONFor = function (user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favourite: this.favouritedBy.includes(user._id),
    favoritesCount: this.favoritesCount,
    author: this.author.userJSON1(user),
  };
};
var Article = mongoose.model('Article', articleSchema);

module.exports = Article;
