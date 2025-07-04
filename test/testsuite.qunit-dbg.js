sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: com.alarhoo.empflowyee",
		defaults: {
			page: "ui5://test-resources/com/alarhoo/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "com/alarhoo/",
				never: "test-resources/com/alarhoo/"
			},
			loader: {
				paths: {
					"com/alarhoo": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for com.alarhoo.empflowyee"
			},
			"integration/opaTests": {
				title: "Integration tests for com.alarhoo.empflowyee"
			}
		}
	};
});
