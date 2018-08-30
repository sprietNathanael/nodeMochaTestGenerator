const ParameterType = require("./ParameterType");
const FunctionTesterAbstract = require("./FunctionTesterAbstract");

class FunctionWithReturnTester extends FunctionTesterAbstract {
    /**
     * Represents a function tester for mocha style unit testing for function that returns something
     * @param {Function} functionToTest The function to be tested
     * @param {[ParameterType]} parameterTypes The parameter types in the correct order
     * @param {Object} wrongTestsSuiteResult The results of wrong parameters tests
     * @param {any} correctResult The result of a correct test
     * @param {Class} context The context of the function calling
     * @param {[Object]} complementaryTestSuite A complementary test suite
     */
    constructor(functionToTest, parameterTypes, wrongTestsSuiteResult, correctResult, context, complementaryTestSuite = []) {
        super(functionToTest, parameterTypes, context);
        this.wrongTestsSuiteResult = wrongTestsSuiteResult;
        this.correctResult = correctResult;
    }

    /**
     * Runs the test suite
     */
    testSuite() {
        var self = this;

        // For each parameters, runs its tests with the other parameters corrects
        for (let i = 0; i < this.parameterTypes.length; i++) {

            // For each parameter test
            this.parameterTypes[i].type.tests.forEach((test) => {

                // Make a copy of the correct parameters
                let parametersToTest = this.correctTypeParameters.slice();

                // Change the current parameter for the current test result
                parametersToTest[i] = test.value;

                // If the test result is true, the expected result is the function correct expected result, else is the wrong test suite result corresponding to the current parameter alone
                let expectedResult = test.result ? self.correctResult : self.wrongTestsSuiteResult["" + i]
                this.runOneSuiteTestWithResult("" + expectedResult + " if the " + self.parameterTypes[i].name + " " + test.description, self.functionToTest, self.context, parametersToTest, expectedResult);
            });
        }

        // For each tests in the wrong tests suite
        Object.keys(this.wrongTestsSuiteResult).map(function (key, index) {

            // Isolate the parameters to make wrong
            let wrongParametersNumbers = key.split(",");

            // If there are more than 1 parameter to test (if there is only one, the case has already been tested above)
            if (wrongParametersNumbers.length > 1) {

                // Make a copy of the correct parameters
                let parametersToTest = self.correctTypeParameters.slice();
                let wrongParametersString = "";

                // For each parameter to test
                for (let i = 0; i < wrongParametersNumbers.length; i++) {

                    let parameterNumber = parseInt(wrongParametersNumbers[i]);

                    // Change the parameters array to include one of the wrong value of the parameters found in its tests
                    parametersToTest[parameterNumber] = self.parameterTypes[parameterNumber].type.tests.find(test => test.result === false).value;

                    wrongParametersString += " " + self.parameterTypes[parameterNumber].name;
                }

                // The expected result is the value of the current test
                let expectedResult = self.wrongTestsSuiteResult[key];

                self.runOneSuiteTestWithResult("" + expectedResult + " if the " + wrongParametersString + " are wrong", self.functionToTest, self.context, parametersToTest, expectedResult);

            }
        });

        this.runComplementaryTestSuite();
    }
}

module.exports = FunctionWithReturnTester;