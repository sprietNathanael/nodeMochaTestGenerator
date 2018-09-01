const ParameterType = require("./ParameterType");
const assert = require('assert');
const sinon = require('sinon');

class FunctionTesterAbstract {
    /**
     * Represents an abstract function tester for mocha unit testing
     * @param {Function} functionToTest The function to be tested
     * @param {[ParameterType]} parameterTypes The parameter types in the correct order
     * @param {Class} context The context of the function calling
     * @param {[Object]} complementaryTestSuite A complementary test suite
     */
    constructor(functionToTest, parameterTypes, context, complementaryTestSuite = []) {
        // Prevent the function to be instanciated
        if (new.target === FunctionTesterAbstract) {
            throw new TypeError("Cannot construct FunctionTesterAbstract instances directly");
        }

        // Force the override of the function
        if (this.testSuite === undefined) {
            throw new TypeError("Must override testSuite");
        }
        this.functionToTest = functionToTest;
        this.parameterTypes = parameterTypes;
        this.context = context;
        this.wrongTypeParameters = this.parameterTypes.map(el => el.type.wrongTypeParameter);
        this.correctTypeParameters = this.parameterTypes.map(el => el.type.correctTypeParameter);
        this.complementaryTestSuite = complementaryTestSuite;
    }

    /**
     * Tests the function :
     * - Test the parameters types
     * - Run test suite
     */
    testFunction() {
        describe(this.functionToTest.name, () => {
            this.testTypeParams();
            this.testSuite();
        });
    }

    /**
     * Runs the complementary test suite
     */
    runComplementaryTestSuite() {
        // Run each test of the complementary tests suite
        for (let test of this.complementaryTestSuite) {
            // If a result is expected
            if (test.expectedResult !== undefined) {
                if (test.promise) {

                    this.runOneSuiteTestWithResultWithinPromise(test.description, this.functionToTest, this.context, test.parametersToTest, test.expectedResult);
                } else {

                    this.runOneSuiteTestWithResult(test.description, this.functionToTest, this.context, test.parametersToTest, test.expectedResult);
                }
            }
            // If a function call is expected
            else if (test.expectedFunction !== undefined) {
                // If the test should be encapsulated in a promise
                if (test.promise) {
                    this.runOneSuiteTestWithFunctionCallPromise(test.description, this.functionToTest, this.context, test.parametersToTest, test.expectedFunction, test.expectedFunctionContext, test.expectedParameters);
                } else {

                    this.runOneSuiteTestWithFunctionCall(test.description, this.functionToTest, this.context, test.parametersToTest, test.expectedFunction, test.expectedFunctionContext, test.expectedParameters);
                }
            } else if (test.customTestFunction !== undefined) {
                if (test.promise) {
                    this.runCustomTestFunctionWithPromise(test.description, test.customTestFunction);
                } else {
                    this.runCustomTestFunction(test.description, test.customTestFunction);
                }
            }
        }
    }

    /**
     * Test the type of the parameters.
     * 1 test if there is no parameters
     * 2 test each parameter one by one if it is of the wrong type
     * 3 test the different quantity of parameters from 1 to max
     * 4 test if all parameters are of the correct type
     */
    testTypeParams() {
        this.testNoParameterError();

        let parametersToTest = [];

        // For each parameter test if it is the wrong type and the others correct
        for (let i = 0; i < this.parameterTypes.length; i++) {
            parametersToTest = this.correctTypeParameters.slice();
            parametersToTest[i] = this.wrongTypeParameters[i];
            this.testWrongParametersError(parametersToTest);
        }

        // test the different quantity of parameters from 1 to max
        for (let i = 1; i < this.correctTypeParameters.length; i++) {
            this.testWrongParametersError(this.correctTypeParameters.slice(0, i));
        }

        this.testCorrectParametersType(this.correctTypeParameters);
    }

    /**
     * Test the TypeError throwing if no parameter is passed to the function to test
     */
    testNoParameterError() {
        var self = this;
        it("should throw a TypeError if there are no parameter", function () {
            assert.throws(() => self.functionToTest(), TypeError);
        });
    }

    /**
     * Test the TypeError throwing if the function to test is called and a parameter is wrong or is missing
     * @param {[any]} parameters
     */
    testWrongParametersError(parameters) {
        var self = this;
        it("should throw a TypeError if one or more paramter is wrong", function () {
            assert.throws(() => self.functionToTest.apply(self.context, parameters), TypeError);
        });
    }

