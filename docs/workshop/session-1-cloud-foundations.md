# Session 1: Cloud foundations and account safety

## Learning goals
By the end, participants can:
1. Explain what a Region is and why the console's region selector matters.
2. Describe the shared responsibility model in one sentence.
3. Explain why the root user is locked away, and set up MFA and an IAM admin user.
4. Create a budget alert.
5. Create a private S3 bucket and upload files to it.

## Concepts (10 min)
- **The cloud** means renting computers, storage and services by usage instead of buying them.
- **Region:** a physical location, such as us-east-1 in N. Virginia. Most resources live in one
  region, so a bucket made in Mumbai won't appear when you're looking at N. Virginia.
- **Shared responsibility:** AWS secures the data centres and hardware. *You* secure your data,
  your logins and your settings.
- **Root user vs. IAM user:** root is the master key. Lock it with MFA and use an IAM user every day.
- **AWS bills by usage:** a budget alert is your smoke detector.

Diagram to draw on the board:
```
Root user (MFA, locked away)
   └── IAM user "you-admin" (MFA, daily use)
          └── creates resources in us-east-1
                 └── Budget alert watches the cost of all of it
```

## Live demo (15 min)
1. Show the region selector, then switch to **us-east-1**.
2. Billing and Cost Management → **Free Tier**: show the plan type, days remaining and credits.
3. Root → **Security credentials** → **Assign MFA device** (show the screens; don't scan live).
4. **Budgets** → Create budget → Customize → Cost budget, **$5**, monthly → alerts at 50% and
   80% actual, 100% forecasted. Point out the option to **exclude credits**, so the budget shows
   real usage.
5. **IAM** → Create user `yourname-admin` → console access → `AdministratorAccess` → copy the
   sign-in URL → sign in as that user. Note: **no access keys**.
6. **S3** → Create bucket `study-buddy-docs-<account-id>` → keep **Block all public access** ticked
   → upload two PDFs.
7. Copy an object's **Object URL**, open it in a private window, and show **AccessDenied**.
   "That's the bucket protecting you."

## Hands-on (25 min)
Participants repeat steps 1–6 in their own account. Checkpoints:
- [ ] Root shows MFA: assigned, with 0 access keys
- [ ] The budget `study-buddy-monthly` exists with 3 alerts
- [ ] Signed in as their IAM user (top-right shows `user @ account`)
- [ ] The bucket exists in **us-east-1** with their notes uploaded

> **Plan B:** if someone can't see Billing pages as an IAM user, sign in as root → Account →
> "IAM user and role access to Billing information" → Activate.
> If someone's account sits inside an AWS Organization (an "explicit deny in a service control
> policy" error), they should pair with a neighbour for the remaining sessions.

## Quiz (5 min)
1. You created a bucket but can't find it in the console. What's the most likely reason?
   a) It was deleted  b) It's in a different region  c) S3 is down  d) Your MFA expired
2. Under shared responsibility, who must keep an S3 bucket private?
   a) AWS  b) The customer  c) Both equally  d) Nobody; buckets are always public
3. Why shouldn't you use the root user every day?
   a) It's slower  b) It can't create resources  c) It has unlimited power, so a stolen
   login is catastrophic  d) AWS charges extra for it
4. What does an AWS Budget do?
   a) Stops all spending at the limit  b) Sends alerts when spend or forecast crosses a threshold
   c) Gives you free credits  d) Deletes resources over budget
5. True or false: an object in a bucket with Block Public Access turned on can be opened by
   anyone who knows its URL.

**Answers:** 1 b · 2 b · 3 c · 4 b (a budget alerts you; it doesn't stop resources by itself) · 5 False

## Recap (5 min)
"We now have a safe account, a cost smoke detector and our notes in private storage. Next time
we teach an AI to read them."
