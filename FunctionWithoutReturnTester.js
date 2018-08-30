const ParameterType = require("./ParameterType");
const FunctionTesterAbstract = require("./FunctionTesterAbstract");

class FunctionWithoutReturnTester extends FunctionTesterAbstract {
    /**
     * Represents a function tester for mocha style unit testing for function that does not return anything
     * @param {Function} functionToTest The function to be tested
     * @param {[ParameterType]} parameterTypes The parameter types in the correct order
     * @param {Class} context The context of the function calling
     * @param {[Object]} complementaryTestSuite A complementary test suite
     */
    constructor(functionToTest, parameterTypes, context, complementaryTestSuite = []) {
        super(functionToTest, parameterTypes, context, complementaryTestSuite);
    }

    /**
     * Runs the test suite
     */
    testSuite() {
        this.runComplementaryTestSuite();
    }
}
module.exports = FunctionWithoutReturnTester;