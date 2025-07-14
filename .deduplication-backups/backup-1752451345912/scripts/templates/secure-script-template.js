#!/usr/bin/env node
/**
 * Secure Script Template
 *
 * This template enforces file permission security best practices.
 * Use this as a starting point for all new scripts that handle file operations.
 */

const fs = require('fs');
const path = require('path');

// Import security utilities
const { ErrorHandler, ErrorSeverity } = require('../utils/system/errorHandler');

/**
 * Secure file creation with mandatory permission setting
 * @param {string} filePath - Target file path
 * @param {string|Buffer} content - File content
 * @param {number} [permissions=0o644] - File permissions (default: read-write owner, read-only others)
 */
function secureFileCreation(filePath, content, permissions = 0o644) {
  try {
    // Validate input
    if (!filePath) {
      throw new Error('File path is required');
    }
    if (content === undefined || content === null) {
      throw new Error('File content is required');
    }

    // Create file with content
    fs.writeFileSync(filePath, content);

    // SECURITY: Always set explicit permissions
    fs.chmodSync(filePath, permissions);

    console.log(`✅ File created securely: ${filePath} (permissions: ${permissions.toString(8)})`);
    return filePath;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Secure file creation failed'),
      ErrorSeverity.HIGH,
      'Secure file creation'
    );
    throw error;
  }
}

/**
 * Secure file copying with mandatory permission setting
 * @param {string} sourcePath - Source file path
 * @param {string} targetPath - Target file path
 * @param {number} [permissions=0o644] - File permissions (default: read-write owner, read-only others)
 */
