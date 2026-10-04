# Session 2: Generative AI and RAG on Amazon Bedrock

## Learning goals
By the end, participants can:
1. Explain why a language model alone can't answer questions about *their* notes.
2. Describe the two halves of RAG: **retrieve** and **generate**.
3. Explain what an embedding is, without maths.
4. Create a Bedrock Knowledge Base from an S3 bucket and test it.
5. Read citations to check whether an answer is trustworthy.

## Concepts (10 min)
- **Foundation model:** a large AI model trained on public data. It knows nothing about your
  syllabus and may confidently make things up ("hallucinate").
- **RAG (retrieval-augmented generation)** is an open-book exam. First find the relevant pages
  (retrieve), then let the model answer using only those pages (generate).
- **Embedding:** a list of numbers that captures what a piece of text *means*. Texts with similar
  meaning get similar numbers, so "shortest path" lands near a chunk about A* search even when
  the words differ.
- **Chunking:** documents are split into small passages, so search returns paragraphs, not whole PDFs.
- **Knowledge Base:** the managed service that parses, chunks, embeds and stores your documents,
  then searches them.

Diagram:
```
Notes in S3 ──sync──▶ parse ▶ chunk ▶ embed (Titan V2) ▶ index
Question ──▶ embed ▶ find nearest chunks ▶ Nova Lite answers from them ▶ answer + citations
```

## Live demo (15 min)
1. **Bedrock → Playground → Chat:** pick **Nova Lite** and ask "What's on my CS301 syllabus?"
   It doesn't know, and may guess. *That's the problem RAG solves.*
2. **Bedrock → Knowledge Bases → Create.** The console offers a **managed** Knowledge Base by
   default. Point the data source at the Session 1 bucket and accept the defaults.
3. Click **Sync**. While it runs, explain chunking and embeddings with the diagram.
4. **Test Knowledge Base:** ask three questions about the notes. Click **Show source details**
   and read a chunk aloud.
5. Ask something that **isn't** in the notes. Show that a good RAG system says so instead of guessing.

## Hands-on (25 min)
Participants create a Knowledge Base on their own bucket. Checkpoints:
- [ ] Knowledge Base status: **Active**
- [ ] Sync finished (large files can take 10–30 minutes, so start the sync early)
- [ ] 3 questions answered with the correct file cited
- [ ] 1 question that the notes don't cover

Challenge for fast finishers: find a question where the answer is **wrong** or **"not found"**
even though the information is in the notes. Look at the retrieved chunks. Is the right text
there? (This sets up Session 3.)

> **Plan B:** syncing is slow, sometimes 30+ minutes when slides or scanned PDFs need AI parsing.
> Start the sync in the first 5 minutes of hands-on time, and use the facilitator's demo site
> while waiting.
> Upload errors for files named `~$...` are Office lock files and safe to ignore.

## Quiz (5 min)
1. Why do we need RAG if the model is already "smart"?
   a) Models can't read  b) The model wasn't trained on our private notes  c) RAG is cheaper
   than storage  d) Bedrock requires it
2. What is an embedding?
   a) A compressed PDF  b) A list of numbers representing meaning  c) An encryption key
   d) A database table
3. In RAG, what happens in the **retrieve** step?
   a) The model writes the answer  b) The most relevant chunks are found  c) Files are
   uploaded  d) The user logs in
4. A good RAG bot is asked something that isn't in the notes. What should it do?
   a) Answer from general knowledge  b) Say it couldn't find it in the notes  c) Return an error
   d) Pick the closest chunk and paraphrase it
5. Why are documents split into chunks?
   a) To save money on S3  b) So search can return specific relevant passages  c) Because PDFs
   are too big for S3  d) To encrypt them

**Answers:** 1 b · 2 b · 3 b · 4 b · 5 b

## Recap (5 min)
"Our notes are searchable by meaning, and an AI can answer from them with citations. But only
inside the AWS console. Next time we give it an API so any app can use it."
