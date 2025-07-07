#!/bin/bash

# Comprehensive API endpoint testing script
# Author: Testing all authentication and API endpoints

BASE_URL="http://localhost:5000"
EMAIL="sagar.km@yulu.bike"
PASSWORD="admin123"
EMPLOYEE_EMAIL="ravi.kumar@yulu.bike"
EMPLOYEE_PASSWORD="EMP001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "COMPREHENSIVE API ENDPOINT TESTING"
echo "========================================="
echo ""

# Function to print results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ SUCCESS${NC}: $2"
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
    fi
}

# Test 1: Admin Login
echo -e "${YELLOW}Testing Admin Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "Response: $LOGIN_RESPONSE"

# Extract token using grep and sed
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    print_result 0 "Admin login successful, token obtained"
    echo "Token: ${TOKEN:0:50}..."
else
    print_result 1 "Admin login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

echo ""

# Test 2: Employee Login
echo -e "${YELLOW}Testing Employee Login...${NC}"
EMP_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMPLOYEE_EMAIL\",\"password\":\"$EMPLOYEE_PASSWORD\"}")
echo "Response: $EMP_LOGIN_RESPONSE"

EMP_TOKEN=$(echo "$EMP_LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$EMP_TOKEN" ]; then
    print_result 0 "Employee login successful, token obtained"
else
    print_result 1 "Employee login failed"
fi

echo ""

# Test 3: Mobile Verification
echo -e "${YELLOW}Testing Mobile Verification...${NC}"
MOBILE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/mobile-verify" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"chinnumalleshchinnu@gmail.com\",\"employeeId\":\"XPH1884\"}")
echo "Response: $MOBILE_RESPONSE"

MOBILE_TOKEN=$(echo "$MOBILE_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$MOBILE_TOKEN" ]; then
    print_result 0 "Mobile verification successful"
else
    print_result 1 "Mobile verification failed"
fi

echo ""

# Now test all protected endpoints with admin token
echo "========================================="
echo "TESTING PROTECTED ENDPOINTS WITH ADMIN TOKEN"
echo "========================================="
echo ""

