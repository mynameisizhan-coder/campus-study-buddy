# Campus Study Buddy Workshop

A 4-session, hands-on series for an AWS Student Builder Group. Each session is about 60 minutes.
By the end, every participant understands, and can rebuild, a serverless AI chatbot that answers
questions from their own course notes, with citations.

| Session | Title | Participants build |
|---|---|---|
| [1](session-1-cloud-foundations.md) | Cloud foundations and account safety | A safe AWS account, a budget alert and an S3 bucket of notes |
| [2](session-2-rag-on-bedrock.md) | Generative AI and RAG on Amazon Bedrock | A Knowledge Base that answers questions from their notes |
| [3](session-3-serverless-backend.md) | A serverless backend: Lambda and API Gateway | A public `POST /ask` API |
| [4](session-4-frontend-security-cleanup.md) | Front end, security and cleanup | A live website, hardening, and a cleanup plan |

## Audience and prerequisites
- Undergraduates with basic programming (any language). No AWS experience needed.
- A laptop with a modern browser. Python is helpful but not required; the code is provided.
- **Their own AWS account**, created at least a day before Session 1. Account verification can
  take a few hours.

## Before Session 1 (send to participants a week ahead)
1. Create an AWS account at https://aws.amazon.com/free. The Free plan includes sign-up credits.
2. Turn on MFA for the root user. Session 1 walks through it, but doing it early saves time.
3. Bring 3–5 of your own notes as **PDF or DOCX**: syllabi, lecture notes, past answers.
4. **Do not** join an AWS Organization or accept invites to one. On the new Free plan this ends
   credit-earning activities, and an organization's policies can block the services we use.

## Cost and safety for participants
- The whole series costs **under $1–2 per participant**, covered by Free plan sign-up credits.
- Every participant sets a **$5 budget alert in Session 1**, before creating anything else.
- Bedrock is billed per call (about $0.002 per question), so we add throttling and alarms in Session 4.
- Session 4 ends with the **cleanup checklist**. The Knowledge Base bills for storage while idle.

## Facilitator checklist
- [ ] Run the full build yourself in the last 2 weeks (consoles change; the Bedrock console
      changed in mid-2026)
- [ ] Have a working copy of the app to demo if a participant's account is blocked:
      https://main.d356wnu1diygyu.amplifyapp.com
- [ ] Share the repo: https://github.com/mynameisizhan-coder/campus-study-buddy
- [ ] Ask one co-facilitator to walk the room during hands-on time
- [ ] Remind everyone to set the console region to **us-east-1** at the start of every session

## Session format
Every session follows the same rhythm, so participants know what to expect:

| Minutes | Part |
|---|---|
| 0–10 | Concepts: one idea, one diagram |
| 10–25 | Live demo by the facilitator |
| 25–50 | Hands-on: participants build it in their own account |
| 50–55 | Quiz (5 questions) |
| 55–60 | Recap and what's next |

Each session file has a "plan B" box for the most common thing that goes wrong in that session.
