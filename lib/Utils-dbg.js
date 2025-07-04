sap.ui.define([
], function () {
	'use strict'

	return {
		/**
		 * Checks if a value "exists" in a variable based on specific criteria:
		 * - Is not null or undefined.
		 * - Is not an empty string (or a string with only whitespace).
		 * - Is not an empty array.
		 * - Is not an empty plain JavaScript object (e.g., `{}`).
		 * @param {*} value The variable whose existence is to be checked.
		 * @returns {boolean} True if the value exists based on these criteria, false otherwise.
		 */
		valueExists: (value) => {
			// 1. Check for null or undefined
			if (value === null || typeof value === 'undefined') {
				return false
			}

			// 2. Check for empty string (after trimming whitespace)
			if (typeof value === 'string' && value.trim() === '') {
				return false
			}

			// 3. Check for empty array
			if (Array.isArray(value) && value.length === 0) {
				return false
			}

			// 4. Check for empty plain object (excluding arrays, which are also typeof 'object')
			// This specifically targets objects created with `{}` or `new Object()`.
			if (typeof value === 'object' && !Array.isArray(value)) {
				// Checks if the object has no enumerable properties and its constructor is the base Object constructor.
				if (Object.keys(value).length === 0 && value.constructor === Object) {
					return false
				}
			}

			// If none of the above conditions returned false, the value is considered to "exist".
			return true
		}
	}
})