function secureFileCopy(sourcePath, targetPath, permissions = 0o644) {
  try {
    // Validate input
    if (!sourcePath || !targetPath) {
      throw new Error('Source and target paths are required');
    }
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file does not exist: ${sourcePath}`);
    }

    // Copy file
    fs.copyFileSync(sourcePath, targetPath);

    // SECURITY: Always set explicit permissions
    fs.chmodSync(targetPath, permissions);

    console.log(
      `✅ File copied securely: ${sourcePath} → ${targetPath} (permissions: ${permissions.toString(8)})`
    );
    return targetPath;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Secure file copy failed'),
      ErrorSeverity.HIGH,
      'Secure file copying'
    );
    throw error;
  }
}

/**
 * Secure directory creation with mandatory permission setting
 * @param {string} dirPath - Directory path
 * @param {number} [permissions=0o755] - Directory permissions (default: traversable, read-only others)
 */
function secureDirectoryCreation(dirPath, permissions = 0o755) {
  try {
    // Validate input
    if (!dirPath) {
      throw new Error('Directory path is required');
    }

    // Create directory recursively
    fs.mkdirSync(dirPath, { recursive: true });

    // SECURITY: Always set explicit permissions
    fs.chmodSync(dirPath, permissions);

    console.log(
      `✅ Directory created securely: ${dirPath} (permissions: ${permissions.toString(8)})`
    );
    return dirPath;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Secure directory creation failed'),
      ErrorSeverity.HIGH,
      'Secure directory creation'
    );
    throw error;
  }
}

/**
 * Secure environment file creation with restrictive permissions
 * @param {string} filePath - Environment file path
 * @param {string} content - Environment file content
 */
function secureEnvFileCreation(filePath, content) {
  // Environment files should have owner-only access
  return secureFileCreation(filePath, content, 0o600);
}

/**
 * Secure JSON configuration file creation
 * @param {string} filePath - JSON file path
 * @param {object} data - Data to serialize as JSON
 */
function secureJsonFileCreation(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    return secureFileCreation(filePath, content, 0o644);
  } catch (error) {
    throw new Error(`Failed to create JSON file: ${error.message}`);
  }
}

/**
 * Secure log file creation with appropriate permissions
 * @param {string} filePath - Log file path
 * @param {string} content - Log content
 */
function secureLogFileCreation(filePath, content) {
  // Log files should be readable by others for debugging
  return secureFileCreation(filePath, content, 0o644);
}

/**
 * Permission constants for different file types
 */
const PERMISSIONS = {
  // File permissions
  READABLE_FILE: 0o644, // Read-write owner, read-only others
  OWNER_ONLY_FILE: 0o600, // Owner-only access (secrets, private keys)
  EXECUTABLE_FILE: 0o755, // Executable by owner, read-only others

  // Directory permissions
  READABLE_DIR: 0o755, // Traversable by others, writable by owner
  OWNER_ONLY_DIR: 0o700, // Owner-only access

  // Specific file types
  ENV_FILE: 0o600, // Environment files (secrets)
  CONFIG_FILE: 0o644, // Configuration files
  LOG_FILE: 0o644, // Log files
  SCRIPT_FILE: 0o755, // Executable scripts
};

/**
 * Validate file permissions
 * @param {string} filePath - File path to check
 * @param {number} expectedPermissions - Expected permission level
 * @returns {boolean} True if permissions match expected
 */
function validateFilePermissions(filePath, expectedPermissions) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    const actualPermissions = stats.mode & parseInt('777', 8);

    if (actualPermissions === expectedPermissions) {
      console.log(`✅ Permissions valid: ${filePath} (${actualPermissions.toString(8)})`);
      return true;
    } else {
      console.warn(
        `⚠️  Permission mismatch: ${filePath} - Expected: ${expectedPermissions.toString(8)}, Actual: ${actualPermissions.toString(8)}`
      );
      return false;
    }
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Permission validation failed'),
      ErrorSeverity.MEDIUM,
      'File permission validation'
    );
    return false;
  }
}

/**
 * Audit directory for insecure file permissions
 * @param {string} dirPath - Directory to audit
 * @returns {Array} List of files with insecure permissions
 */
function auditDirectoryPermissions(dirPath) {
  const insecureFiles = [];

  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach(file => {
      const fullPath = path.join(dirPath, file.name);

      if (file.isFile()) {
        const stats = fs.statSync(fullPath);
        const permissions = stats.mode & parseInt('777', 8);

        // Check for world-writable files (potential security risk)
        if (permissions & 0o002) {
          insecureFiles.push({
            path: fullPath,
            permissions: permissions.toString(8),
            issue: 'World-writable file',
          });
        }

        // Check for executable data files (potential security risk)
        const ext = path.extname(file.name).toLowerCase();
        const dataExtensions = ['.json', '.md', '.txt', '.log', '.yml', '.yaml'];
        if (dataExtensions.includes(ext) && permissions & 0o111) {
          insecureFiles.push({
            path: fullPath,
            permissions: permissions.toString(8),
            issue: 'Executable data file',
          });
        }
      }
    });
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Directory audit failed'),
      ErrorSeverity.MEDIUM,
      'Directory permission audit'
    );
  }

  return insecureFiles;
}

// Export security functions
module.exports = {
  secureFileCreation,
  secureFileCopy,
  secureDirectoryCreation,
  secureEnvFileCreation,
  secureJsonFileCreation,
  secureLogFileCreation,
  validateFilePermissions,
  auditDirectoryPermissions,
  PERMISSIONS,
};

// Example usage (remove this section when using as template)
if (require.main === module) {
  console.log('🔒 Secure Script Template Example');
  console.log('================================\n');

  // Example: Create a secure configuration file
  const configData = {
    appName: 'Organism Simulation',
    version: '1.0.0',
    security: {
      enforcePermissions: true,
      auditEnabled: true,
    },
  };

  try {
    // Create secure JSON configuration
    const configPath = path.join(__dirname, 'example-config.json');
    secureJsonFileCreation(configPath, configData);

    // Validate the permissions
    validateFilePermissions(configPath, PERMISSIONS.CONFIG_FILE);

    // Audit current directory
    const auditResults = auditDirectoryPermissions(__dirname);
    if (auditResults.length > 0) {
      console.log('\n⚠️  Security audit found issues:');
      auditResults.forEach(issue => {
        console.log(`  ${issue.issue}: ${issue.path} (${issue.permissions})`);
      });
    } else {
      console.log('\n✅ Security audit passed - no issues found');
    }

    // Clean up example file
    fs.unlinkSync(configPath);
    console.log('\n🧹 Example cleanup completed');
  } catch (error) {
    console.error('❌ Example failed:', error.message);
    process.exit(1);
  }
}
