// ModelJS
var modeljs = (function() {
  var schema = {
    // common to all entities:
    _Base: { 
      attrs: ['name']
    },
    // entities:  
    Country: { 
      attrs: ['abbr']
    },
    State: { 
      attrs: ['abbr'], 
      relsToOne: ['Country']
    },
    City: { 
      relsToOne: ['State']
    }
  };
  var config = {
    pluralization: {
      Country: 'Countries',
      City: 'Cities'
    }
  };
  return new ModelJS(schema, config);
})();

var helpers = {
  cleanStorage: function() {
    modeljs.storage.clean();
    console.log(localStorage.length);
  },

  insertData: function() {
    var br = modeljs.save('Country', {name: 'Brazil', abbr: 'BR'});
    var rs = modeljs.save('State', {name: 'Rio Grande do Sul', abbr: 'RS', _countryId: br.id});
    var sc = modeljs.save('State', {name: 'Santa Catarina', abbr: 'SC', _countryId: br.id});
    var feliz = modeljs.save('City', {name: 'Feliz', _stateId: rs.id});
    var poa = modeljs.save('City', {name: 'Porto Alegre', _stateId: rs.id});
    var floripa = modeljs.save('City', {name: 'Florianópolis', _stateId: sc.id});
    var garopaba = modeljs.save('City', {name: 'Garopaba', _stateId: sc.id});

    var us = modeljs.save('Country', {name: 'United States', abbr: 'US'});
    var ny = modeljs.save('State', {name: 'New York', abbr: 'NY', _countryId: us.id});
    var ca = modeljs.save('State', {name: 'California', abbr: 'CA', _countryId: us.id});
    var nyc = modeljs.save('City', {name: 'New York', _stateId: ny.id});
    var la = modeljs.save('City', {name: 'Los Angeles', _stateId: ca.id});
    var sf = modeljs.save('City', {name: 'San Francisco', _stateId: ca.id});
  },
  reset: function() {
    helpers.cleanStorage();
    window.location.reload();
  }
};

if (localStorage.length === 0) {
  helpers.insertData();
}

// AngularJS
var app = angular.module('modeljs-ex-01', []);

app.service('dataService', function() {
  this.getCountries = function() {
    // mocked call to your API or whatever
    return modeljs.all('Country');
  };
});

app.controller('mainCtrl', ['$scope', 'dataService', function($scope, dataService) {

  $scope.nameAndAbbr = function(obj) {
    return ':0 (:1)'
    .replace(':0', obj.name)
    .replace(':1', obj.abbr)
    ;
  };

  $scope.selectCountry = function(index) {
    $scope.selectedCountry = $scope.countries[index];
    $scope.selectFirstState();
  };

  $scope.selectState = function(index) {
    if ($scope.selectedCountry) {
      $scope.selectedState = $scope.selectedCountry.States[index];
    } else {
      $scope.selectedState = undefined;
    }
    $scope.selectFirstCity();
  };

  $scope.selectCity = function(index) {
    if ($scope.selectedState) {
      $scope.selectedCity = $scope.selectedState.Cities[index];
    } else {
      $scope.selectedCity = undefined;
    }
  };

  $scope.selectFirstCountry = function() {
    $scope.selectCountry(0);
  };

  $scope.selectFirstState = function() {
    $scope.selectState(0);
  };

  $scope.selectFirstCity = function() {
    $scope.selectCity(0);
  };

  $scope.selectLastCountry = function() {
    $scope.selectCountry($scope.countries.length-1);
  };

  $scope.selectLastState = function() {
    $scope.selectState($scope.selectedCountry.States.length-1);
  };

  $scope.selectLastCity = function() {
    $scope.selectCity($scope.selectedState.Cities.length-1);
  };

  $scope.changeCountry = function() {
    $scope.selectedState = $scope.selectedCountry.States[0];
    $scope.changeState();
  };

  $scope.changeState = function() {
    $scope.selectedCity = $scope.selectedState.Cities[0];
  };

  $scope.saveCountry = function() {
    $scope.selectedCountry && $scope.selectedCountry.save();
  };

  $scope.saveState = function() {
    $scope.selectedState && $scope.selectedState.save();
  };

  $scope.saveCity = function() {
    $scope.selectedCity && $scope.selectedCity.save();
  };

  $scope.newCountry = function() {
    modeljs.save('Country', {name: 'New country ' + modeljs.count('Country'), abbr: 'Abbr'});
    $scope.loadCountries();
    $scope.selectLastCountry();
    $scope.newState();
  };

  $scope.newState = function() {
    modeljs.save('State', {name: 'New state ' + modeljs.count('State'), abbr: 'Abbr', _countryId: $scope.selectedCountry.id});
    $scope.selectLastState();
    $scope.newCity();
  };

  $scope.newCity = function() {
    modeljs.save('City', {name: 'New city ' + modeljs.count('City'), _stateId: $scope.selectedState.id});
    $scope.selectLastCity();
  };

  $scope.deleteCountry = function() {
    if ($scope.selectedCountry) {   
      $scope.selectedCountry.delete();
      // remove the country from the local array. this is done by modeljs in the inverse relationship arrays
      $scope.countries.splice($scope.countries.indexOf($scope.selectedCountry), 1);
      $scope.selectFirstCountry();
    }
  };

  $scope.deleteState = function() {
    if ($scope.selectedState) {
      $scope.selectedState.delete();
      $scope.selectFirstState();      
    }
  };

  $scope.deleteCity = function() {
    if ($scope.selectedCity) {
      $scope.selectedCity.delete();
      $scope.selectFirstCity();     
    }
  };

  $scope.loadCountries = function() {
    $scope.countries = dataService.getCountries();    
  }

  var init = function() {
    $scope.loadCountries();
    $scope.selectFirstCountry();
  };

  init();

}]);
