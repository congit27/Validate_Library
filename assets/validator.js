function Validator(options) {
    const $ = document.querySelector.bind(document)
    const $$ = document.querySelectorAll.bind(document) 

    // Get parent element function 
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {} 

    // validate function
    function validate(inputElement, rule) {
        var rules = selectorRules[rule.selector] // Get all rules of 1 selector
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage

        // Loop rules + test
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break
                default:
                    errorMessage =  rules[i](inputElement.value)
            }
            if(errorMessage) break
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    var formElement = $(options.form) // Get form Element

    if(formElement) {
        // When clicked submit button 
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isFormValid = true
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })

            if(isFormValid) {
                // Case submit with Javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.mathes(':checked')) {
                                    values[input.name] = []
                                    return values
                                }
                                if(Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file' :
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {}) 
                    options.onSubmit(formValues)
                } 
            } else {
                console.log('Error!')
            }
        }
         // Loop Rules + handle
        options.rules.forEach(function(rule) {
            // Save all rules into selectorRules
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test) 
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
           
            Array.from(inputElements).forEach(function(inputElement) {
                if(inputElement) {
                    // When blur out input
                    inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
    
                    // When change input value change
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
                }
            })
        })
    }
}


// Define rules
// Rules :
// 1. having error case -> error message
// 2. valid case -> nothing(undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : message
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message 
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined :message
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message
        }
    }
}

Validator({
    form: '#form-1',
    errorSelector: '.form-msg',
    formGroupSelector: '.form-group',
    rules: [
        Validator.isRequired('#fullname', 'Vui lòng không để trống thông tin.'),
        Validator.isRequired('#email', 'Vui lòng không để trống thông tin.'),
        Validator.isEmail('#email', 'Email không hợp lệ vui lòng nhập lại'),
        Validator.isRequired('#password', 'Vui lòng không để trống thông tin.'),
        Validator.minLength('#password', 6, 'Mật khẩu tối thiếu cần 6 kí tự'),
        Validator.isRequired('#password-confirmation', 'Vui lòng không để trống thông tin.'),
        Validator.isConfirmed('#password-confirmation', function() { 
            return document.querySelector('#form-1 #password').value
        }, 'Mật khẩu không khớp, vui lòng nhập lại!'),
        Validator.isRequired('input[name="gender"]', 'Vui lòng chọn giới tính.'),
        Validator.isRequired('#province', 'Vui lòng không để trống thông tin.'),
        Validator.isRequired('#avatar', 'Vui lòng không để trống thông tin.'),
    ],
    onSubmit: function (data) {
        // Call API ...
        console.log(data);
    }
})