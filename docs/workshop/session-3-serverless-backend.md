# Session 3: A serverless backend with Lambda and API Gateway

## Learning goals
By the end, participants can:
1. Explain "serverless": code that runs on demand, with no servers to manage, billed per use.
2. Read a Lambda function and point out the retrieve and generate steps.
3. Explain why applications use **IAM roles**, never access keys.
4. Write a least-privilege IAM policy for one Knowledge Base and one model.
5. Expose a function as an HTTP API and test it with curl.

## Concepts (10 min)
- **AWS Lambda:** upload a function, and AWS runs it when called. You pay per millisecond.
- **IAM execution role:** the function's identity. AWS gives it temporary credentials automatically.
  *No access keys in code, ever.*
- **Least privilege:** grant only what's needed. Our function may search one Knowledge Base and
  call one model. Nothing else.
- **API Gateway:** the front door. It turns `POST /ask` into a Lambda call.
- **Debug retrieval before the prompt:** if the right chunk isn't retrieved, prompt changes won't help.

Diagram:
```
curl / browser ──POST /ask──▶ API Gateway ──▶ Lambda
                                               ├─ 1. retrieve()  → Knowledge Base → top 10 chunks
                                               └─ 2. converse()  → Nova Lite → answer
                                               ◀─ {answer, sources[file, page]}
```

## Live demo (15 min)
1. Open `backend/lambda_function.py` from the repo. Walk through `retrieve_chunks()`,
   `generate_answer()` and the `SYSTEM_PROMPT`. Ask: "What stops the model making things up?"
2. **Lambda → Create function** `study-buddy-ask` (Python 3.13) → paste the code → **Deploy**.
   Set timeout to 30 s and add the environment variables `KB_ID` and `MODEL_ID`.
3. Run a test event, and show **AccessDeniedException**. *That's IAM working.*
4. Add the inline policy from `backend/lambda-bedrock-policy.json`, test again, and it succeeds.
5. Add the **boto3 layer** and explain why: Lambda's built-in SDK can lag behind new AWS features.
6. **API Gateway → HTTP API** with route `POST /ask` → Lambda. Set CORS and test with curl:
   ```bash
   curl -X POST "https://<id>.execute-api.us-east-1.amazonaws.com/ask" \
     -H "Content-Type: application/json" -d '{"question":"What is MAR?"}'
   ```
7. Show **CloudWatch Logs** for the request.

## Hands-on (25 min)
Participants build the function and API with their own Knowledge Base ID. Checkpoints:
- [ ] Lambda test returns `statusCode: 200` with sources
- [ ] The empty question `{"question": ""}` returns 400
- [ ] curl against their API URL returns an answer
- [ ] They found their request in CloudWatch Logs

> **Plan B:** most failures are, in order: 3-second timeout (set it to 30), a missing or misspelled
> `KB_ID`, the inline policy attached to the wrong role, forgetting to click **Deploy**, or the
> URL missing `/ask`. Check them in that order.

## Quiz (5 min)
1. How does our Lambda get permission to call Bedrock?
   a) Access keys pasted in the code  b) An IAM execution role  c) The root password
   d) API Gateway gives it permission
2. What does "least privilege" mean for our function?
   a) It runs with the least memory  b) It can only do exactly what it needs (one Knowledge Base,
   one model)  c) Only the root user can call it  d) It runs as rarely as possible
3. The Lambda test fails with `Task timed out after 3.00 seconds`. What do you change?
   a) The IAM policy  b) The Lambda timeout  c) The model  d) The bucket
4. The bot says "I couldn't find that", but the answer *is* in the notes. What do you check first?
   a) Rewrite the prompt  b) Whether the right chunk was retrieved  c) Switch models
   d) Delete and recreate the bucket
5. Which HTTP method and path does our API accept?

**Answers:** 1 b · 2 b · 3 b · 4 b · 5 `POST /ask` (everything else returns 404)

## Recap (5 min)
"We have a real API: anything that can send HTTP, such as a website, a phone app or a Discord
bot, can now ask our notes questions. Next time we build the website and make it safe to share."
