const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    createdAt: { type: Date, default: Date.now },
    color: { type: String, default: '#ce2d4fff' },
});

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;
