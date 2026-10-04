"""
Campus Study Buddy - backend Lambda function.

Takes a student's question, finds the most relevant chunks in the
Bedrock Knowledge Base (RETRIEVE), then asks Amazon Nova Lite to answer
using only those chunks (GENERATE). Returns the answer plus sources.

Settings come from environment variables (set in the Lambda console):
  KB_ID       - Knowledge Base ID, e.g. XJJ0RLA0FV
  MODEL_ID    - Bedrock model ID, e.g. amazon.nova-lite-v1:0
  MAX_CHUNKS  - how many chunks to give the model (optional, default 10)

No access keys anywhere: boto3 automatically uses the Lambda's IAM role.
"""

import json
import os
from urllib.parse import unquote

import boto3
from botocore.exceptions import ParamValidationError

KB_ID = os.environ["KB_ID"]
MODEL_ID = os.environ.get("MODEL_ID", "amazon.nova-lite-v1:0")
MAX_CHUNKS = int(os.environ.get("MAX_CHUNKS", "10"))
MAX_QUESTION_CHARS = 500  # matches maxlength on the web page's text box

# Clients are created once, outside the handler, so warm invocations reuse them.
kb_client = boto3.client("bedrock-agent-runtime")  # for retrieve()
llm_client = boto3.client("bedrock-runtime")  # for converse()

SYSTEM_PROMPT = (
    "You are Campus Study Buddy, a helpful tutor for university students. "
    "Answer the question using ONLY the numbered sources provided. "
    "Cite sources inline like [1] or [2]. "
    "Each source shows its file name: check it matches the subject asked about. "
    "If the sources do not directly answer the question, reply ONLY with: "
    "\"I couldn't find that in your notes.\" Never guess or add outside facts. "
    "Keep answers clear and concise, suitable for exam revision."
)


def retrieve_chunks(question):
    """Step 1 - RETRIEVE: search the Knowledge Base for relevant chunks."""
    try:
        # Ask for MAX_CHUNKS results (managed knowledge bases return 5 by default).
        response = kb_client.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={"text": question},
            retrievalConfiguration={
                "managedSearchConfiguration": {"numberOfResults": MAX_CHUNKS}
            },
        )
    except ParamValidationError:
        # Older boto3 versions don't know this setting: fall back to the default.
        response = kb_client.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={"text": question},
        )
    chunks = []
    for result in response["retrievalResults"][:MAX_CHUNKS]:
        metadata = result.get("metadata", {})
        page = metadata.get("_excerpt_page_number")
        # File name: use the title, else the last part of the S3 location.
        # (Lambda's built-in boto3 may not return newer fields like documentId.)
        s3_uri = result.get("location", {}).get("s3Location", {}).get("uri", "")
        file_name = metadata.get("_document_title") or unquote(s3_uri.split("/")[-1])
        chunks.append(
            {
                "text": result["content"]["text"],
                "file": file_name or "unknown",
                "page": int(page) if page is not None else None,
                "score": result.get("score"),
            }
        )
    return chunks


def generate_answer(question, chunks):
    """Step 2 - GENERATE: ask the model to answer from the chunks only."""
    # Number each chunk so the model can cite it as [1], [2], ...
    sources_text = "\n\n".join(
        f"[{i}] (from {c['file']}, page {c['page']})\n{c['text']}"
        for i, c in enumerate(chunks, start=1)
    )
    user_message = f"Sources:\n{sources_text}\n\nQuestion: {question}"

    response = llm_client.converse(
        modelId=MODEL_ID,
        system=[{"text": SYSTEM_PROMPT}],
        messages=[{"role": "user", "content": [{"text": user_message}]}],
        inferenceConfig={"maxTokens": 600, "temperature": 0.2},
    )
    return response["output"]["message"]["content"][0]["text"]


def make_response(status_code, body):
    """Format a reply that API Gateway (Phase 5) can send to the browser."""
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    # API Gateway sends the request body as a JSON string; a console test
    # event can pass {"question": "..."} directly. Support both.
    try:
        if "body" in event:
            payload = json.loads(event["body"] or "{}")
        else:
            payload = event
        question = payload.get("question", "")
    except (json.JSONDecodeError, AttributeError):
        return make_response(400, {"error": "Request body must be JSON."})

    # Input validation: never trust what the browser sends.
    if not isinstance(question, str) or not question.strip():
        return make_response(400, {"error": "Please include a 'question'."})
    question = question.strip()
    if len(question) > MAX_QUESTION_CHARS:
        return make_response(
            400, {"error": f"Questions must be {MAX_QUESTION_CHARS} characters or fewer."}
        )

    # Log the length only, not the text: questions may contain personal details.
    print(f"Question received ({len(question)} chars)")  # shows up in CloudWatch Logs

    try:
        chunks = retrieve_chunks(question)
        if not chunks:
            return make_response(
                200,
                {"answer": "I couldn't find that in your notes.", "sources": []},
            )
        answer = generate_answer(question, chunks)
    except Exception as error:  # log the details, return a safe message
        print(f"ERROR: {error!r}")
        return make_response(500, {"error": "Something went wrong. Check CloudWatch Logs."})

    sources = [
        {"id": i, "file": c["file"], "page": c["page"], "excerpt": c["text"][:300]}
        for i, c in enumerate(chunks, start=1)
    ]
    return make_response(200, {"answer": answer, "sources": sources})
