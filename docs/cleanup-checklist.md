# Campus Study Buddy: Cleanup Checklist

Use this when you've finished with the project, or before **9 Nov 2026**, when the AWS Free plan
ends and the account closes unless you upgrade.

- Account: `748009208049`
- Region: **us-east-1 (N. Virginia)**. Check the region selector before every step.
- Order matters: delete things that *use* other things first (website → API → function → data).

> **Keep the app instead?** Upgrade to the Paid plan before 9 Nov 2026
> (Billing and Cost Management → Free Tier → Upgrade plan). Remaining credits stay
> valid until 12 months after sign-up. Leave the `study-buddy-monthly` budget in place.

---

## What costs money while it sits idle

| Resource | Idle cost | Why |
|---|---|---|
| Bedrock Knowledge Base `study-buddy-kb` | **Yes**: indexed-data storage | The most important one to delete |
| S3 bucket `study-buddy-docs-748009208049` | Yes, tiny (about 23 MB) | Storage |
| Amplify app `study-buddy` | Yes, tiny | Hosted files |
| CloudWatch log groups | Yes, tiny | Stored logs |
| Lambda, API Gateway, SNS, alarm, layer | No, or the free tier covers it | Billed per use |
| IAM roles and policies, budget | Never | Free |

---

## Step 1: Amplify website
Console: **Amplify** → `study-buddy` → **App settings** → **General settings** → **Delete app**.
- [ ] App `d356wnu1diygyu` deleted

## Step 2: API Gateway
Console: **API Gateway** → `study-buddy-api` → **Actions** / **Delete**.
- [ ] API `8lqn5fo1gb` deleted. After this, the website's `API_URL` stops working.

## Step 3: Alarm and notifications
Console: **CloudWatch** → **Alarms** → tick `study-buddy-high-usage` → **Actions** → **Delete**.
Then **SNS** → **Topics** → `study-buddy-alerts` → **Delete** (type `delete me`).
- [ ] Alarm deleted
- [ ] SNS topic deleted

## Step 4: Lambda function and layer
Console: **Lambda** → **Functions** → `study-buddy-ask` → **Actions** → **Delete**.
Then **Lambda** → **Layers** → `boto3-latest` → select version 1 → **Delete**.
- [ ] Function deleted
- [ ] Layer `boto3-latest` deleted

## Step 5: Bedrock Knowledge Base (the important one)
Console: **Amazon Bedrock** → **Knowledge Bases** → `study-buddy-kb` → **Delete**.
If it asks, delete the data source `notes-bucket` first.
- [ ] Knowledge Base `XJJ0RLA0FV` deleted

## Step 6: S3 bucket
Console: **S3** → `study-buddy-docs-748009208049` → **Empty** (type `permanently delete`),
then **Delete** (type the bucket name).
⚠️ Download anything you want to keep first. This permanently deletes your uploaded notes from AWS.
Your originals on your PC are unaffected.
- [ ] Bucket emptied
- [ ] Bucket deleted

## Step 7: CloudWatch log groups
Console: **CloudWatch** → **Log groups** → tick all of these → **Actions** → **Delete**:
- `/aws/lambda/study-buddy-ask`
- `/aws/vendedlogs/bedrock/knowledge-base/APPLICATION_LOGS/XJJ0RLA0FV`
- `/aws/vendedlogs/bedrock/knowledge-base/APPLICATION_LOGS/CKNDZTGYU8` (from an earlier attempt)
- [ ] Log groups deleted

## Step 8: IAM roles and policies (free, but removes clutter)
Console: **IAM** → **Roles** → delete each of these:
- `study-buddy-ask-role-trlwbdb0` (current Lambda role)
- `study-buddy-ask-role-0xa98fdm` (from an earlier attempt)
- `AmazonBedrockExecutionRoleForKnowledgeBase_9h64k` (current Knowledge Base role)
- `AmazonBedrockExecutionRoleForKnowledgeBase_aanfh`, `_bjvmz`, `_o0dmp`, `_o0dmpp` (earlier attempts)

Then **IAM** → **Policies** → filter **Customer managed** → delete the policies whose names start with:
- `AWSLambdaBasicExecutionRole-be8fd980…`
- `AmazonBedrockS3PolicyForKnowledgeBase_…`
- `AmazonBedrockFoundationModelPolicyForKnowledgeBase_…`
- `AmazonBedrockCloudWatchPolicyForKnowledgeBase_…`

- [ ] Roles deleted
- [ ] Customer-managed policies deleted

## Keep these
- **`izhan-admin`** IAM user (with MFA): your daily login
- **`study-buddy-monthly`** budget: free, and still useful for whatever you build next
- **Root MFA**

---

## Verify everything is gone (read-only CLI checks)

Run after `aws login`. Every command should print **nothing** or a "not found" error.

```bash
aws amplify list-apps --query "apps[?name=='study-buddy'].appId" --output text
aws apigatewayv2 get-apis --query "Items[?Name=='study-buddy-api'].ApiId" --output text
aws cloudwatch describe-alarms --alarm-name-prefix study-buddy --query "MetricAlarms[].AlarmName" --output text
aws sns list-topics --query "Topics[?contains(TopicArn,'study-buddy')].TopicArn" --output text
aws lambda get-function --function-name study-buddy-ask
aws lambda list-layers --query "Layers[?LayerName=='boto3-latest'].LayerName" --output text
aws bedrock-agent list-knowledge-bases --query "knowledgeBaseSummaries[].name" --output text
aws s3api head-bucket --bucket study-buddy-docs-748009208049
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/study-buddy --query "logGroups[].logGroupName" --output text
aws logs describe-log-groups --log-group-name-prefix /aws/vendedlogs/bedrock --query "logGroups[].logGroupName" --output text
aws iam list-roles --query "Roles[?contains(RoleName,'study-buddy') || contains(RoleName,'KnowledgeBase')].RoleName" --output text
```

> On Windows Git Bash, run `export MSYS_NO_PATHCONV=1` first, or paths starting with `/aws/` get rewritten.

## Final check, 1–2 days later
- [ ] **Billing and Cost Management → Bills**: no new line items growing for Bedrock, S3 or Amplify
- [ ] **Cost Explorer** (daily view): costs drop to $0.00
- [ ] No budget alert emails

---

## The other AWS accounts (separate from this project)
During setup we found two more accounts tied to your email:
- `290475840639`: management account of an AWS Organization
- `731732399313`: member account (Paid plan, $0 credits), reached through `AccountFullAccessRole`

Nothing for this project was created in them. If you don't use them, sign in to
`290475840639` as root and review **Billing** and **AWS Organizations**. Closing accounts
you don't use is the safest way to avoid surprise charges.