# Test GET /api/employees
echo -e "${YELLOW}Testing GET /api/employees...${NC}"
EMP_LIST=$(curl -s -X GET "$BASE_URL/api/employees" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: ${EMP_LIST:0:100}..."

if [[ "$EMP_LIST" == *"error"* ]]; then
    print_result 1 "GET /api/employees failed"
    echo "Full response: $EMP_LIST"
else
    print_result 0 "GET /api/employees successful"
fi

echo ""

# Test GET /api/dashboard-users
echo -e "${YELLOW}Testing GET /api/dashboard-users...${NC}"
DASH_USERS=$(curl -s -X GET "$BASE_URL/api/dashboard-users" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: ${DASH_USERS:0:100}..."

if [[ "$DASH_USERS" == *"error"* ]]; then
    print_result 1 "GET /api/dashboard-users failed"
    echo "Full response: $DASH_USERS"
else
    print_result 0 "GET /api/dashboard-users successful"
fi

echo ""

# Test GET /api/issues
echo -e "${YELLOW}Testing GET /api/issues...${NC}"
ISSUES=$(curl -s -X GET "$BASE_URL/api/issues" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: ${ISSUES:0:100}..."

if [[ "$ISSUES" == *"error"* ]]; then
    print_result 1 "GET /api/issues failed"
    echo "Full response: $ISSUES"
else
    print_result 0 "GET /api/issues successful"
fi

echo ""

# Test GET /api/analytics/business-metrics
echo -e "${YELLOW}Testing GET /api/analytics/business-metrics...${NC}"
METRICS=$(curl -s -X GET "$BASE_URL/api/analytics/business-metrics" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: ${METRICS:0:100}..."

if [[ "$METRICS" == *"error"* ]]; then
    print_result 1 "GET /api/analytics/business-metrics failed"
    echo "Full response: $METRICS"
else
    print_result 0 "GET /api/analytics/business-metrics successful"
fi

echo ""

# Test Master Data endpoints
echo -e "${YELLOW}Testing GET /api/master-roles...${NC}"
ROLES=$(curl -s -X GET "$BASE_URL/api/master-roles" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: ${ROLES:0:100}..."

if [[ "$ROLES" == *"error"* ]]; then
    print_result 1 "GET /api/master-roles failed"
    echo "Full response: $ROLES"
else
    print_result 0 "GET /api/master-roles successful"
fi

echo ""

# Test RBAC endpoints
echo -e "${YELLOW}Testing GET /api/rbac/permissions...${NC}"
PERMS=$(curl -s -X GET "$BASE_URL/api/rbac/permissions" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: ${PERMS:0:100}..."

if [[ "$PERMS" == *"error"* ]]; then
    print_result 1 "GET /api/rbac/permissions failed"
    echo "Full response: $PERMS"
else
    print_result 0 "GET /api/rbac/permissions successful"
fi

echo ""

# Test with employee token
echo "========================================="
echo "TESTING WITH EMPLOYEE TOKEN"
echo "========================================="
echo ""

# Test employee profile
echo -e "${YELLOW}Testing GET /api/employee/profile...${NC}"
PROFILE=$(curl -s -X GET "$BASE_URL/api/employee/profile" \
  -H "Authorization: Bearer $EMP_TOKEN")
echo "Response: ${PROFILE:0:100}..."

if [[ "$PROFILE" == *"error"* ]]; then
    print_result 1 "GET /api/employee/profile failed"
    echo "Full response: $PROFILE"
else
    print_result 0 "GET /api/employee/profile successful"
fi

echo ""

# Test employee accessing admin endpoint (should fail)
echo -e "${YELLOW}Testing employee access to admin endpoint...${NC}"
ADMIN_ENDPOINT=$(curl -s -X GET "$BASE_URL/api/dashboard-users" \
  -H "Authorization: Bearer $EMP_TOKEN")
echo "Response: $ADMIN_ENDPOINT"

if [[ "$ADMIN_ENDPOINT" == *"Access denied"* ]] || [[ "$ADMIN_ENDPOINT" == *"error"* ]]; then
    print_result 0 "Employee correctly denied access to admin endpoint"
else
    print_result 1 "Security issue: Employee accessed admin endpoint"
fi

echo ""

# Check JWT token structure
echo "========================================="
echo "ANALYZING JWT TOKEN STRUCTURE"
echo "========================================="
echo ""

# Decode JWT header and payload (base64 decode)
if [ -n "$TOKEN" ]; then
    echo "Admin Token Structure:"
    IFS='.' read -ra TOKEN_PARTS <<< "$TOKEN"
    
    # Decode header
    HEADER=$(echo "${TOKEN_PARTS[0]}" | base64 -d 2>/dev/null || echo "Failed to decode")
    echo "Header: $HEADER"
    
    # Decode payload
    # Add padding if needed
    PAYLOAD_RAW="${TOKEN_PARTS[1]}"
    MOD=$((${#PAYLOAD_RAW} % 4))
    if [ $MOD -eq 2 ]; then
        PAYLOAD_RAW="${PAYLOAD_RAW}=="
    elif [ $MOD -eq 3 ]; then
        PAYLOAD_RAW="${PAYLOAD_RAW}="
    fi
    
    PAYLOAD=$(echo "$PAYLOAD_RAW" | base64 -d 2>/dev/null || echo "Failed to decode")
    echo "Payload: $PAYLOAD"
fi

echo ""
echo "========================================="
echo "TESTING AUTHENTICATION MIDDLEWARE"
echo "========================================="
echo ""

# Test without token
echo -e "${YELLOW}Testing endpoint without token...${NC}"
NO_AUTH=$(curl -s -X GET "$BASE_URL/api/issues")
echo "Response: $NO_AUTH"

if [[ "$NO_AUTH" == *"Access token required"* ]]; then
    print_result 0 "Correctly rejected request without token"
else
    print_result 1 "Security issue: Endpoint accessible without token"
fi

echo ""

# Test with invalid token
echo -e "${YELLOW}Testing endpoint with invalid token...${NC}"
INVALID=$(curl -s -X GET "$BASE_URL/api/issues" \
  -H "Authorization: Bearer invalid-token-12345")
echo "Response: $INVALID"

if [[ "$INVALID" == *"Invalid or expired token"* ]]; then
    print_result 0 "Correctly rejected invalid token"
else
    print_result 1 "Security issue: Invalid token not rejected"
fi

echo ""

# Test JWT Secret
echo "========================================="
echo "CHECKING JWT CONFIGURATION"
echo "========================================="
echo ""

echo "Checking .env file for JWT_SECRET..."
if [ -f ".env" ]; then
    JWT_LINE=$(grep "JWT_SECRET" .env)
    echo "Found: $JWT_LINE"
else
    echo "WARNING: .env file not found!"
fi

echo ""
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo ""
echo "Test completed. Check the results above for any authentication issues."