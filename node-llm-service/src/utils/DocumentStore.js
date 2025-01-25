const crypto = require('crypto');

class DocumentStore {
  constructor(options = {}) {
    this.documents = new Map();
    this.maxDocuments = options.maxDocuments || 100;
    this.storageType = options.storageType || 'local';
    this.indexedContent = new Map(); // For search functionality
  }

  // Add a document to the store
  async addDocument(id, content, metadata = {}) {
    if (this.documents.size >= this.maxDocuments) {
      throw new Error('Maximum document limit reached');
    }
    
    this.documents.set(id, {
      content,
      metadata,
      timestamp: Date.now()
    });
    
    return id;
  }

  // Get a document by ID
  getDocument(id) {
    const doc = this.documents.get(id);
    if (!doc) {
      throw new Error(`Document with ID ${id} not found`);
    }
    return doc;
  }

  // Search documents based on content
  searchDocuments(query) {
    const results = [];
    const searchTerms = query.toLowerCase().split(' ');
    
    for (const [id, doc] of this.documents.entries()) {
      const content = doc.content.toLowerCase();
      const relevanceScore = this._calculateRelevance(content, searchTerms);
      
      if (relevanceScore > 0) {
        results.push({
          id,
          document: doc,
          relevanceScore
        });
      }
    }
    
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // List all documents
  listDocuments() {
    return Array.from(this.documents.entries()).map(([id, doc]) => ({
      id,
      ...doc
    }));
  }

  // Delete a document
  deleteDocument(id) {
    if (!this.documents.has(id)) {
      throw new Error(`Document with ID ${id} not found`);
    }
    this.documents.delete(id);
  }

  // Clear all documents
  clearDocuments() {
    this.documents.clear();
  }

  // Calculate relevance score for search
  _calculateRelevance(content, searchTerms) {
    let score = 0;
    for (const term of searchTerms) {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    return score;
  }

  // Get store statistics
  getStats() {
    return {
      totalDocuments: this.documents.size,
      maxDocuments: this.maxDocuments,
      storageType: this.storageType
    };
  }

  async add(document) {
    if (this.documents.size >= this.maxDocuments) {
      const oldestKey = this.documents.keys().next().value;
      this.documents.delete(oldestKey);
      this.indexedContent.delete(oldestKey);
    }

    const docId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Store the document
    const storedDoc = {
      ...document,
      id: docId,
      timestamp,
      metadata: {
        ...document.metadata,
        added: timestamp,
        storageType: this.storageType
      }
    };

    this.documents.set(docId, storedDoc);
    
    // Index the content for search
    if (document.content) {
      this.indexedContent.set(docId, {
        content: document.content.toLowerCase(),
        type: document.type || 'text'
      });
    }

    return docId;
  }

  async search(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    for (const [docId, indexedDoc] of this.indexedContent) {
      if (indexedDoc.content.includes(searchTerm)) {
        const doc = this.documents.get(docId);
        if (doc) {
          results.push({
            id: docId,
            document: doc,
            relevance: this.calculateRelevance(searchTerm, indexedDoc.content)
          });
        }
      }
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  calculateRelevance(query, content) {
    // Simple relevance scoring based on term frequency
    const queryTerms = query.split(' ');
    let score = 0;

    queryTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return score;
  }

  async list() {
    return Array.from(this.documents.values());
  }

  async delete(docId) {
    this.indexedContent.delete(docId);
    return this.documents.delete(docId);
  }

  async clear() {
    this.documents.clear();
    this.indexedContent.clear();
  }

  async stats() {
    return {
      totalDocuments: this.documents.size,
      storageType: this.storageType,
      maxDocuments: this.maxDocuments,
      oldestDocument: this.getOldestDocument(),
      newestDocument: this.getNewestDocument()
    };
  }

  getOldestDocument() {
    let oldest = null;
    for (const doc of this.documents.values()) {
      if (!oldest || doc.timestamp < oldest.timestamp) {
        oldest = doc;
      }
    }
    return oldest;
  }

  getNewestDocument() {
    let newest = null;
    for (const doc of this.documents.values()) {
      if (!newest || doc.timestamp > newest.timestamp) {
        newest = doc;
      }
    }
    return newest;
  }
}

module.exports = { DocumentStore }; 