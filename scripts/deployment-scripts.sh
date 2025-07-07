#!/bin/bash
# Yulu Employee Issue Management System - Deployment Scripts
# This file contains all necessary scripts for local deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Database setup scripts
setup_mysql() {
    print_header "Setting up MySQL Database"
    
    # Check if MySQL is installed
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL is not installed. Please install MySQL first."
        exit 1
    fi
    
    # Check if MySQL service is running
    if ! pgrep mysql &> /dev/null; then
        print_warning "MySQL service is not running. Starting MySQL..."
        sudo systemctl start mysql || brew services start mysql || net start mysql
    fi
    
    print_status "Creating database and user..."
    mysql -u root -p -e "
        CREATE DATABASE IF NOT EXISTS FS_Grievance_management;
        CREATE USER IF NOT EXISTS 'yulu_user'@'localhost' IDENTIFIED BY 'Yulu@123';
        GRANT ALL PRIVILEGES ON FS_Grievance_management.* TO 'yulu_user'@'localhost';
        FLUSH PRIVILEGES;
    "
    
    print_status "MySQL database setup completed!"
}

# Environment setup
setup_environment() {
    print_header "Setting up Environment"
    
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# Database Configuration
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Yulu@123
DB_NAME=FS_Grievance_management
DB_PORT=3306

# JWT Configuration
JWT_SECRET=FS_Grievance_Management_JWT_Secret_Key_2025_Yulu_Secure_Auth_Token
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL fallback (for production)
DATABASE_URL=postgresql://username:password@host:port/database
EOF
        print_status ".env file created successfully!"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Database schema migration
migrate_schema() {
    print_header "Migrating Database Schema"
    
    print_status "Pushing schema to MySQL database..."
    drizzle-kit push --config=drizzle.mysql.config.ts
    
    print_status "Schema migration completed!"
}

# Database seeding
seed_database() {
    print_header "Seeding Database"
    
    print_status "Seeding with comprehensive data..."
    tsx backend/seedComprehensiveData.ts
    
    print_status "Database seeding completed!"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing Node.js dependencies..."
    npm install
    
    print_status "Dependencies installed successfully!"
}

# Build application
build_application() {
    print_header "Building Application"
    
    print_status "Building frontend and backend..."
    npm run build
    
    print_status "Application built successfully!"
}

# Test authentication
test_authentication() {
    print_header "Testing Authentication System"
    
    print_status "Testing dashboard user login..."
    response=$(curl -s -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"sagar.km@yulu.bike","password":"admin123"}')
    
    if echo "$response" | grep -q "token"; then
        print_status "✓ Dashboard authentication working"
    else
        print_error "✗ Dashboard authentication failed"
        echo "$response"
    fi
    
    print_status "Testing mobile employee verification..."
    response=$(curl -s -X POST http://localhost:5000/api/auth/mobile-verify \
      -H "Content-Type: application/json" \
      -d '{"email":"chinnumalleshchinnu@gmail.com","employeeId":"XPH1884"}')
    
    if echo "$response" | grep -q "token"; then
        print_status "✓ Mobile authentication working"
    else
        print_error "✗ Mobile authentication failed"
        echo "$response"
    fi
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check if server is running
    if curl -s http://localhost:5000 > /dev/null; then
        print_status "✓ Server is running on port 5000"
    else
        print_error "✗ Server is not responding"
        return 1
    fi
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    # Get auth token first
    token=$(curl -s -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"sagar.km@yulu.bike","password":"admin123"}' | \
      grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$token" ]; then
        # Test protected endpoint
        issues_response=$(curl -s -X GET http://localhost:5000/api/issues \
          -H "Authorization: Bearer $token")
        
        if echo "$issues_response" | grep -q '\['; then
            print_status "✓ Issues API working"
        else
            print_error "✗ Issues API failed"
        fi
        
        # Test users endpoint
        users_response=$(curl -s -X GET http://localhost:5000/api/dashboard-users \
          -H "Authorization: Bearer $token")
        
        if echo "$users_response" | grep -q '\['; then
            print_status "✓ Users API working"
        else
            print_error "✗ Users API failed"
        fi
    else
        print_error "✗ Could not obtain authentication token"
    fi
    
    print_status "Deployment verification completed!"
}

# Complete setup function
complete_setup() {
    print_header "Complete Local Deployment Setup"
    
    print_status "Starting complete setup process..."
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Setup MySQL
    setup_mysql
    
    # Migrate schema
    migrate_schema
    
    # Seed database
    seed_database
    
    print_header "Setup Complete!"
    print_status "To start the application, run:"
    echo "npm run dev"
    print_status "Access the application at:"
    echo "Frontend: http://localhost:5173"
    echo "Backend: http://localhost:5000"
    print_status "Test credentials:"
    echo "Dashboard: sagar.km@yulu.bike / admin123"
    echo "Mobile: chinnumalleshchinnu@gmail.com / XPH1884"
}

# Database management functions
db_push() {
    print_status "Pushing schema to database..."
    drizzle-kit push --config=drizzle.mysql.config.ts
}

db_generate() {
    print_status "Generating migrations..."
    drizzle-kit generate --config=drizzle.mysql.config.ts
}

db_studio() {
    print_status "Opening database studio..."
    drizzle-kit studio --config=drizzle.mysql.config.ts
}

db_check() {
    print_status "Checking database connection..."
    node migrate-dual.js check
}

db_backup() {
    print_status "Creating database backup..."
    node migrate-dual.js backup
}

db_restore() {
    print_status "Restoring database from backup..."
    node migrate-dual.js restore
}

# Development helpers
dev_start() {
    print_status "Starting development server..."
    NODE_ENV=development tsx server/index.ts
}

prod_build() {
    print_status "Building for production..."
    vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

prod_start() {
    print_status "Starting production server..."
    NODE_ENV=production node dist/index.js
}

# Main script logic
case "$1" in
    "setup")
        complete_setup
        ;;
    "mysql")
        setup_mysql
        ;;
    "env")
        setup_environment
        ;;
    "install")
        install_dependencies
        ;;
    "migrate")
        migrate_schema
        ;;
    "seed")
        seed_database
        ;;
    "build")
        build_application
        ;;
    "test-auth")
        test_authentication
        ;;
    "verify")
        verify_deployment
        ;;
    "db:push")
        db_push
        ;;
    "db:generate")
        db_generate
        ;;
    "db:studio")
        db_studio
        ;;
    "db:check")
        db_check
        ;;
    "db:backup")
        db_backup
        ;;
    "db:restore")
        db_restore
        ;;
    "dev")
        dev_start
        ;;
    "prod:build")
        prod_build
        ;;
    "prod:start")
        prod_start
        ;;
    *)
        echo "Yulu Employee Issue Management System - Deployment Scripts"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Setup Commands:"
        echo "  setup       - Complete local deployment setup"
        echo "  mysql       - Setup MySQL database"
        echo "  env         - Create environment file"
        echo "  install     - Install dependencies"
        echo "  migrate     - Run database migrations"
        echo "  seed        - Seed database with data"
        echo "  build       - Build application"
        echo ""
        echo "Testing Commands:"
        echo "  test-auth   - Test authentication system"
        echo "  verify      - Verify deployment"
        echo ""
        echo "Database Commands:"
        echo "  db:push     - Push schema to database"
        echo "  db:generate - Generate migrations"
        echo "  db:studio   - Open database studio"
        echo "  db:check    - Check database connection"
        echo "  db:backup   - Backup database"
        echo "  db:restore  - Restore database"
        echo ""
        echo "Development Commands:"
        echo "  dev         - Start development server"
        echo "  prod:build  - Build for production"
        echo "  prod:start  - Start production server"
        echo ""
        echo "Examples:"
        echo "  $0 setup           # Complete setup"
        echo "  $0 mysql           # Setup MySQL only"
        echo "  $0 test-auth       # Test authentication"
        echo "  $0 verify          # Verify deployment"
        exit 1
        ;;
esac