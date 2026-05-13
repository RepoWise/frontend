#!/usr/bin/env python3
"""
Test all suggested questions against RepoWise API for google/meridian repo.
Saves results to CSV file.
"""

import requests
import csv
import time
from datetime import datetime

API_BASE_URL = "http://localhost:8000"
TEST_REPO = "https://github.com/google/meridian"

# Failure patterns that indicate RepoWise couldn't answer
FAILURE_PATTERNS = [
    'no relevant project documents found',
    'error generating response',
    'could not connect to llm',
    'could not connect to ollama',
    'unable to process',
    'no data available',
    'could not find',
    "i don't have access",
    'i cannot access',
    'no commit data',
    'no issue data',
    'failed to retrieve',
    'no information available',
    'not found in the project',
    'does not contain',
    'no relevant information',
]

# Frontend questions (from ChatInterface.jsx)
FRONTEND_QUESTIONS = {
    "landing_page": [
        "How can I start contributing?",
        "What are the required steps before submitting a pull request?",
        "What skills or tools do I need to contribute?",
        "How do I report a bug?",
    ],
    "after_answer_governance": [
        "How can I start contributing?",
        "What is the license of this project?",
        "What are the required steps before submitting a pull request?",
        "How do I report a security vulnerability?",
    ],
    "after_answer_commits": [
        "Who are the three most active committers?",
        "What are the five latest commits?",
        "Which files have the highest total lines added across all commits?",
    ],
    "after_answer_issues": [
        "How many open vs closed issues are there?",
        "What are the three most recently updated issues?",
        "Which issue has the highest comment count?",
    ],
}

# Backend questions (from question_suggester.py)
BACKEND_QUESTIONS = {
    "governance_maintainer": [
        "What are the prerequisites for becoming a maintainer on this project?",
        "Who currently serves on the governance committee, and how can we reach them?",
        "What responsibilities do maintainers have?",
        "How are maintainers selected or elected?",
    ],
    "governance_decision_making": [
        "How are decisions made when maintainers disagree on a proposed change?",
        "What is the voting process for major changes?",
        "Who has veto power in this project?",
        "How long does the decision-making process typically take?",
    ],
    "governance_contribution_process": [
        "What steps should I follow before opening a large pull request?",
        "Are there coding standards or style guides I must follow?",
        "What is the review process once I open a pull request?",
        "How should I structure my commit messages?",
    ],
    "governance_security": [
        "How should security vulnerabilities be reported and handled?",
        "Who is responsible for security issues?",
        "What is the typical response time for security reports?",
        "Is there a bug bounty program?",
    ],
    "governance_legal": [
        "Does the project require a CLA or DCO for outside contributions?",
        "What license does this project use?",
        "Who owns the copyright for contributed code?",
        "Are there any patent considerations?",
    ],
    "governance_communication": [
        "What communication channels does the project recommend for daily coordination?",
        "How do I join the project's Slack or Discord?",
        "Are there regular community meetings?",
        "How can I reach the maintainers directly?",
    ],
    "governance_release": [
        "How are release managers or release schedules determined?",
        "What is the typical release cadence?",
        "How can I track the next release?",
        "What is the process for including a feature in a release?",
    ],
    "governance_onboarding": [
        "How do we onboard new contributors effectively within current governance rules?",
        "Are there 'good first issues' for new contributors?",
        "What documentation should I read before contributing?",
        "Is there a mentorship program available?",
    ],
    "commits_activity": [
        "How many commits have landed in the last month, and is activity trending up or down?",
        "What is the commit frequency compared to last quarter?",
        "Which days of the week see the most commit activity?",
        "Has there been a recent spike or drop in activity?",
    ],
    "commits_contributors": [
        "Who are the top five contributors by commit count this quarter?",
        "Are there contributors with a sudden drop in activity that we should check in on?",
        "How many new contributors joined in the last month?",
        "What is the contributor retention rate?",
    ],
    "commits_code_churn": [
        "Which files or modules have seen the most churn recently?",
        "Which areas of the codebase receive the most frequent commits?",
        "Are there files that are frequently modified together?",
        "Which modules have the most refactoring activity?",
    ],
    "commits_impact": [
        "Can we identify the authors responsible for the most lines added or removed?",
        "Who has contributed the most to documentation?",
        "Which contributors focus on bug fixes vs. new features?",
        "What is the average commit size?",
    ],
    "commits_pr_metrics": [
        "How long, on average, does it take for a pull request to be merged?",
        "What percentage of PRs are merged vs. closed?",
        "Which PRs have been open the longest?",
        "How many reviewers typically review each PR?",
    ],
    "issues_status": [
        "How many issues are currently open versus closed, and what's the ratio?",
        "What is the trend in open issues over time?",
        "How many issues were resolved in the last release cycle?",
        "What percentage of issues are bugs vs. feature requests?",
    ],
    "issues_engagement": [
        "Which issues have the highest comment counts or longest time open?",
        "Who are the most active issue reporters or triagers?",
        "What is the average time to first response on new issues?",
        "Which issues were updated most recently, and what is their status?",
    ],
    "issues_themes": [
        "Are there recurring bug themes or labels that keep resurfacing?",
        "Which issue labels are most common?",
        "Are there areas of the codebase with many bug reports?",
        "What are the most requested features?",
    ],
    "issues_at_risk": [
        "Are there high-priority bugs that lack assignees or recent updates?",
        "Which pull requests or issues are at risk of falling through the cracks?",
        "How many stale issues should we close?",
        "Which long-running issues need attention?",
    ],
    "issues_documentation": [
        "What documentation gaps have contributors flagged recently?",
        "Are there common questions in issues that should be documented?",
        "Which parts of the docs receive the most issue reports?",
        "Have documentation improvements reduced related issues?",
    ],
    "issues_health": [
        "Are our community health metrics (issues, commits, reviews) improving or declining?",
        "What is the issue close rate trend?",
        "How responsive is the project to new issues?",
        "Is the community growing or shrinking?",
    ],
}


