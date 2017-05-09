const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = (property) => {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * Note Schema
 */
const NoteSchema = new Schema({
  text: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please give the note some text']
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ]
}, { timestamps: true });
NoteSchema.index({ tags: 1 });

const ModelClass = mongoose.model('Note', NoteSchema);

module.exports = ModelClass;
