#!/usr/bin/env bash
# agentc-v2/tests/test-helpers.sh
# Shared test harness and assertions for agentc-v2 E2E test suite

set -u

# Resolve repository paths
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTC_ROOT="$(cd "$TESTS_DIR/.." && pwd)"
REPO_ROOT="$AGENTC_ROOT"

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Formatting
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_RESET="\033[0m"
  C_GREEN="\033[0;32m"
  C_RED="\033[0;31m"
  C_YELLOW="\033[0;33m"
  C_BLUE="\033[0;34m"
  C_BOLD="\033[1m"
else
  C_RESET=""
  C_GREEN=""
  C_RED=""
  C_YELLOW=""
  C_BLUE=""
  C_BOLD=""
fi

# Track created temp directories for cleanup
CREATED_TEMP_DIRS=()
cleanup_all_temp_dirs() {
  local count="${#CREATED_TEMP_DIRS[@]}"
  if [ "$count" -gt 0 ]; then
    for dir in "${CREATED_TEMP_DIRS[@]}"; do
      if [ -n "$dir" ] && [ -d "$dir" ]; then
        rm -rf "$dir"
      fi
    done
  fi
}
trap cleanup_all_temp_dirs EXIT INT TERM

make_temp_dir() {
  local prefix="${1:-agentc_test}"
  local temp_dir
  temp_dir="$(mktemp -d "/tmp/${prefix}.XXXXXX")"
  CREATED_TEMP_DIRS+=("$temp_dir")
  echo "$temp_dir"
}

log_header() {
  local title="$1"
  echo -e "\n${C_BOLD}${C_BLUE}======================================================================${C_RESET}"
  echo -e "${C_BOLD}${C_BLUE}  $title${C_RESET}"
  echo -e "${C_BOLD}${C_BLUE}======================================================================${C_RESET}"
}

record_pass() {
  local test_id="$1"
  local desc="$2"
  TESTS_RUN=$((TESTS_RUN + 1))
  TESTS_PASSED=$((TESTS_PASSED + 1))
  printf "  ${C_GREEN}✓ PASS${C_RESET} [%s] %s\n" "$test_id" "$desc"
}

record_fail() {
  local test_id="$1"
  local desc="$2"
  local detail="${3:-}"
  TESTS_RUN=$((TESTS_RUN + 1))
  TESTS_FAILED=$((TESTS_FAILED + 1))
  printf "  ${C_RED}✗ FAIL${C_RESET} [%s] %s\n" "$test_id" "$desc"
  if [ -n "$detail" ]; then
    printf "         ${C_RED}Reason: %s${C_RESET}\n" "$detail"
  fi
}

record_skip() {
  local test_id="$1"
  local desc="$2"
  local reason="${3:-}"
  TESTS_RUN=$((TESTS_RUN + 1))
  TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
  printf "  ${C_YELLOW}○ SKIP${C_RESET} [%s] %s (%s)\n" "$test_id" "$desc" "$reason"
}

# Core assertion primitives
assert_file_exists() {
  local test_id="$1"
  local desc="$2"
  local file_path="$3"
  if [ -f "$file_path" ]; then
    record_pass "$test_id" "$desc"
    return 0
  else
    record_fail "$test_id" "$desc" "File not found: $file_path"
    return 1
  fi
}

assert_dir_exists() {
  local test_id="$1"
  local desc="$2"
  local dir_path="$3"
  if [ -d "$dir_path" ]; then
    record_pass "$test_id" "$desc"
    return 0
  else
    record_fail "$test_id" "$desc" "Directory not found: $dir_path"
    return 1
  fi
}

assert_file_not_empty() {
  local test_id="$1"
  local desc="$2"
  local file_path="$3"
  if [ -s "$file_path" ]; then
    record_pass "$test_id" "$desc"
    return 0
  else
    record_fail "$test_id" "$desc" "File is empty or missing: $file_path"
    return 1
  fi
}

assert_line_count_le() {
  local test_id="$1"
  local desc="$2"
  local max_lines="$3"
  local file_path="$4"
  if [ ! -f "$file_path" ]; then
    record_fail "$test_id" "$desc" "File not found: $file_path"
    return 1
  fi
  local lines
  lines=$(wc -l < "$file_path" | tr -d '[:space:]')
  if [ "$lines" -le "$max_lines" ]; then
    record_pass "$test_id" "$desc ($lines <= $max_lines lines)"
    return 0
  else
    record_fail "$test_id" "$desc" "Actual lines: $lines, exceeded limit: $max_lines"
    return 1
  fi
}

