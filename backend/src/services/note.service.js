const noteRepository = require('../repositories/note.repository');

class NoteService {
    async getNotesByDeal(dealId) {
        return await noteRepository.findByDeal(dealId);
    }

    async addNoteToDeal(data, authorId) {
        return await noteRepository.create({ ...data, authorId });
    }
}

module.exports = new NoteService();
