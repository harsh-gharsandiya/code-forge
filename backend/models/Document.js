const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: String, // email
      required: true
    },
    permission: {
      type: String,
      enum: ['viewer', 'editor'],
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

documentSchema.index({ owner: 1 });
documentSchema.index({ 'collaborators.user': 1 });

module.exports = mongoose.model('Document', documentSchema);
