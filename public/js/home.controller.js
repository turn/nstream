'use strict';

var moduleName = 'TurnStreamingApp';
var module = angular.module(moduleName, ['nvd3']);

module.controller(
    'HomeController', [
        function() {
            var _self = this;

            _self.test = "test123";
        }
    ]
);