    /**
     * Test the TypeError is not thrown if the function to test is called with the correct type parameters
     * @param {[any]} parameters
     */
    testCorrectParametersType(parameters) {
        var self = this;
        it("should not throw a TypeError if all parameters are correct", function () {
            assert.doesNotThrow(() => self.functionToTest.apply(self.context, parameters), TypeError);
        });
    }

    /**
     * Run a single test from a test suite that should return an object
     * @param {String} description The description of the test condition
     * @param {Function} functionToTest The function to test
     * @param {Object} context The context of the function to test
     * @param {[any]} parametersToTest The parameters to pass at the function
     * @param {any} expectedResult The expected result
     */
    runOneSuiteTestWithResult(description, functionToTest, context, parametersToTest, expectedResult) {
        it('should return ' + description, () => {
            assert.equal(functionToTest.apply(context, parametersToTest), expectedResult);
        });
    }

    /**
     * Run a single test from a test suite that should return an object through a promise
     * @param {String} description The description of the test condition
     * @param {Function} functionToTest The function to test
     * @param {Object} context The context of the function to test
     * @param {[any]} parametersToTest The parameters to pass at the function
     * @param {any} expectedResult The expected result
     */
    runOneSuiteTestWithResultWithinPromise(description, functionToTest, context, parametersToTest, expectedResult) {
        it('should return ' + description, (done) => {

            // call the function and the assert in the then
            functionToTest.apply(context, parametersToTest).then((result) => {
                try {
                    assert(result, expectedResult);
                    done();
                } catch (error) {
                    mySpy.restore();
                    done(error);
                }
            });
        });
    }

    /**
     * Run a single test from a test suite that should call a function with specified arguments (no arguments by default)
     * @param {String} description The description of the test condition
     * @param {Function} functionToTest The function to test
     * @param {Object} context The context of the function to test
     * @param {[any]} parametersToTest The parameters to pass at the function
     * @param {Function} expectedFunction The expected function to be called
     * @param {Function} expectedFunctionContext The expected function to be called context
     * @param {[any]} resFunctionArgs The parameters of the expected function call
     */
    runOneSuiteTestWithFunctionCall(description, functionToTest, context, parametersToTest, expectedFunction, expectedFunctionContext, resFunctionArgs = []) {
        it('should call the function ' + description, () => {

            // create a spy on the expected function
            const mySpy = sinon.spy(expectedFunctionContext, expectedFunction.name);

            // Calls the function to test
            functionToTest.apply(context, parametersToTest);

            // Assert that the spy has been called
            assert(mySpy.calledWithExactly.apply(mySpy, resFunctionArgs), true);

            // Restore the function
            mySpy.restore();

        });
    }

    /**
     * Run a single test from a test suite that should call a function with specified arguments (no arguments by default).
     * The function to test has to be thenable for asynchronous reasons
     * @param {String} description The description of the test condition
     * @param {Function} functionToTest The function to test
     * @param {Object} context The context of the function to test
     * @param {[any]} parametersToTest The parameters to pass at the function
     * @param {Function} expectedFunction The expected function to be called
     * @param {Function} expectedFunctionContext The expected function to be called context
     * @param {[any]} resFunctionArgs The parameters of the expected function call
     */
    runOneSuiteTestWithFunctionCallPromise(description, functionToTest, context, parametersToTest, expectedFunction, expectedFunctionContext, resFunctionArgs) {
        it('should call the function ' + description, (done) => {

            // Create a spy on the expected function
            const mySpy = sinon.spy(expectedFunctionContext, expectedFunction.name);

            try {
                // call the function and the assert in the then
                functionToTest.apply(context, parametersToTest).then(() => {
                    try {
                        // assert that the spy has been called
                        if (resFunctionArgs !== undefined) {
                            assert(mySpy.calledWithExactly.apply(mySpy, resFunctionArgs), true);
                        } else {
                            assert(mySpy.called, true);
                        }
                        mySpy.restore();
                        done();
                    } catch (error) {
                        mySpy.restore();
                        done(error);
                    }
                });

            } catch (error) {
                mySpy.restore();
                done(error);
            }
        });
    }

    /**
     * Runs a custom test function without calling the function to test
     * @param {String} description The description of the test
     * @param {Function} customTestFunction The test function
     */
    runCustomTestFunction(description, customTestFunction) {
        it(description, () => {
            customTestFunction();
        });
    }

    /**
     * Runs a custom test function without calling the function to test that returns a promise
     * @param {String} description The description of the test
     * @param {Function} customTestFunction The test function
     */
    runCustomTestFunctionWithPromise(description, customTestFunction) {
        it(description, (done) => {
            customTestFunction().then(() => {
                done()
            }).catch((error) => {
                done(error);
            });
        });
    }
}

module.exports = FunctionTesterAbstract;