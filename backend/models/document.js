import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true, // The actual chunk of text
  },
  embedding: {
    type: [Number],
    required: true, // The vector numbers from VoyageAI
  },
  metadata: {
    type: Object,
    default: {}, // Extra info about the chunk (e.g., category, source, user)
  },
  chunkOrder: {
    type: Number,
    default: 0, // Helps keep chunks in order if part of a big document
  },
  summary: {
    type: String,
    default: null, // Optional — stores a short summary if summarization is used
  },
  rerankScore: {
    type: Number,
    default: null, // Optional — stores score from reranking (for better accuracy)
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically saves the time it was added
  },
});

// Create an index for fast vector search if MongoDB supports it
embeddingSchema.index({ embedding: "vectorSearch" });

const Embedding = mongoose.model("Embedding", embeddingSchema);

export default Embedding;
