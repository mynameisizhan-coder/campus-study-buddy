# Session 4: Front end, security and cleanup

## Learning goals
By the end, participants can:
1. Deploy a static website on AWS Amplify Hosting.
2. Explain what CORS is and what it does *not* protect against.
3. Apply defense in depth: throttling, validation, alarms and log retention.
4. Delete every billable resource, in the right order, and verify it's gone.
5. Map what they built to AWS Cloud Practitioner exam topics.

## Concepts (10 min)
- **Static site:** HTML, CSS and JavaScript only. The browser does the work and calls our API with `fetch()`.
- **Amplify Hosting:** serves the files over HTTPS from a global CDN.
- **CORS:** a *browser* rule that says which websites may read our API's responses. Tools like curl
  ignore it, so it protects users, not your bill.
- **Defense in depth:** IAM limits *what* the code can do, throttling limits *how often*,
  validation rejects bad input, and alarms and budgets tell you when something's wrong.
- **In the cloud you pay for what exists.** Clean up when you're done.

## Live demo (15 min)
1. Open `frontend/app.js` and point out `API_URL`, `fetch()` and how `[1]` becomes a citation marker.
2. Zip `index.html`, `style.css` and `app.js`. Then **Amplify → Deploy without Git** → drag the zip
   in → open the URL.
3. Ask a question on the live site. Click a citation marker.
4. **Hardening, live:**
   - API Gateway → CORS → change `*` to the Amplify domain.
   - Throttling → 2 requests/s, burst 5.
   - CloudWatch log group → retention 2 weeks.
   - CloudWatch alarm: Lambda invocations over 200/hour → SNS email.
5. Show that curl with a fake `Origin` header still gets a response, but **without** the CORS
   permission header. Explain why throttling still matters.
6. Walk through `docs/cleanup-checklist.md`, highlighting the **Knowledge Base**, which bills while idle.

## Hands-on (25 min)
- [ ] Their own site is live on Amplify and answers a question
- [ ] CORS limited to their Amplify domain, and the site still works
- [ ] Throttling, log retention and the alarm are configured (SNS email **confirmed**)
- [ ] Decide: keep it (and upgrade the plan before the Free plan ends) **or** run the cleanup
      checklist now

> **Plan B:** if the site says "Couldn't reach the server" after the CORS change, the origin must
> match exactly: `https://`, no trailing slash. F12 → Console shows the CORS error.

## Quiz (5 min)
1. What does CORS protect?
   a) Your AWS bill from all abuse  b) Browser users, by controlling which sites can read API
   responses  c) Your S3 bucket  d) Your IAM password
2. Which resource keeps costing money while nobody uses the app?
   a) Lambda  b) API Gateway  c) The Knowledge Base's indexed storage  d) IAM roles
3. Why delete in the order website → API → function → data?
   a) Alphabetical order  b) Remove things that *use* other things first, so nothing breaks halfway
   c) AWS requires it for billing  d) It's faster
4. The SNS alarm triggered but no email arrived. What's the most likely cause?
   a) Lambda is down  b) The email subscription was never confirmed  c) CORS blocked it
   d) The budget is too low
5. Name two Cloud Practitioner exam topics this project covers.

**Answers:** 1 b · 2 c · 3 b · 4 b · 5 Any two of: shared responsibility, IAM and least privilege,
Regions, S3 storage, serverless compute (Lambda), pricing and budgets, monitoring (CloudWatch),
AI/ML services (Bedrock)

## Wrap-up for the series (5 min)
- Show the finished architecture diagram from the README, and let participants name every box.
- Next steps: Skill Builder **AWS Cloud Practitioner Essentials** → the **Cloud Practitioner** exam,
  then explore **AWS SAM** to rebuild everything with one command.
- Ask participants to push their version to GitHub and share the link in the group channel.
