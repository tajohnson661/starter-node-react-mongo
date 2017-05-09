const Tag = require('../db/models/tag');
const Note = require('../db/models/note');
const errorHandler = require('../db/error_handler');

module.exports.list = (req, res) => {
  Tag.find().sort('name').exec((err, tags) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(tags);
  });
};

module.exports.read = (req, res) => {
  res.json(req.tag);
};

module.exports.create = (req, res) => {
  const tag = new Tag(req.body);

  tag.save((err, newTag) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(newTag);
  });
};

module.exports.update = (req, res) => {
  const tag = req.tag;

  tag.name = req.body.name;

  tag.save((err, updatedTag) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(updatedTag);
  });
};

module.exports.delete = (req, res) => {
  const tag = req.tag;
  tag.remove((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(tag);
  });
};

module.exports.notesByTag = (req, res) => {
  const tag = req.tag;
  Note.find({ tags: tag._id }).populate('tags').sort('-updatedAt').exec((err, notes) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(notes);
  });
};


// Middleware to retrieve the tag when an id is passed in the route
module.exports.tagById = function (req, res, next, id) {
  Tag.findById(id).exec((err, tag) => {
    if (err) {
      return next(err);
    } else if (!tag) {
      return res.status(404).send({
        message: 'No tag with that identifier has been found'
      });
    }
    req.tag = tag;
    next();
  });
};