def check_backend_health():
    """Check if backend is running."""
    try:
        response = requests.get(f"{API_BASE_URL}/api/health", timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Backend health check failed: {e}")
        return False


def add_repository(repo_url):
    """Add repository to RepoWise and get project_id."""
    print(f"Adding repository: {repo_url}")
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/projects/add",
            json={"github_url": repo_url},
            timeout=120
        )
        if response.status_code == 200:
            data = response.json()
            # Handle different response structures
            project_id = (
                data.get("project_id") or
                data.get("id") or
                (data.get("project", {}).get("id") if data.get("project") else None)
            )
            status = data.get("status", "success")
            print(f"Repository {status}. Project ID: {project_id}")
            return project_id
        else:
            print(f"Failed to add repository: {response.text}")
            return None
    except Exception as e:
        print(f"Error adding repository: {e}")
        return None


def ask_question(project_id, question):
    """Send a question to the API and get response."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/query",
            json={
                "project_id": project_id,
                "query": question,
                "max_results": 5,
                "temperature": 0,
            },
            timeout=120
        )

        if response.status_code == 200:
            data = response.json()
            answer = data.get("response", "")
            sources = data.get("sources", [])
            confidence = data.get("metadata", {}).get("answer_confidence", 0)
            return {
                "success": True,
                "answer": answer,
                "sources_count": len(sources),
                "confidence": confidence,
                "error": None
            }
        else:
            return {
                "success": False,
                "answer": "",
                "sources_count": 0,
                "confidence": 0,
                "error": f"HTTP {response.status_code}: {response.text[:200]}"
            }
    except Exception as e:
        return {
            "success": False,
            "answer": "",
            "sources_count": 0,
            "confidence": 0,
            "error": str(e)
        }


def check_for_failure(answer):
    """Check if the answer contains failure patterns."""
    answer_lower = answer.lower()
    for pattern in FAILURE_PATTERNS:
        if pattern.lower() in answer_lower:
            return True, pattern
    return False, None


def run_tests(project_id):
    """Run all question tests and return results."""
    results = []

    # Combine all questions
    all_questions = {}

    # Add frontend questions
    for category, questions in FRONTEND_QUESTIONS.items():
        for q in questions:
            key = f"frontend_{category}"
            if key not in all_questions:
                all_questions[key] = []
            if q not in all_questions[key]:
                all_questions[key].append(q)

    # Add backend questions
    for category, questions in BACKEND_QUESTIONS.items():
        key = f"backend_{category}"
        all_questions[key] = questions

    # Count total unique questions
    unique_questions = set()
    for questions in all_questions.values():
        unique_questions.update(questions)

    total_questions = len(unique_questions)
    print(f"\nTotal unique questions to test: {total_questions}")
    print("=" * 60)

    tested_questions = set()
    question_num = 0

    for category, questions in all_questions.items():
        print(f"\n--- Testing {category} ---")

        for question in questions:
            # Skip duplicates
            if question in tested_questions:
                continue
            tested_questions.add(question)

            question_num += 1
            print(f"\n[{question_num}/{total_questions}] {question[:60]}...")

            start_time = time.time()
            response = ask_question(project_id, question)
            elapsed_time = time.time() - start_time

            if response["success"]:
                is_failure, failure_pattern = check_for_failure(response["answer"])

                if is_failure:
                    status = "FAILED"
                    failure_reason = failure_pattern
                    print(f"  ❌ FAILED - Pattern: {failure_pattern}")
                else:
                    status = "PASSED"
                    failure_reason = None
                    print(f"  ✅ PASSED - Confidence: {response['confidence']:.2f}, Sources: {response['sources_count']}")
            else:
                status = "ERROR"
                failure_reason = response["error"]
                print(f"  ⚠️ ERROR - {response['error'][:50]}")

            results.append({
                "question_num": question_num,
                "category": category,
                "question": question,
                "status": status,
                "confidence": response["confidence"] if response["success"] else 0,
                "sources_count": response["sources_count"] if response["success"] else 0,
                "failure_reason": failure_reason,
                "response_time_sec": round(elapsed_time, 2),
                "answer_preview": response["answer"][:300] if response["answer"] else ""
            })

            # Small delay to avoid overwhelming the API
            time.sleep(0.5)

    return results


def save_results_to_csv(results, filename):
    """Save results to CSV file."""
    fieldnames = [
        "question_num", "category", "question", "status",
        "confidence", "sources_count", "failure_reason",
        "response_time_sec", "answer_preview"
    ]

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"\nResults saved to: {filename}")


def print_summary(results):
    """Print test summary."""
    passed = [r for r in results if r["status"] == "PASSED"]
    failed = [r for r in results if r["status"] == "FAILED"]
    errors = [r for r in results if r["status"] == "ERROR"]

    print("\n" + "=" * 60)
    print("                    TEST SUMMARY")
    print("=" * 60)
    print(f"\nRepository: google/meridian")
    print(f"Total Questions Tested: {len(results)}")
    print(f"✅ Passed: {len(passed)} ({len(passed)/len(results)*100:.1f}%)")
    print(f"❌ Failed: {len(failed)} ({len(failed)/len(results)*100:.1f}%)")
    print(f"⚠️ Errors: {len(errors)} ({len(errors)/len(results)*100:.1f}%)")

    if failed:
        print("\n--- FAILED QUESTIONS ---")
        for r in failed:
            print(f"  [{r['category']}] {r['question']}")
            print(f"    Reason: {r['failure_reason']}")

    if errors:
        print("\n--- ERROR QUESTIONS ---")
        for r in errors:
            print(f"  [{r['category']}] {r['question']}")
            print(f"    Error: {r['failure_reason']}")

    # Category breakdown
    print("\n--- RESULTS BY CATEGORY ---")
    categories = {}
    for r in results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = {"passed": 0, "failed": 0, "error": 0}
        if r["status"] == "PASSED":
            categories[cat]["passed"] += 1
        elif r["status"] == "FAILED":
            categories[cat]["failed"] += 1
        else:
            categories[cat]["error"] += 1

    for cat, counts in sorted(categories.items()):
        total = counts["passed"] + counts["failed"] + counts["error"]
        print(f"  {cat}: {counts['passed']}/{total} passed")

    print("\n" + "=" * 60)


def main():
    print("=" * 60)
    print("  RepoWise Suggested Questions Test")
    print("  Repository: google/meridian")
    print("=" * 60)

    # Check backend health
    print("\nChecking backend health...")
    if not check_backend_health():
        print("ERROR: Backend is not available. Please start the backend server.")
        return
    print("✅ Backend is healthy")

    # Add repository
    project_id = add_repository(TEST_REPO)
    if not project_id:
        print("ERROR: Failed to add repository")
        return

    # Wait for indexing
    print("\nWaiting for repository indexing...")
    time.sleep(5)

    # Run tests
    results = run_tests(project_id)

    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f"/Users/sankalpkashyap/Desktop/UCD/Research/DECALLab/OSPREY/RepoWise-workspace/frontend/tests/all_suggested_questions_result.csv"
    save_results_to_csv(results, csv_filename)

    # Print summary
    print_summary(results)


if __name__ == "__main__":
    main()
