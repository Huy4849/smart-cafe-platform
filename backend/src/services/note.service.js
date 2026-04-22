const noteRepository = require('../repositories/note.repository');

class NoteService {
    async getNotesByTask(taskId) {
        return await noteRepository.findByTask(taskId);
    }

    async addNoteToTask(data, authorId) {
        return await noteRepository.create({ ...data, authorId });
    }
}

module.exports = new NoteService();
