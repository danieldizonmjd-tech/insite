/**
 * Input Sanitizer - Secure input validation and sanitization
 * Protects against XSS, SQL injection, and other security threats
 */

const InputSanitizer = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} input - Raw user input
     * @returns {string} - Sanitized input
     */
    sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
        };
        
        return input.replace(/[&<>"'/]/g, (char) => map[char]);
    },

    /**
     * Sanitize email addresses
     * @param {string} email - Email input
     * @returns {string|null} - Sanitized email or null if invalid
     */
    sanitizeEmail(email) {
        if (typeof email !== 'string') return null;
        
        // Remove whitespace
        email = email.trim().toLowerCase();
        
        // Basic email validation
        const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) {
            return null;
        }
        
        // Additional security: limit length
        if (email.length > 254) {
            return null;
        }
        
        return email;
    },

    /**
     * Sanitize text input (names, general text)
     * @param {string} input - Text input
     * @param {number} maxLength - Maximum allowed length
     * @returns {string} - Sanitized text
     */
    sanitizeText(input, maxLength = 100) {
        if (typeof input !== 'string') return '';
        
        // Remove leading/trailing whitespace
        input = input.trim();
        
        // Remove control characters and special chars
        input = input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        // Limit length
        input = input.substring(0, maxLength);
        
        // HTML encode for safety
        return this.sanitizeHTML(input);
    },

    /**
     * Sanitize ZIP codes (US format)
     * @param {string} zip - ZIP code input
     * @returns {string|null} - Sanitized ZIP or null if invalid
     */
    sanitizeZipCode(zip) {
        if (typeof zip !== 'string') return null;
        
        // Remove whitespace and convert to string
        zip = String(zip).trim();
        
        // Allow 5-digit or 9-digit (with hyphen) ZIP codes
        const zipRegex = /^[0-9]{5}(-[0-9]{4})?$/;
        
        if (!zipRegex.test(zip)) {
            return null;
        }
        
        return zip;
    },

    /**
     * Sanitize numeric input
     * @param {string|number} input - Numeric input
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number|null} - Sanitized number or null if invalid
     */
    sanitizeNumber(input, min = -Infinity, max = Infinity) {
        const num = Number(input);
        
        if (isNaN(num) || !isFinite(num)) {
            return null;
        }
        
        if (num < min || num > max) {
            return null;
        }
        
        return num;
    },

    /**
     * Sanitize password (validate requirements)
     * @param {string} password - Password input
     * @returns {Object} - {valid: boolean, message: string}
     */
    validatePassword(password) {
        if (typeof password !== 'string') {
            return { valid: false, message: 'Invalid password format' };
        }
        
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        
        if (password.length > 128) {
            return { valid: false, message: 'Password is too long' };
        }
        
        // Check for at least one letter and one number (recommended)
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        if (!hasLetter || !hasNumber) {
            return { valid: false, message: 'Password must contain letters and numbers' };
        }
        
        return { valid: true, message: 'Password is valid' };
    },

    /**
     * Sanitize search queries
     * @param {string} query - Search query
     * @returns {string} - Sanitized query
     */
    sanitizeSearchQuery(query) {
        if (typeof query !== 'string') return '';
        
        // Trim and limit length
        query = query.trim().substring(0, 200);
        
        // Remove special characters that could be used for injection
        query = query.replace(/[;<>{}()[\]\\]/g, '');
        
        return this.sanitizeHTML(query);
    },

    /**
     * Apply sanitization to a form element
     * @param {HTMLFormElement} form - Form to sanitize
     * @returns {Object} - Sanitized form data
     */
    sanitizeForm(form) {
        const sanitized = {};
        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            // Determine sanitization method based on input type
            const input = form.elements[key];
            
            if (!input) {
                sanitized[key] = this.sanitizeText(value);
                continue;
            }
            
            switch (input.type) {
                case 'email':
                    sanitized[key] = this.sanitizeEmail(value);
                    break;
                case 'number':
                    const min = parseFloat(input.min) || -Infinity;
                    const max = parseFloat(input.max) || Infinity;
                    sanitized[key] = this.sanitizeNumber(value, min, max);
                    break;
                case 'password':
                    // Don't sanitize password content, but validate it
                    sanitized[key] = value; // Will be validated separately
                    break;
                case 'checkbox':
                case 'radio':
                    sanitized[key] = input.checked;
                    break;
                default:
                    sanitized[key] = this.sanitizeText(value);
            }
        }
        
        return sanitized;
    },

    /**
     * Validate and sanitize API responses
     * @param {any} data - Response data
     * @returns {any} - Sanitized data
     */
    sanitizeAPIResponse(data) {
        if (typeof data === 'string') {
            return this.sanitizeHTML(data);
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeAPIResponse(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeAPIResponse(value);
            }
            return sanitized;
        }
        
        return data;
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputSanitizer;
}
