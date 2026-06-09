#!/bin/bash

# Ensure we are in the correct repository
REPO="Duhhellobigboy/katana-edge-craft"

# Check if authenticated
if ! gh auth status &>/dev/null; then
  echo "=========================================================="
  echo "Error: You are not logged into the GitHub CLI (gh)."
  echo "Please run the following command first to authenticate:"
  echo "  gh auth login"
  echo "=========================================================="
  exit 1
fi

echo "Creating GitHub issues for $REPO..."

# Issue 1
gh issue create --repo "$REPO" \
  --title "Issue 1: Confirm Project Structure" \
  --label "enhancement" \
  --body "Map the repo structure, confirm default ports (8080), local dev workflow, and existing checkout/sitemap routes. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 1."

# Issue 2
gh issue create --repo "$REPO" \
  --title "Issue 2: Configure Environment Variables" \
  --label "configuration" \
  --body "Set Stripe secrets, Price ID, site URLs, Supabase variables, and Sentry DSN in .env file. Confirm secrets are not bundled client-side. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 2."

# Issue 3
gh issue create --repo "$REPO" \
  --title "Issue 3: Align Supabase Database Schema & RLS" \
  --label "documentation" \
  --body "Ensure profiles, checkout_sessions, orders, and order_items tables are configured. Add public.applications table. Verify Row Level Security (RLS) policies. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 3."

# Issue 4
gh issue create --repo "$REPO" \
  --title "Issue 4: Configure Stripe Dashboard Setup" \
  --label "configuration" \
  --body "Generate api keys, add product and Price ID, configure webhook endpoint for testing. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 4."

# Issue 5
gh issue create --repo "$REPO" \
  --title "Issue 5: Create Homepage & Modal CTA -> /apply" \
  --label "enhancement" \
  --body "Implement 'Apply Now' button and dialog popup on the homepage to redirect users to /apply. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 5."

# Issue 6
gh issue create --repo "$REPO" \
  --title "Issue 6: Build /apply Application Form Page" \
  --label "enhancement" \
  --body "Create the application form page collecting email, name, phone, etc. using react-hook-form + zod. Add payment cancelled status banner. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 6."

# Issue 7
gh issue create --repo "$REPO" \
  --title "Issue 7: Implement Server Function for Session Creation" \
  --label "enhancement" \
  --body "Create createApplyCheckoutSession server function using Stripe SDK with metadata mapping. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 7."

# Issue 8
gh issue create --repo "$REPO" \
  --title "Issue 8: Build /success Order Confirmation Page" \
  --label "enhancement" \
  --body "Implement success page showing order detail overview. Fetch details from server function with webhook lag fallback. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 8."

# Issue 9
gh issue create --repo "$REPO" \
  --title "Issue 9: Migrate or Retire Legacy /checkout Route" \
  --label "refactor" \
  --body "Update or remove all links pointing to /checkout and /checkout/success. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 9."

# Issue 10
gh issue create --repo "$REPO" \
  --title "Issue 10: Setup Stripe Webhook signature verification and Order storage" \
  --label "enhancement" \
  --body "Update api/stripe-webhook endpoint to handle checkout.session.completed and store orders/items in Supabase. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 10."

# Issue 11
gh issue create --repo "$REPO" \
  --title "Issue 11: Setup n8n post-checkout automation" \
  --label "enhancement" \
  --body "Trigger n8n webhook on payment confirmation with order and shipping details. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 11."

# Issue 12
gh issue create --repo "$REPO" \
  --title "Issue 12: End-to-End Testing (Local & Docker)" \
  --label "testing" \
  --body "Verify apply, checkout redirect, test payment success, cancel return, webhook handling, and database updates. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 12."

# Issue 13
gh issue create --repo "$REPO" \
  --title "Issue 13: Security & Pre-Ship Review" \
  --label "security" \
  --body "Confirm no secrets are bundled client-side, zero database card storage, proper signature check, and RLS validation. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 13."

# Issue 14
gh issue create --repo "$REPO" \
  --title "Issue 14: Set up Sentry Error Monitoring" \
  --label "enhancement" \
  --body "Initialize @sentry/react in client app, add DSN env var, set up ErrorBoundary, configure source map upload, and verify preview errors. Reference: GITHUB_ISSUES_GUIDE.md -> Issue 14."

echo "All 14 issues have been successfully created in $REPO!"