assert_byte_size_le() {
  local test_id="$1"
  local desc="$2"
  local max_bytes="$3"
  local file_path="$4"
  if [ ! -f "$file_path" ]; then
    record_fail "$test_id" "$desc" "File not found: $file_path"
    return 1
  fi
  local bytes
  bytes=$(wc -c < "$file_path" | tr -d '[:space:]')
  if [ "$bytes" -le "$max_bytes" ]; then
    record_pass "$test_id" "$desc ($bytes <= $max_bytes bytes)"
    return 0
  else
    record_fail "$test_id" "$desc" "Actual bytes: $bytes, exceeded limit: $max_bytes"
    return 1
  fi
}

assert_file_contains() {
  local test_id="$1"
  local desc="$2"
  local pattern="$3"
  local file_path="$4"
  if [ ! -f "$file_path" ]; then
    record_fail "$test_id" "$desc" "File not found: $file_path"
    return 1
  fi
  if grep -E -q "$pattern" "$file_path"; then
    record_pass "$test_id" "$desc"
    return 0
  else
    record_fail "$test_id" "$desc" "Pattern not found: $pattern in $file_path"
    return 1
  fi
}

assert_file_not_contains() {
  local test_id="$1"
  local desc="$2"
  local pattern="$3"
  local file_path="$4"
  if [ ! -f "$file_path" ]; then
    record_fail "$test_id" "$desc" "File not found: $file_path"
    return 1
  fi
  if grep -E -q "$pattern" "$file_path"; then
    record_fail "$test_id" "$desc" "Forbidden pattern found: $pattern in $file_path"
    return 1
  else
    record_pass "$test_id" "$desc"
    return 0
  fi
}

assert_executable() {
  local test_id="$1"
  local desc="$2"
  local file_path="$3"
  if [ -x "$file_path" ]; then
    record_pass "$test_id" "$desc"
    return 0
  else
    record_fail "$test_id" "$desc" "File is not executable: $file_path"
    return 1
  fi
}

assert_json_valid() {
  local test_id="$1"
  local desc="$2"
  local json_file="$3"
  if [ ! -f "$json_file" ]; then
    record_fail "$test_id" "$desc" "File not found: $json_file"
    return 1
  fi
  if node -e "JSON.parse(require('fs').readFileSync('$json_file', 'utf8'))" >/dev/null 2>&1; then
    record_pass "$test_id" "$desc"
    return 0
  else
    record_fail "$test_id" "$desc" "Invalid JSON syntax in: $json_file"
    return 1
  fi
}

assert_command_exit_code() {
  local test_id="$1"
  local desc="$2"
  local expected_code="$3"
  shift 3
  local cmd=("$@")

  local output
  local actual_code=0
  output="$("${cmd[@]}" 2>&1)" || actual_code=$?

  if [ "$actual_code" -eq "$expected_code" ]; then
    record_pass "$test_id" "$desc (exit code: $actual_code)"
    return 0
  else
    local truncated_output
    truncated_output="$(echo "$output" | head -n 3 | tr '\n' ' ')"
    record_fail "$test_id" "$desc" "Expected exit code $expected_code, got $actual_code. Output: $truncated_output"
    return 1
  fi
}

print_summary() {
  local tier_name="$1"
  echo ""
  echo -e "${C_BOLD}----------------------------------------------------------------------${C_RESET}"
  echo -e "${C_BOLD} Summary for $tier_name${C_RESET}"
  echo -e " Total:   $TESTS_RUN"
  echo -e " ${C_GREEN}Passed:  $TESTS_PASSED${C_RESET}"
  if [ "$TESTS_FAILED" -gt 0 ]; then
    echo -e " ${C_RED}Failed:  $TESTS_FAILED${C_RESET}"
  else
    echo -e " Failed:  0"
  fi
  if [ "$TESTS_SKIPPED" -gt 0 ]; then
    echo -e " ${C_YELLOW}Skipped: $TESTS_SKIPPED${C_RESET}"
  fi
  echo -e "${C_BOLD}----------------------------------------------------------------------${C_RESET}"

  if [ "$TESTS_FAILED" -eq 0 ]; then
    return 0
  else
    return 1
  fi
}
