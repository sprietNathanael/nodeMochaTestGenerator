# nodeMochaTestGenerator

Node library that generates and runs unit tests for mocha from Json description of functions.

Those tests can be:
- on the expected result of a function
- on the `TypeError` throwing if a parameter is not correct
- on the expected calling of a function inside the function to test

Before describing a function, its parameters types has to be described.

A parameter of a function is seen as a type coupled with a name.

## Describe the types

A type is a [`ParameterType`](#ParameterType) instance that contains a suite of tests. Those tests are [`SingleAssertEqualsTestParameters`](#SingleAssertEqualsTestParameters) instances.


### SingleAssertEqualsTestParameters

#### Definition

The purpose of `SingleAssertEqualsTestParameters` class is to create tests that defines the type.

The constructor of `SingleAssertEqualsTestParameters` takes the following parameters :

| Name          | Type   | Description                     |
| ------------- | ------ | ------------------------------- |
| `description` | String | Describe the test               |
| `value`       | any    | The value to test               |
| `result`      | any    | The expected result of the test |


#### Example

```javascript
const nameTestParameters = [
    new SingleAssertEqualsTestParameters("is empty", "", false),
    new SingleAssertEqualsTestParameters("contains special characters", "+=$^", false),
    new SingleAssertEqualsTestParameters("contains space", "test test", false),
    new SingleAssertEqualsTestParameters("contains numerics", "test123", false),
    new SingleAssertEqualsTestParameters("is correct", "TestT_-éÉêËàÀçÇÿ", true)
];
```

### ParameterType

#### Definition

The purpose of `ParameterType` class is to create a type that can be reused for multiple functions.

The function to test has to throw `TypeError` if the given parameter is the `wrongTypeParameter`, but never if it is the `correctTypeParameter`.

The constructor of `ParameterType` takes the following parameters :

| Name                   | Type                                                                    | Description                                                                 |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `name`                 | String                                                                  | Name of the parameter                                                       |
| `tests`                | [[SingleAssertEqualsTestParameters](#SingleAssertEqualsTestParameters)] | The array of [single assert equals test](#SingleAssertEqualsTestParameters) |
| `correctTypeParameter` | any                                                                     | An example of a correct value (= that should not throw a TypeError)         |
| `wrongTypeParameter`   | any                                                                     | An example of a wrong type (= that should throw a TypeError)                |

#### Example

A type `name` should not be empty, should not contains special characters, spaces or numerics, but could contains multiple uppercase letters, _ and -, and accented letters.

```javascript
var nameParameterType = new ParameterType("name",nameTestParameters,"TestT_-éÉêËàÀçÇÿ",123);
```

## Describe the function

There are two different classes to describe a function. Each of them extends `FunctionTesterAbastract`:
- [`FunctionWithReturnTester`](#FunctionWithReturnTester), used when the function to test returns something
- [`FunctionWithoutReturnTester`](#FunctionWithoutReturnTester), used when the function to test does not return anything

### FunctionWithoutReturnTester

#### Definition

The `FunctionWithReturnTester` takes the following parameters :


| Name                     | Type                                  | Description                                                                                                                                             |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `functionToTest`         | Function                              | A reference to the function to be tested                                                                                                                |
| `parameterTypes`         | [Object]                              | The array of objects representing the parameters in the correct order with properties `type` as a [parameter type](#ParameterType) and `name` as string |
| `correctResult`          | any                                   | The result of a correct test                                                                                                                            |
| `context`                | Object                                | The context of the function calling                                                                                                                     |
| `complementaryTestSuite` | [\[Object\]](#complementaryTestSuite) | A [complementary tests suite](#complementaryTestSuite) (empty by default)                                                                               |

#### Usage

The only function that should be accessible is `testFunction()`, that takes no parameters.

#### Example

```javascript

const parameterTypes = [{
    type: myParameterType,
    name: "parameterName"
    },...
];
const complementaryTestSuite = [...];

var foo = {
    bar: function(test){
        console.log(test);
    }
}

var encapsulatingContext ={
    functionToTest = function (param){
        foo.bar(param);
    }
}

var checkfunctionToTest = new FunctionWithoutReturnTester(encapsulatingContext.functionToTest, parameterTypes, encapsulatingContext, complementaryTestSuite);

describe('functionToTest', function () {
    encapsulatingContext.testFunction();
});

```

### FunctionWithReturnTester

#### Definition

The `FunctionWithReturnTester` takes the following parameters :


| Name                     | Type                                  | Description                                                                                                                                             |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `functionToTest`         | Function                              | A reference to the function to be tested                                                                                                                |
| `parameterTypes`         | [Object]                              | The array of objects representing the parameters in the correct order with properties `type` as a [parameter type](#ParameterType) and `name` as string |
| `wrongTestsSuiteResult`  | Object                                | The result of wrong parameters tests                                                                                                                    |
| `correctResult`          | any                                   | An example of of a correct test result                                                                                                                  |
| `context`                | Object                                | The context of the function calling                                                                                                                     |
| `complementaryTestSuite` | [\[Object\]](#complementaryTestSuite) | A [complementary tests suite](#complementaryTestSuite) (empty by default)                                                                               |

#### Usage

The only function that should be accessible is `testFunction()`, that takes no parameters.

#### Example

```javascript

const parameterTypes = [{
    type: myParameterType,
    name: "parameterName"
    },...
];
const complementaryTestSuite = [...];
const wrongTestSuite = {...};
const correctResult = {...};

var foo = {
    bar: function(test){
        console.log(test);
    }
}

var encapsulatingContext ={
    functionToTest = function (param){
        return (param);
    }
}

var checkfunctionToTest = new FunctionWithReturnTester(encapsulatingContext.functionToTest, parameterTypes, wrongTestSuite, correctResult, encapsulatingContext, complementaryTestSuite);

describe('functionToTest', function () {
    encapsulatingContext.testFunction();
});

```

### complementaryTestSuite

#### Definition

Both functions takes a `complementaryTestSuite`. This test suite is an array of objects representing a test. This test can either expect something to be returned (with `expectedResult`) or expect a function to be called (with `expectedFunction`). If a function call is expected, this call could be done in a promise if the function to test is asynchronous. In that case, use `promise=true`.

| Name                      | Type     | Description                                                                                                                                                |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`             | String   | A description of the test                                                                                                                                  |
| `parametersToTest`        | [any]    | An array of the parameters to test                                                                                                                         |
| `expectedResult`          | any      | The expected result of the function call (only if a return is expected)                                                                                    |
| `expectedFunction`        | Function | The function that is expected to be called (only if a function call is expected)                                                                           |
| `expectedFunctionContext` | Object   | The context of the expected (only if a function call is expected)                                                                                          |
| `expectedParameters`      | [any]    | An array of the expected parameters of the function call (only if a function call is expected). Set to an empty array if the calls is expected without parameters. Set to undefined to test only the call, taking no accounts of the parameters |
| `promise`                 | boolean  | Set it to `true` if the expected function call happens in a promise (mostly if the funciton to test is asynchronous)                                       |

#### Example

```javascript
var foo = {
    bar: function(test){
        console.log(test);
    }
}

functionToTest = function (param){
    foo.bar(param);
}

var complementarySingleTest = {
    description: "foo.bar with parameter 'foobar'",
    parametersToTest: ["bar"],
    expectedFunction: foo.bar,
    expectedFunctionContext: foo,
    expectedParameters: ["foobar"],
    promise: false
}
```

### wrongTestsSuiteResult

#### Definition

This test suite is an object representing the result of a function if its parameters are false. It is a dictionnary with :
- as key, a string representing the indexes of parameters to consider wrong separated by a coma
- as value, the expected result of the function

The test suite has to contain at least one item for each parameter representing a test if the parameter is wrong

#### Example

```javascript
checkUserFormat(lastname, firstname, username, password) {
    let res = "";
    if (lastname !== undefined && !this.checkName(lastname)) {
        res += "lastname,";
    }
    if (firstname !== undefined && !this.checkName(firstname)) {
        res += "firstname,";
    }
    if (username !== undefined && !this.checkUsername(username)) {
        res += "username,";
    }
    if (password !== undefined && !this.checkPassword(password)) {
        res += "password,";
    }
    res = res.slice(0, -1);
    return res;
}

const wrongTestSuite = {
    "0":"lastname",
    "0,1":"lastname,firstname",
    "0,2":"lastname,username",
    "0,1,2":"lastname,firstname,username",
    "0,3":"lastname,password",
    "0,1,3":"lastname,firstname,password",
    "0,2,3":"lastname,username,password",
    "0,1,2,3":"lastname,firstname,username,password",
    "1":"firstname",
    "1,2":"firstname,username",
    "1,3":"firstname,password",
    "1,2,3":"firstname,username,password",
    "2":"username",
    "2,3":"username,password",
    "3":"password",
}
```

## Usage example

### Functions to test

Take for example a class containing methods to test a function (this is a stripped version of the class [`UserUtils`](https://github.com/sprietNathanael/Node_users-management-service/blob/develop/src/controller/userUtils.js) from the [`Node_users-management-service` project](https://github.com/sprietNathanael/Node_users-management-service))

```javascript
class UserUtils {

    constructor() {
    }

    checkUserFormat(lastname, firstname, username, password) {
        if (typeof lastname !== "string") {
            throw new TypeError("lastname is wrong : " + (typeof lastname) + " is not a string");
        }
        if (typeof firstname !== "string") {
            throw new TypeError("firstname is wrong : " + (typeof firstname) + " is not a string");
        }
        if (typeof username !== "string") {
            throw new TypeError("username is wrong : " + (typeof username) + " is not a string");
        }
        if (typeof password !== "string") {
            throw new TypeError("firstname is wrong : " + (typeof firstname) + " is not a string");
        }

        let res = "";
        if (lastname !== undefined && !this.checkName(lastname)) {
            res += "lastname,";
        }
        if (firstname !== undefined && !this.checkName(firstname)) {
            res += "firstname,";
        }
        if (username !== undefined && !this.checkUsername(username)) {
            res += "username,";
        }
        if (password !== undefined && !this.checkPassword(password)) {
            res += "password,";
        }
        res = res.slice(0, -1);
        return res;
    }

    checkName(name) {
        if (typeof name !== "string") {
            throw new TypeError((typeof name) + " is not a string");
        }
        return (name.match(/^[a-zA-ZÀ-ÿ-_]+$/) != null);
    }

    checkUsername(username) {
        if (typeof username !== "string") {
            throw new TypeError((typeof name) + " is not a string");
        }
        return (username.match(/^[a-zA-Z0-9-_]+$/) != null);
    }

    checkPassword(password) {

        if (typeof password !== "string") {
            throw new TypeError((typeof name) + " is not a string");
        }
        return (password !== "" && password.length >= 8);
    }
}
```

Let's say that we want to test this class' methodes.

### Parameter types

First, we have to define the parameters type :

```javascript
const nameTestParameters = [
    new SingleAssertEqualsTestParameters("is empty", "", false),
    new SingleAssertEqualsTestParameters("contains special characters", "+=$^", false),
    new SingleAssertEqualsTestParameters("contains space", "test test", false),
    new SingleAssertEqualsTestParameters("contains numerics", "test123", false),
    new SingleAssertEqualsTestParameters("is correct", "TestT_-éÉêËàÀçÇÿ", true)
];

var nameParameterType = new ParameterType("name",nameTestParameters,"TestT_-éÉêËàÀçÇÿ",123);
```
The first parameter is a name. it should not be empty, should not contains spaces, special characters or numerics, but it can contains uppercase and accented letters, and - and _. A correct tyvaluepe could be `"TestT_-éÉêËàÀçÇÿ"` and `123` is an incorrect type because it is not a `string`.

```javascript
const usernameTestParameters = [
    new SingleAssertEqualsTestParameters("is empty", "", false),
    new SingleAssertEqualsTestParameters("contains special characters", "éàçè&+=", false),
    new SingleAssertEqualsTestParameters("is correct", "abcABC_-1234", true)
];

var usernameParameterType = new ParameterType("username",usernameTestParameters,"abcABC_-1234",123);
```

An other parameter is the username. It should not be empty nor contains special characters or accented letters, but could contains numerics. A correct value could be `"abcABC_-1234"`, and `123` is an incorrect type because it is not a `string`.

```javascript
const passwordTestParameters = [
    new SingleAssertEqualsTestParameters("is empty", "", false),
    new SingleAssertEqualsTestParameters("is less than 8 characters", "abc", false),
    new SingleAssertEqualsTestParameters("is correct", "abc132¨ê$Ç+²", true)
];

var passwordParameterType = new ParameterType("password",passwordTestParameters,"abc132¨ê$Ç+²",123);
```

Finally, the last parameter is the password. It should not be empty and should be at least 8 characters.  A correct value could be `"abc132¨ê$Ç+²"`, and `123` is an incorrect type because it is not a `string`.

Now we have all the types defined, we just have to set the function testers

### Function testers

```javascript
const userUtils = new UserUtils(logger);

var checkNameTester = new FunctionWithReturnTester(userUtils.checkName, [{
        type:nameParameterType,
        name:"name"
    }], {
        "0":false
    }, true, userUtils);

var checkUsernameTester = new FunctionWithReturnTester(userUtils.checkUsername, [{
        type:usernameParameterType,
        name:"username"
    }],{
        "0":false
    }, true,userUtils);

var checkPasswordTester = new FunctionWithReturnTester(userUtils.checkPassword, [{
        type:passwordParameterType,
        name:"password"
    }],{
        "0":false
    }, true,userUtils);
```

These are the basic functions covering the 3 types defined. Now, Let's see hos to test the function grouping these 3.

As a reminder, the function return each wrong parameter name separated with comma. If all parameters are correct, it returns an empty string.

```javascript
var checkUserFormatTester = new FunctionWithReturnTester(userUtils.checkUserFormat, [
    {
        type:nameParameterType,
        name:"lastname"
    },{
        type:nameParameterType,
        name:"firstname"
    },{
        type:usernameParameterType,
        name:"username"
    },{
        type:passwordParameterType,
        name:"password"
    }],{
        "0":"lastname",
        "0,1":"lastname,firstname",
        "0,2":"lastname,username",
        "0,1,2":"lastname,firstname,username",
        "0,3":"lastname,password",
        "0,1,3":"lastname,firstname,password",
        "0,2,3":"lastname,username,password",
        "0,1,2,3":"lastname,firstname,username,password",
        "1":"firstname",
        "1,2":"firstname,username",
        "1,3":"firstname,password",
        "1,2,3":"firstname,username,password",
        "2":"username",
        "2,3":"username,password",
        "3":"password",
    }, "",userUtils);
```

Here we are!

Now, let's call those functions with mocha style :

### Usage

```javascript

describe('UserUtils', function () {

    checkNameTester.testFunction();

    checkUsernameTester.testFunction();

    checkPasswordTester.testFunction();

    checkUserFormatTester.testFunction();

});
```

That's all you have to do !

### Results

These functionTesters generates and runs 64 tests!

A little explanation : each tester
1. test that a `TypeError` is thrown if there are no parameter
2. for each parameter, test that a `TypeError` is thrown if the parameter is of the wrong type
3. test that a `TypeError` is not thrown if all parameters are correct
4. for each parameter, test the result of each `ParameterType` test
5. runs the `wrongTestsSuiteResult` if the tester is a `FunctionWithReturnTester`
6. runs the `complementaryTestSuite`
