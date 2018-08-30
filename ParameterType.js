const SingleAssertEqualsTestParameters = require("./SingleAssertEqualsTestParameters");

class ParameterType{
    /**
     * Represents a parameter type
     * @param {String} name Name of the parameter type
     * @param {[SingleAssertEqualsTestParameters]} tests Array of assert equals test
     * @param {any} correctTypeParameter Example of a correct type
     * @param {any} wrongTypeParameter Example of a wrong type
     */
    constructor(name, tests, correctTypeParameter, wrongTypeParameter){
        this.name = name;
        this.tests = tests;
        this.correctTypeParameter = correctTypeParameter;
        this.wrongTypeParameter = wrongTypeParameter;
    }
}

module.exports = ParameterType;