const Note = require('../db/models/note');
const Tag = require('../db/models/tag');
const errorHandler = require('../db/error_handler');

module.exports.list = (req, res) => {
  const userId = req.query.userId;
  let query;
  if (userId) {
    query = Note.find({ user: userId });
  } else {
    query = Note.find();
  }
  query.populate('tags').sort('-updatedAt').exec((err, notes) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(notes);
  });
};

module.exports.read = (req, res) => {
  res.json(req.note);
};

module.exports.create = (req, res) => {
  const note = new Note(req.body);
  note.user = req.user;

  note.save((err, newNote) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    // Is this the best way?  Need to get the tag data into what gets returned
    Note.findById(newNote._id).populate('tags').exec((err, newNoteWithTags) => {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(newNoteWithTags);
    });
  });
};

module.exports.update = (req, res) => {
  const note = req.note;

  note.text = req.body.text;
  if (req.body.tags) {
    note.tags = req.body.tags;
  }

  note.save((err, updatedNote) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    // Is this the best way?  Need to get the tag data into what gets returned
    Note.findById(updatedNote._id).populate('tags').exec((err, updatedNoteWithTags) => {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(updatedNoteWithTags);
    });
  });
};

module.exports.delete = (req, res) => {
  const note = req.note;
  note.remove((err) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(note);
  });
};

module.exports.tagsByNote = (req, res) => {
  const note = req.note;
  Tag.find({ _id: { $in: note.tags } }).populate('tags').sort('-updatedAt').exec((err, tags) => {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(tags);
  });
};

// Middleware to retrieve the tag when an id is passed in the route
module.exports.noteById = function (req, res, next, id) {
  Note.findById(id).populate('tags').exec((err, note) => {
    if (err) {
      return next(err);
    } else if (!note) {
      return res.status(404).send({
        message: 'No note with that identifier has been found'
      });
    }
    req.note = note;
    next();
  });
};

