const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = (property) => {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * Tag Schema
 */
const TagSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please give the tag a name']
  }
}, { timestamps: true });

const ModelClass = mongoose.model('Tag', TagSchema);

module.exports = ModelClass;
