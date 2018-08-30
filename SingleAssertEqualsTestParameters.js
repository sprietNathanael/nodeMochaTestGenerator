class SingleAssertEqualsTestParameters{
    /**
     * Represents a single assert equals test parameters set
     * @param {String} description Description of the test
     * @param {any} value Value to test
     * @param {any} result Result of the test
     */
    constructor(description, value, result){
        this.description = description;
        this.value = value;
        this.result = result;
    }
}

module.exports = SingleAssertEqualsTestParameters;